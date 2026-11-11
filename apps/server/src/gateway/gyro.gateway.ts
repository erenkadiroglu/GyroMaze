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
  HapticPayload,
  SubmitScorePayload,
} from '@gyromaze/shared';
import { RoomService } from './room.service';

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
    if (!payload?.roomId) {
      client.emit(RoomEvents.ROOM_ERROR, {
        code: 'INVALID_PAYLOAD',
        message: 'Geçersiz oda kodu gönderildi.',
      });
      return;
    }

    const result = this.roomService.joinRoom(payload.roomId, client.id);
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
    const targetRoomId = membership?.roomId ?? payload?.roomId;
    if (!targetRoomId || !payload?.data) {
      return;
    }

    const room = this.roomService.getRoom(targetRoomId);
    if (!room) {
      return;
    }

    this.server
      .to(room.hostSocketId)
      .volatile.emit(RoomEvents.GYRO_SYNC, payload.data);
  }

  /**
   * Mobil cihazda kalibrasyon yapıldığında masaüstü sahnesini bilgilendirir.
   */
  @SubscribeMessage(RoomEvents.GYRO_CALIBRATE)
  public handleGyroCalibrate(@ConnectedSocket() client: Socket): void {
    const membership = this.roomService.getMembership(client.id);
    if (!membership) {
      return;
    }

    const room = this.roomService.getRoom(membership.roomId);
    if (room) {
      this.server.to(room.hostSocketId).emit(RoomEvents.GYRO_CALIBRATE);
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
    const roomId = membership?.roomId ?? payload?.roomId;
    if (!roomId) return;

    const room = this.roomService.getRoom(roomId);
    if (room?.controllerSocketId) {
      this.server
        .to(room.controllerSocketId)
        .volatile.emit(RoomEvents.GAME_HAPTIC, payload);
    }
  }

  /**
   * Oyun durumu değişimlerini (playing, paused, won) odadaki tüm cihazlara senkronize eder.
   */
  @SubscribeMessage(RoomEvents.GAME_STATE_CHANGE)
  public handleGameStateChange(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: GameStatePayload,
  ): void {
    const membership = this.roomService.getMembership(client.id);
    const roomId = membership?.roomId ?? payload?.roomId;
    if (!roomId) {
      return;
    }

    this.server.to(roomId).emit(RoomEvents.GAME_STATE_CHANGE, payload);
  }

  /**
   * Oyuncunun tamamladığı bölüm süresini küresel skor tablosuna ekler ve tüm istemcilere yayınlar.
   */
  @SubscribeMessage(RoomEvents.LEADERBOARD_SUBMIT)
  public handleSubmitScore(
    @MessageBody() payload: SubmitScorePayload,
  ): void {
    if (!payload?.levelId || typeof payload.timeSeconds !== 'number') {
      return;
    }

    const updated = this.roomService.submitScore(payload);
    this.server.emit(RoomEvents.LEADERBOARD_UPDATE, updated);
  }
}
