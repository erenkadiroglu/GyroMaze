import type { GyroData } from './gyro';

/**
 * Socket.io üzerinden istemci ve sunucu arasında kullanılan
 * standart oda, oyun, liderlik tablosu ve telemetri olay (event) isimleri.
 */
export enum RoomEvents {
  /** Masaüstü istemcisi yeni bir oda oluşturmak istediğinde */
  ROOM_CREATE = 'room:create',
  /** Sunucu odayı başarıyla oluşturduğunda */
  ROOM_CREATED = 'room:created',
  /** Mobil kontrolcü QR kod ile odaya katılmak istediğinde */
  ROOM_JOIN = 'room:join',
  /** Mobil kontrolcü ve masaüstü başarıyla eşleştiğinde */
  ROOM_PAIRED = 'room:paired',
  /** Mobil kontrolcünün bağlantısı koptuğunda */
  ROOM_CONTROLLER_DISCONNECTED = 'room:controller_disconnected',
  /** Masaüstü ana ekranın bağlantısı koptuğunda */
  ROOM_HOST_DISCONNECTED = 'room:host_disconnected',
  /** Oda bulunamadığında veya dolu olduğunda */
  ROOM_ERROR = 'room:error',
  /** Ağ gecikmesini (RTT) ölçmek için hafif ping olayı */
  ROOM_PING = 'room:ping',
  /** Mobil cihazdan sunucuya gönderilen anlık jiroskop verisi */
  GYRO_UPDATE = 'gyro:update',
  /** Sunucudan masaüstü sahneye aktarılan senkronize jiroskop verisi */
  GYRO_SYNC = 'gyro:sync',
  /** Mobil cihazda kalibrasyon yapıldığında masaüstüne bildirim */
  GYRO_CALIBRATE = 'gyro:calibrate',
  /** Oyun durumu değiştiğinde (başladı, duraklatıldı, kazanıldı, sıfırlandı) */
  GAME_STATE_CHANGE = 'game:state_change',
  /** Topu başlangıç noktasına sıfırlama isteği */
  GAME_RESET_BALL = 'game:reset_ball',
  /** Masaüstündeki fiziksel etkileşimleri (çarpma, delik, zafer) mobil titreşime iletme */
  GAME_HAPTIC = 'game:haptic',
  /** Mobil kontrolcüden sonraki bölüme geçme veya belirli bir bölümü seçme isteği */
  GAME_CHANGE_LEVEL = 'game:change_level',
  /** Bölüm tamamlandığında sunucu skor tablosuna süre kaydetme */
  LEADERBOARD_SUBMIT = 'leaderboard:submit',
  /** Güncel skor tablosunun tüm istemcilere yayınlanması */
  LEADERBOARD_UPDATE = 'leaderboard:update',
}

/**
 * Oda oluşturma ve eşleşme durumunu temsil eden temel arayüz.
 */
export interface RoomState {
  /** 6 karakterli benzersiz alfanümerik oda kodu */
  roomId: string;
  /** Masaüstü (Host) soket kimliği */
  hostSocketId: string;
  /** 1. Mobil kontrolcü soket kimliği (bağlı değilse null) */
  controllerSocketId: string | null;
  /** 1. Mobil kontrolcünün odaya bağlı olup olmadığını belirtir */
  isControllerConnected: boolean;
  /** Çok oyunculu modda 2. Mobil kontrolcü soket kimliği */
  secondControllerSocketId?: string | null;
  /** 2. Mobil kontrolcünün odaya bağlı olup olmadığını belirtir */
  isSecondControllerConnected?: boolean;
  /** Odanın oluşturulma zamanı (ms) */
  createdAt: number;
  /** Mobil cihazların QR kod ile doğrudan bağlanabilmesi için sunucunun yerel ağ (LAN) IPv4 adresi */
  lanIp?: string;
  /** Aktif bir HTTPS tüneli (ngrok vb.) varsa genel erişim adresi */
  tunnelUrl?: string;
}

/**
 * Mobil istemcinin odaya katılırken gönderdiği veri yükü.
 */
export interface JoinRoomPayload {
  roomId: string;
  playerSlot?: 1 | 2;
}

/**
 * Mobil istemcinin jiroskop verisini gönderirken kullandığı veri yükü.
 */
export interface GyroUpdatePayload {
  roomId: string;
  data: GyroData;
}

/**
 * Oda hatalarında dönülen standart hata yanıtı.
 */
export interface RoomErrorPayload {
  code: 'ROOM_NOT_FOUND' | 'ROOM_FULL' | 'INVALID_PAYLOAD' | 'SESSION_REPLACED';
  message: string;
}

