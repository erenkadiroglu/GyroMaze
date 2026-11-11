import { Injectable } from '@nestjs/common';
import { networkInterfaces } from 'os';
import { RoomState, RoomErrorPayload } from '@gyromaze/shared';

/**
 * Soket kimliğinin hangi odada ve hangi rolde bulunduğunu tutan hızlı arama kaydı.
 */
interface SocketMembership {
  roomId: string;
  role: 'host' | 'controller';
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
    const nets = networkInterfaces();
    for (const name of Object.keys(nets)) {
      const interfaces = nets[name];
      if (!interfaces) continue;
      for (const net of interfaces) {
        if (net.family === 'IPv4' && !net.internal) {
          return net.address;
        }
      }
    }
    return undefined;
  }

  /**
   * Eğer yerel makinede aktif bir ngrok HTTPS tüneli çalışıyorsa (127.0.0.1:4040),
   * genel HTTPS adresini otomatik olarak tespit eder.
   */
  private async detectActiveTunnelUrl(): Promise<string | undefined> {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 350);
      const response = await fetch('http://127.0.0.1:4040/api/tunnels', {
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (!response.ok) return undefined;
      const data = (await response.json()) as NgrokTunnelResponse;
      const httpsTunnel = data.tunnels?.find((t) =>
        t.public_url?.startsWith('https://'),
      );
      return httpsTunnel?.public_url;
    } catch {
      return undefined;
    }
  }

  /**
   * Masaüstü istemcisi (Host) için yeni bir oyun odası oluşturur.
   */
  public async createRoom(hostSocketId: string): Promise<RoomState> {
    this.removeSocket(hostSocketId);

    const roomId = this.generateRoomCode();
    const tunnelUrl = await this.detectActiveTunnelUrl();

    const roomState: RoomState = {
      roomId,
      hostSocketId,
      controllerSocketId: null,
      isControllerConnected: false,
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
   */
  public joinRoom(
    rawRoomId: string,
    controllerSocketId: string,
  ): { ok: true; room: RoomState } | { ok: false; error: RoomErrorPayload } {
    const roomId = rawRoomId.trim().toUpperCase();
    const room = this.rooms.get(roomId);

    if (!room) {
      return {
        ok: false,
        error: {
          code: 'ROOM_NOT_FOUND',
          message: 'Belirtilen oda kodu bulunamadı veya süresi doldu.',
        },
      };
    }

    if (
      room.isControllerConnected &&
      room.controllerSocketId &&
      room.controllerSocketId !== controllerSocketId
    ) {
      return {
        ok: false,
        error: {
          code: 'ROOM_FULL',
          message: 'Bu odaya zaten aktif bir mobil kontrolcü bağlı.',
        },
      };
    }

    this.removeSocket(controllerSocketId);

    room.controllerSocketId = controllerSocketId;
    room.isControllerConnected = true;
    this.socketMembership.set(controllerSocketId, {
      roomId,
      role: 'controller',
    });

    return { ok: true, room };
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
      this.rooms.delete(membership.roomId);
      return {
        roomId: membership.roomId,
        disconnectedRole: 'host',
      };
    } else {
      room.controllerSocketId = null;
      room.isControllerConnected = false;
      return {
        roomId: membership.roomId,
        disconnectedRole: 'controller',
        remainingRoom: room,
      };
    }
  }
}
