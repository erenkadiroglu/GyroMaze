import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import {
  RoomEvents,
  JoinRoomPayload,
  GyroUpdatePayload,
  GameStatePayload,
  GameStatus,
  ChangeLevelPayload,
  HapticPayload,
  HapticType,
  SubmitScorePayload,
} from '@gyromaze/shared';
import { RoomService } from './room.service';

const VALID_HAPTIC_TYPES: ReadonlySet<string> = new Set<HapticType>([
  'wall',
  'hole',
  'goal',
  'calibrate',
  'crystal',
  'laser',
  'boost',
  'teleport',
]);

const VALID_GAME_STATUSES: ReadonlySet<string> = new Set<GameStatus>([
  'waiting',
  'ready',
  'playing',
  'paused',
  'won',
  'lost',
]);

function matchesOptionalRoomId(roomId: unknown, expectedRoomId: string): boolean {
  if (roomId === undefined || roomId === '') {
    return true;
  }
  return typeof roomId === 'string' && roomId.trim() === expectedRoomId;
}

/**
 * GyroMaze gerçek zamanlı WebSocket ağ geçidi.
 * Mobil jiroskop sensör paketlerini <10ms gecikmeyle masaüstü 3B sahnesine aktarır.
 */
@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
  transports: ['websocket', 'polling'],
})
export class GyroGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  private readonly server!: Server;

  private readonly logger = new Logger(GyroGateway.name);

  constructor(private readonly roomService: RoomService) {}

  /**
   * Yeni bir istemci bağlandığında tetiklenir.
   */
  public handleConnection(client: Socket): void {
    this.logger.log(`İstemci bağlandı: ${client.id}`);
  }

  /**
   * Bir istemcinin bağlantısı koptuğunda ilgili odayı günceller ve karşı cihazı bilgilendirir.
   */
  public handleDisconnect(client: Socket): void {
    const removal = this.roomService.removeSocket(client.id);
    if (!removal) {
      return;
    }

    if (removal.disconnectedRole === 'controller' && removal.remainingRoom) {
      this.logger.warn(
        `Mobil kontrolcü odadan ayrıldı: ${removal.roomId} (${client.id})`,
      );
      this.server
        .to(removal.remainingRoom.hostSocketId)
        .emit(RoomEvents.ROOM_CONTROLLER_DISCONNECTED, removal.remainingRoom);
    } else if (removal.disconnectedRole === 'host') {
      this.logger.warn(
        `Masaüstü oturumu kapandı, oda silindi: ${removal.roomId}`,
      );
      this.server
        .to(removal.roomId)
        .emit(RoomEvents.ROOM_HOST_DISCONNECTED, { roomId: removal.roomId });
    }
  }

  /**
   * Masaüstü istemcisi için yeni bir oyun odası oluşturur.
   */
  @SubscribeMessage(RoomEvents.ROOM_CREATE)
  public async handleCreateRoom(@ConnectedSocket() client: Socket): Promise<void> {
    const room = await this.roomService.createRoom(client.id);
    await client.join(room.roomId);
    this.logger.log(
      `Yeni oda oluşturuldu: ${room.roomId} (Host: ${client.id}, Tunnel: ${room.tunnelUrl ?? 'Yok'})`,
    );
    client.emit(RoomEvents.ROOM_CREATED, room);
    client.emit(
      RoomEvents.LEADERBOARD_UPDATE,
      this.roomService.getLeaderboard(),
    );
  }

  /**
   * Mobil kontrolcüyü QR kod ile taranan odaya dahil eder.
   */
  @SubscribeMessage(RoomEvents.ROOM_JOIN)
  public async handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: JoinRoomPayload,
  ): Promise<void> {
    if (
      !payload ||
      typeof payload.roomId !== 'string' ||
      !payload.roomId.trim()
    ) {
      client.emit(RoomEvents.ROOM_ERROR, {
        code: 'INVALID_PAYLOAD',
        message: 'Geçersiz oda kodu gönderildi.',
      });
      return;
    }

    const result = this.roomService.joinRoom(
      payload.roomId,
      client.id,
      payload.playerSlot,
    );
    if (!result.ok) {
      client.emit(RoomEvents.ROOM_ERROR, result.error);
      return;
    }

    if (result.previousRoomId) {
      await client.leave(result.previousRoomId);
      const prevRoom = this.roomService.getRoom(result.previousRoomId);
      if (prevRoom) {
        this.server
          .to(prevRoom.hostSocketId)
          .emit(RoomEvents.ROOM_CONTROLLER_DISCONNECTED, prevRoom);
      }
    }

    await client.join(result.room.roomId);

    if (result.replacedControllerSocketId) {
      const oldSocket = this.server.sockets?.sockets?.get(
        result.replacedControllerSocketId,
      );
      if (oldSocket) {
        await oldSocket.leave(result.room.roomId);
      }
      this.server.to(result.replacedControllerSocketId).emit(RoomEvents.ROOM_ERROR, {
        code: 'SESSION_REPLACED',
        message: 'Bu oyuncu yuvası başka bir cihaz veya sekme tarafından devralındı.',
      });
    }

    this.logger.log(
      `Mobil kontrolcü eşleşti: Oda ${result.room.roomId} (Controller: ${client.id})`,
    );

    this.server.to(result.room.roomId).emit(RoomEvents.ROOM_PAIRED, result.room);
  }

  /**
   * 60Hz frekansında gelen mobil jiroskop verisini doğrudan masaüstü istemcisine iletir.
   * Kuyruk birikmesini önlemek için volatile yayın kullanılır.
   */
  @SubscribeMessage(RoomEvents.GYRO_UPDATE)
  public handleGyroUpdate(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: GyroUpdatePayload,
  ): void {
    const membership = this.roomService.getMembership(client.id);
    if (!membership || membership.role !== 'controller' || !payload?.data) {
      return;
    }

    const room = this.roomService.getRoom(membership.roomId);
    if (!room) {
      return;
    }

    const { beta, gamma, alpha, timestamp } = payload.data;
    if (
      typeof beta !== 'number' ||
      !Number.isFinite(beta) ||
      typeof gamma !== 'number' ||
      !Number.isFinite(gamma)
    ) {
      return;
    }

    const clampedBeta = Math.max(-45, Math.min(45, beta));
    const clampedGamma = Math.max(-45, Math.min(45, gamma));
    const safeAlpha =
      typeof alpha === 'number' && Number.isFinite(alpha) ? alpha : 0;
    const safeTimestamp =
      typeof timestamp === 'number' && Number.isFinite(timestamp)
        ? timestamp
        : Date.now();

    const slot = membership.playerSlot ?? payload.data.playerSlot ?? 1;
    this.server.to(room.hostSocketId).volatile.emit(RoomEvents.GYRO_SYNC, {
      alpha: safeAlpha,
      beta: clampedBeta,
      gamma: clampedGamma,
      timestamp: safeTimestamp,
      playerSlot: slot,
    });
  }

  /**
   * Mobil cihazda kalibrasyon yapıldığında masaüstü sahnesini yalnız ilgili oyuncu yuvasıyla bilgilendirir.
   */
  @SubscribeMessage(RoomEvents.GYRO_CALIBRATE)
  public handleGyroCalibrate(@ConnectedSocket() client: Socket): void {
    const membership = this.roomService.getMembership(client.id);
    if (!membership || membership.role !== 'controller') {
      return;
    }

    const room = this.roomService.getRoom(membership.roomId);
    if (room) {
      this.server.to(room.hostSocketId).emit(RoomEvents.GYRO_CALIBRATE, {
        playerSlot: membership.playerSlot ?? 1,
      });
    }
  }

  /**
   * Mobil veya masaüstünden gelen top sıfırlama isteğini odaya iletir.
   */
  @SubscribeMessage(RoomEvents.GAME_RESET_BALL)
  public handleResetBall(@ConnectedSocket() client: Socket): void {
    const membership = this.roomService.getMembership(client.id);
    if (!membership) {
      return;
    }

    this.server.to(membership.roomId).emit(RoomEvents.GAME_RESET_BALL);
  }

  /**
   * Masaüstündeki fiziksel çarpışma/delik/hedef olaylarını mobil kontrolcüye titreşim olarak iletir.
   */
  @SubscribeMessage(RoomEvents.GAME_HAPTIC)
  public handleGameHaptic(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: HapticPayload,
  ): void {
    const membership = this.roomService.getMembership(client.id);
    if (
      !membership ||
      membership.role !== 'host' ||
      !payload ||
      typeof payload.type !== 'string' ||
      !VALID_HAPTIC_TYPES.has(payload.type)
    ) {
      return;
    }
    if (!matchesOptionalRoomId(payload.roomId, membership.roomId)) {
      return;
    }

    const room = this.roomService.getRoom(membership.roomId);
    if (!room) return;

    const syncedPayload: HapticPayload = {
      ...payload,
      roomId: membership.roomId,
    };
    const sendToSlot1 = !payload.playerSlot || payload.playerSlot === 1;
    const sendToSlot2 = !payload.playerSlot || payload.playerSlot === 2;

    if (sendToSlot1 && room.controllerSocketId) {
      this.server
        .to(room.controllerSocketId)
        .volatile.emit(RoomEvents.GAME_HAPTIC, syncedPayload);
    }
    if (sendToSlot2 && room.secondControllerSocketId) {
      this.server
        .to(room.secondControllerSocketId)
        .volatile.emit(RoomEvents.GAME_HAPTIC, syncedPayload);
    }
  }

  /**
   * Oyun durumu değişimlerini (playing, paused, won, level, kristal sayısı) odadaki kontrolcülere senkronize eder.
   */
  @SubscribeMessage(RoomEvents.GAME_STATE_CHANGE)
  public handleGameStateChange(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: GameStatePayload,
  ): void {
    const membership = this.roomService.getMembership(client.id);
    if (
      !membership ||
      membership.role !== 'host' ||
      !payload ||
      typeof payload.status !== 'string' ||
      !VALID_GAME_STATUSES.has(payload.status)
    ) {
      return;
    }
    if (!matchesOptionalRoomId(payload.roomId, membership.roomId)) {
      return;
    }

    const room = this.roomService.getRoom(membership.roomId);
    if (!room) return;

    const syncedPayload: GameStatePayload = {
      ...payload,
      roomId: membership.roomId,
    };
    if (room.controllerSocketId) {
      this.server
        .to(room.controllerSocketId)
        .emit(RoomEvents.GAME_STATE_CHANGE, syncedPayload);
    }
    if (room.secondControllerSocketId) {
      this.server
        .to(room.secondControllerSocketId)
        .emit(RoomEvents.GAME_STATE_CHANGE, syncedPayload);
    }
  }

  /**
   * Mobil kontrolcüden gelen bölüm değiştirme isteğini masaüstü sahnesine iletir.
   */
  @SubscribeMessage(RoomEvents.GAME_CHANGE_LEVEL)
  public handleChangeLevel(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: ChangeLevelPayload,
  ): void {
    const membership = this.roomService.getMembership(client.id);
    if (!membership || membership.role !== 'controller' || !payload) {
      return;
    }
    if (!matchesOptionalRoomId(payload.roomId, membership.roomId)) {
      return;
    }

    const validDirection =
      payload.direction === 'next' || payload.direction === 'prev';
    const validLevel =
      typeof payload.level === 'number' &&
      Number.isInteger(payload.level) &&
      payload.level >= 1;
    if (!validDirection && !validLevel) {
      return;
    }

    const room = this.roomService.getRoom(membership.roomId);
    if (room) {
      this.server.to(room.hostSocketId).emit(RoomEvents.GAME_CHANGE_LEVEL, {
        ...payload,
        roomId: membership.roomId,
      });
    }
  }

  /**
   * Oyuncunun tamamladığı bölüm süresini küresel skor tablosuna ekler ve tüm istemcilere yayınlar.
   */
  @SubscribeMessage(RoomEvents.LEADERBOARD_SUBMIT)
  public handleSubmitScore(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: SubmitScorePayload,
  ): void {
    const membership = this.roomService.getMembership(client.id);
    if (!membership || membership.role !== 'host') {
      return;
    }

    if (
      !payload ||
      !Number.isInteger(payload.levelId) ||
      payload.levelId < 1 ||
      payload.levelId === 99 ||
      typeof payload.timeSeconds !== 'number' ||
      !Number.isFinite(payload.timeSeconds) ||
      payload.timeSeconds <= 0 ||
      payload.timeSeconds > 3600
    ) {
      return;
    }

    const updated = this.roomService.submitScore(payload);
    this.server.emit(RoomEvents.LEADERBOARD_UPDATE, updated);
  }

  /**
   * Masaüstü istemcisinin gerçek ağ gecikmesini (RTT) ölçmesi için anlık onay döner.
   */
  @SubscribeMessage(RoomEvents.ROOM_PING)
  public handlePing(): number {
    return Date.now();
  }
}
