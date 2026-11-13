import { Inject, Injectable, Optional } from '@nestjs/common';
import { existsSync, readFileSync } from 'fs';
import { mkdir, rename, writeFile } from 'fs/promises';
import { networkInterfaces } from 'os';
import { dirname } from 'path';
import {
  RoomState,
  RoomErrorPayload,
  LeaderboardEntry,
  SubmitScorePayload,
} from '@gyromaze/shared';
import {
  ROOM_CODE_ALPHABET,
  generateRandomCode,
  resolveLeaderboardStoragePath,
  normalizeLeaderboardEntries,
  selectPreferredLanIp,
} from './roomServiceUtils';

export { selectPreferredLanIp } from './roomServiceUtils';

export const LEADERBOARD_FILE_PATH_TOKEN = 'GYROMAZE_LEADERBOARD_FILE_PATH';

/**
 * Soket kimliğinin hangi odada ve hangi rolde bulunduğunu tutan hızlı arama kaydı.
 */
interface SocketMembership {
  roomId: string;
  role: 'host' | 'controller';
  playerSlot?: 1 | 2;
}

interface NgrokTunnelResponse {
  tunnels?: Array<{
    public_url?: string;
    proto?: string;
  }>;
}

/**
 * Bellek içi (In-Memory) O(1) erişim süreli oda ve eşleşme yönetim servisi.
 * Veritabanı gecikmesi olmadan <1ms altında oda doğrulaması ve yönlendirme sağlar.
 */
@Injectable()
export class RoomService {
  /** Oda kodu -> Oda durumu haritası */
  private readonly rooms = new Map<string, RoomState>();

  /** Soket kimliği -> Oda üyelik bilgisi haritası (O(1) kopma ve telemetri erişimi için) */
  private readonly socketMembership = new Map<string, SocketMembership>();

  /** Karışıklığı önlemek için 0/O ve 1/I/L gibi benzer karakterleri içermeyen alfabe */
  private readonly ALPHABET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';

  /** Kalıcı liderlik tablosu JSON dosya yolu (testlerde null olabilir) */
  private readonly leaderboardFilePath: string | null;

  /** Eşzamanlı skor gönderimlerini sıralayan atomik yazım kuyruğu */
  private writeChain: Promise<void> = Promise.resolve();

  /** Bölüm bazlı en hızlı tamamlama sürelerini tutan küresel skor listesi */
  private leaderboard: LeaderboardEntry[] = [
    {
      id: 'seed-1',
      playerName: 'Eren Kadiroğlu',
      levelId: 1,
      timeSeconds: 9.4,
      createdAt: Date.now() - 86400000,
    },
    {
      id: 'seed-2',
      playerName: 'Eren Kadiroğlu',
      levelId: 2,
      timeSeconds: 14.2,
      createdAt: Date.now() - 72000000,
    },
    {
      id: 'seed-3',
      playerName: 'Eren Kadiroğlu',
      levelId: 3,
      timeSeconds: 18.6,
      createdAt: Date.now() - 54000000,
    },
    {
      id: 'seed-4',
      playerName: 'Eren Kadiroğlu',
      levelId: 4,
      timeSeconds: 16.8,
      createdAt: Date.now() - 36000000,
    },
    {
      id: 'seed-5',
      playerName: 'Eren Kadiroğlu',
      levelId: 5,
      timeSeconds: 21.5,
      createdAt: Date.now() - 18000000,
    },
  ];

  constructor(
    @Optional()
    @Inject(LEADERBOARD_FILE_PATH_TOKEN)
    leaderboardFilePath?: string | null,
  ) {
    this.leaderboardFilePath = resolveLeaderboardStoragePath(leaderboardFilePath);
    this.loadPersistedLeaderboard();
  }

  private loadPersistedLeaderboard(): void {
    if (!this.leaderboardFilePath || !existsSync(this.leaderboardFilePath)) {
      return;
    }
    try {
      const raw = readFileSync(this.leaderboardFilePath, 'utf8');
      const parsed: unknown = JSON.parse(raw);
      if (!Array.isArray(parsed)) return;
      const restored = normalizeLeaderboardEntries(parsed);
      if (restored.length > 0) {
        this.leaderboard = restored;
      }
    } catch {
      // Bozuk veya okunamayan JSON durumunda varsayılan başlangıç kayıtlarıyla devam et
    }
  }

  private scheduleLeaderboardPersist(): void {
    if (!this.leaderboardFilePath) return;
    const targetPath = this.leaderboardFilePath;
    const serialized = JSON.stringify(this.leaderboard, null, 2);

    this.writeChain = this.writeChain.then(async () => {
      try {
        await mkdir(dirname(targetPath), { recursive: true });
        const tmpPath = `${targetPath}.${process.pid}.${Date.now()}.tmp`;
        await writeFile(tmpPath, serialized, 'utf8');
        await rename(tmpPath, targetPath);
      } catch {
        // Disk yazım hatası oyun odası WebSocket döngüsünü durdurmamalı
      }
    });
  }

