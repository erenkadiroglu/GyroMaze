import { Injectable } from '@nestjs/common';
import { networkInterfaces, type NetworkInterfaceInfo } from 'os';
import {
  RoomState,
  RoomErrorPayload,
  LeaderboardEntry,
  SubmitScorePayload,
} from '@gyromaze/shared';

/**
 * Soket kimliğinin hangi odada ve hangi rolde bulunduğunu tutan hızlı arama kaydı.
 */
interface SocketMembership {
  roomId: string;
  role: 'host' | 'controller';
  playerSlot?: 1 | 2;
}

const VIRTUAL_IFACE_PATTERN =
  /(vethernet|wsl|docker|virtualbox|vbox|vmware|hyper-v|tailscale|zerotier|hamachi|loopback|\btun\d*|\btap\d*)/i;
const PHYSICAL_IFACE_PATTERN = /(wi-fi|wifi|wlan|ethernet|\ben\d|\beth\d)/i;

function isPrivate172(address: string): boolean {
  if (!address.startsWith('172.')) return false;
  const secondOctet = Number(address.split('.')[1]);
  return Number.isInteger(secondOctet) && secondOctet >= 16 && secondOctet <= 31;
}

function isCgnat100(address: string): boolean {
  if (!address.startsWith('100.')) return false;
  const secondOctet = Number(address.split('.')[1]);
  return Number.isInteger(secondOctet) && secondOctet >= 64 && secondOctet <= 127;
}

/**
 * Ağ arayüzleri arasından sanal adaptörleri (WSL, Hyper-V, Docker, VPN) ve
 * geçersiz link-local (169.254.x.x) adresleri eleyerek gerçek LAN IPv4 adresini seçer.
 */
export function selectPreferredLanIp(
  nets: NodeJS.Dict<NetworkInterfaceInfo[]>,
): string | undefined {
  let best: { address: string; score: number } | undefined;

  for (const [ifaceName, interfaces] of Object.entries(nets)) {
    if (!interfaces) continue;
    for (const net of interfaces) {
      if (net.family !== 'IPv4' || net.internal) continue;
      if (net.address.startsWith('169.254.')) continue;

      let score = 0;
      if (VIRTUAL_IFACE_PATTERN.test(ifaceName)) score -= 50;
      else if (PHYSICAL_IFACE_PATTERN.test(ifaceName)) score += 20;

      if (net.address.startsWith('192.168.')) score += 30;
      else if (net.address.startsWith('10.')) score += 20;
      else if (isPrivate172(net.address)) score += 10;
      else if (isCgnat100(net.address)) score -= 20;

      if (!best || score > best.score) {
        best = { address: net.address, score };
      }
    }
  }

  return best?.address;
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

  /**
   * Çakışmasız 6 karakterli benzersiz oda kodu üretir.
   */
  private generateRoomCode(): string {
    let code = '';
    do {
      code = '';
      for (let i = 0; i < 6; i++) {
        const randomIndex = Math.floor(Math.random() * this.ALPHABET.length);
        code += this.ALPHABET[randomIndex];
      }
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

    this.leaderboard.push(entry);

    const grouped = new Map<number, LeaderboardEntry[]>();
    for (const item of this.leaderboard) {
      const list = grouped.get(item.levelId) ?? [];
      list.push(item);
      grouped.set(item.levelId, list);
    }

    const nextLeaderboard: LeaderboardEntry[] = [];
    for (const [, list] of grouped.entries()) {
      list.sort((a, b) => a.timeSeconds - b.timeSeconds);
      nextLeaderboard.push(...list.slice(0, 10));
    }

    this.leaderboard = nextLeaderboard;
    return this.leaderboard;
  }
}
