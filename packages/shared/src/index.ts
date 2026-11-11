/**
 * Mobil cihazın HTML5 Device Orientation API'sinden okunan
 * ve gerçek zamanlı olarak masaüstü sahnesine aktarılan jiroskop verisi.
 */
export interface GyroData {
  /** Z ekseni etrafındaki dönüş açısı (0° ile 360° arası) */
  alpha: number;
  /** X ekseni etrafındaki öne/arkaya eğim açısı (-180° ile 180° arası, Pitch) */
  beta: number;
  /** Y ekseni etrafındaki sola/sağa eğim açısı (-90° ile 90° arası, Roll) */
  gamma: number;
  /** Gecikme ölçümü için paketin üretildiği milisaniye cinsinden zaman damgası */
  timestamp: number;
}

/**
 * Kullanıcının telefonu tutuş açısını sıfır noktası (referans) kabul etmek için
 * kullanılan kalibrasyon ofset değerleri.
 */
export interface CalibrationOffset {
  betaOffset: number;
  gammaOffset: number;
}

/**
 * Oyunun anlık durumunu temsil eden durum tipi.
 */
export type GameStatus = 'waiting' | 'ready' | 'playing' | 'paused' | 'won';

/**
 * Socket.io üzerinden istemci ve sunucu arasında kullanılan
 * standart oda, oyun ve telemetri olay (event) isimleri.
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
}

/**
 * Oda oluşturma ve eşleşme durumunu temsil eden temel arayüz.
 */
export interface RoomState {
  /** 6 karakterli benzersiz alfanümerik oda kodu */
  roomId: string;
  /** Masaüstü (Host) soket kimliği */
  hostSocketId: string;
  /** Mobil kontrolcü soket kimliği (bağlı değilse null) */
  controllerSocketId: string | null;
  /** Mobil kontrolcünün odaya bağlı olup olmadığını belirtir */
  isControllerConnected: boolean;
  /** Odanın oluşturulma zamanı (ms) */
  createdAt: number;
  /** Mobil cihazların QR kod ile doğrudan bağlanabilmesi için sunucunun yerel ağ (LAN) IPv4 adresi */
  lanIp?: string;
}

/**
 * Mobil istemcinin odaya katılırken gönderdiği veri yükü.
 */
export interface JoinRoomPayload {
  roomId: string;
}

/**
 * Mobil istemcinin jiroskop verisini gönderirken kullandığı veri yükü.
 */
export interface GyroUpdatePayload {
  roomId: string;
  data: GyroData;
}

/**
 * Oyun durumu güncellemeleri için kullanılan veri yükü.
 */
export interface GameStatePayload {
  roomId: string;
  status: GameStatus;
  level?: number;
}

/**
 * Oda hatalarında dönülen standart hata yanıtı.
 */
export interface RoomErrorPayload {
  code: 'ROOM_NOT_FOUND' | 'ROOM_FULL' | 'INVALID_PAYLOAD';
  message: string;
}