  /**
   * Bekleyen tüm liderlik tablosu disk yazımlarının tamamlanmasını bekler.
   */
  public flushPersistence(): Promise<void> {
    return this.writeChain;
  }

  /**
   * Çakışmasız 6 karakterli benzersiz oda kodu üretir.
   */
  private generateRoomCode(): string {
    let code = '';
    do {
      code = generateRandomCode(this.ALPHABET, 6);
    } while (this.rooms.has(code));
    return code;
  }

  /**
   * Mobil cihazların QR kod üzerinden doğrudan bağlanabilmesi için
   * sunucunun çalıştığı makinenin yerel ağ (Wi-Fi / Ethernet) IPv4 adresini bulur.
   */
  private detectLanIp(): string | undefined {
    return selectPreferredLanIp(networkInterfaces());
  }

  /**
   * Eğer yerel makinede aktif bir ngrok HTTPS tüneli çalışıyorsa (127.0.0.1:4040),
   * genel HTTPS adresini otomatik olarak tespit eder.
   */
  private async detectActiveTunnelUrl(): Promise<string | undefined> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 350);
    try {
      const response = await fetch('http://127.0.0.1:4040/api/tunnels', {
        signal: controller.signal,
      });

      if (!response.ok) return undefined;
      const data = (await response.json()) as NgrokTunnelResponse;
      const httpsTunnel = data.tunnels?.find((t) =>
        t.public_url?.startsWith('https://'),
      );
      return httpsTunnel?.public_url;
    } catch {
      return undefined;
    } finally {
      clearTimeout(timeout);
    }
  }

  /**
   * Uzun süreli çalışan sunucularda terk edilmiş/zaman aşımına uğramış odaları bellekten temizler.
   */
  public pruneExpiredRooms(maxAgeMs = 12 * 60 * 60 * 1000, now = Date.now()): number {
    let pruned = 0;
    for (const [roomId, room] of this.rooms.entries()) {
      if (now - room.createdAt >= maxAgeMs) {
        this.socketMembership.delete(room.hostSocketId);
        if (room.controllerSocketId) {
          this.socketMembership.delete(room.controllerSocketId);
        }
        if (room.secondControllerSocketId) {
          this.socketMembership.delete(room.secondControllerSocketId);
        }
        this.rooms.delete(roomId);
        pruned += 1;
      }
    }
    return pruned;
  }

  /**
   * Masaüstü istemcisi (Host) için yeni bir oyun odası oluşturur.
   */
  public async createRoom(hostSocketId: string): Promise<RoomState> {
    this.removeSocket(hostSocketId);
    this.pruneExpiredRooms();

    const roomId = this.generateRoomCode();
    const tunnelUrl = await this.detectActiveTunnelUrl();

    const roomState: RoomState = {
      roomId,
      hostSocketId,
      controllerSocketId: null,
      isControllerConnected: false,
      secondControllerSocketId: null,
      isSecondControllerConnected: false,
      createdAt: Date.now(),
      lanIp: this.detectLanIp(),
      tunnelUrl,
    };

    this.rooms.set(roomId, roomState);
    this.socketMembership.set(hostSocketId, { roomId, role: 'host' });

    return roomState;
  }

  /**
   * Mobil kontrolcüyü belirtilen oda koduna bağlar.
   * Aynı odaya yeniden bağlanma veya oda değiştirme durumlarında eski soket kaydını temizler.
   */
  public joinRoom(
    rawRoomId: string,
    controllerSocketId: string,
    playerSlot?: 1 | 2,
  ):
    | {
        ok: true;
        room: RoomState;
        previousRoomId?: string;
        replacedControllerSocketId?: string;
      }
    | { ok: false; error: RoomErrorPayload } {
    if (typeof rawRoomId !== 'string') {
      return {
        ok: false,
        error: {
          code: 'INVALID_PAYLOAD',
          message: 'Geçersiz oda kodu gönderildi.',
        },
      };
    }

    const roomId = rawRoomId.trim().toUpperCase();
    const room = this.rooms.get(roomId);

    if (!room) {
      return {
        ok: false,
        error: {
          code: 'ROOM_NOT_FOUND',
          message:
            'Belirtilen 6 haneli oda kodu bulunamadı. Masaüstü ekranındaki güncel kodu kontrol edin.',
        },
      };
    }

    // Masaüstü ana oturumu kendi veya başka bir odanın kontrolcüsü olarak katılamaz
    const previousMembership = this.socketMembership.get(controllerSocketId);
    if (previousMembership?.role === 'host') {
      return {
        ok: false,
        error: {
          code: 'INVALID_PAYLOAD',
          message: 'Masaüstü ana oturumu kontrolcü olarak katılamaz.',
        },
      };
    }

    // Kontrolcü daha önce başka bir odaya bağlıysa eski odadan temizle
    const previousRoomId =
      previousMembership && previousMembership.roomId !== roomId
        ? previousMembership.roomId
        : undefined;

    this.removeSocket(controllerSocketId);

    let replacedControllerSocketId: string | undefined;

    if (playerSlot === 2) {
      if (
        room.secondControllerSocketId &&
        room.secondControllerSocketId !== controllerSocketId
      ) {
        replacedControllerSocketId = room.secondControllerSocketId;
        this.socketMembership.delete(room.secondControllerSocketId);
      }
      room.secondControllerSocketId = controllerSocketId;
      room.isSecondControllerConnected = true;
      this.socketMembership.set(controllerSocketId, {
        roomId,
        role: 'controller',
        playerSlot: 2,
      });
    } else {
      // Odada önceki sekmeden kalma eski bir 1. kontrolcü soketi varsa üyeliğini düşür
      if (
        room.controllerSocketId &&
        room.controllerSocketId !== controllerSocketId
      ) {
        replacedControllerSocketId = room.controllerSocketId;
        this.socketMembership.delete(room.controllerSocketId);
      }

      room.controllerSocketId = controllerSocketId;
      room.isControllerConnected = true;
      const membership: SocketMembership = {
        roomId,
        role: 'controller',
      };
      if (playerSlot === 1) {
        membership.playerSlot = 1;
      }
      this.socketMembership.set(controllerSocketId, membership);
    }

    return {
      ok: true,
      room,
      previousRoomId,
      replacedControllerSocketId,
    };
  }

  /**
   * Oda koduna göre mevcut oda durumunu döndürür.
   */
  public getRoom(roomId: string): RoomState | undefined {
    return this.rooms.get(roomId.trim().toUpperCase());
  }

  /**
   * Soket kimliğinden bağlı olduğu odayı O(1) karmaşıklıkta bulur.
   */
  public getMembership(socketId: string): SocketMembership | undefined {
    return this.socketMembership.get(socketId);
  }

  /**
   * Bağlantısı kopan soketi odadan çıkarır ve etkilenen karşı taraf bilgisini döner.
   */
  public removeSocket(socketId: string): {
    roomId: string;
    disconnectedRole: 'host' | 'controller';
    remainingRoom?: RoomState;
  } | null {
    const membership = this.socketMembership.get(socketId);
    if (!membership) {
      return null;
    }

    this.socketMembership.delete(socketId);
    const room = this.rooms.get(membership.roomId);
    if (!room) {
      return null;
    }

    if (membership.role === 'host') {
      if (room.controllerSocketId) {
        this.socketMembership.delete(room.controllerSocketId);
      }
      if (room.secondControllerSocketId) {
        this.socketMembership.delete(room.secondControllerSocketId);
      }
      this.rooms.delete(membership.roomId);
      return {
        roomId: membership.roomId,
        disconnectedRole: 'host',
      };
    } else {
      if (
        membership.playerSlot === 2 ||
        room.secondControllerSocketId === socketId
      ) {
        room.secondControllerSocketId = null;
        room.isSecondControllerConnected = false;
      } else {
        room.controllerSocketId = null;
        room.isControllerConnected = false;
      }
      return {
        roomId: membership.roomId,
        disconnectedRole: 'controller',
        remainingRoom: room,
      };
    }
  }

  /**
   * Mevcut küresel skor tablosunu döndürür.
   */
  public getLeaderboard(): LeaderboardEntry[] {
    return this.leaderboard;
  }

  /**
   * Sunucu sağlık kontrolü için anlık oda ve bağlı kontrolcü sayaçlarını döndürür.
   * Hassas oda kodlarını veya soket kimliklerini dışarı açmaz.
   */
  public getStats(): {
    activeRooms: number;
    connectedControllers: number;
    leaderboardEntries: number;
  } {
    let connectedControllers = 0;
    for (const room of this.rooms.values()) {
      if (room.isControllerConnected) connectedControllers += 1;
      if (room.isSecondControllerConnected) connectedControllers += 1;
    }
    return {
      activeRooms: this.rooms.size,
      connectedControllers,
      leaderboardEntries: this.leaderboard.length,
    };
  }

  /**
   * Yeni bir bölüm tamamlama skorunu kaydeder ve her bölüm için en hızlı 10 kaydı sıralar.
   */
  public submitScore(payload: SubmitScorePayload): LeaderboardEntry[] {
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
      return this.leaderboard;
    }

    const rawName = typeof payload.playerName === 'string' ? payload.playerName : '';
    const cleanName = rawName.trim().slice(0, 24) || 'Anonim Oyuncu';
    const entry: LeaderboardEntry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      playerName: cleanName,
      levelId: payload.levelId,
      timeSeconds: Number(Math.max(0.1, payload.timeSeconds).toFixed(1)),
      createdAt: Date.now(),
    };

    this.leaderboard = normalizeLeaderboardEntries([...this.leaderboard, entry]);
    this.scheduleLeaderboardPersist();
    return this.leaderboard;
  }
}
