/**
 * Mobil cihazın HTML5 Device Orientation API'sinden okunan
 * ve gerçek zamanlı olarak masaüstü sahnesine aktarılan jiroskop verisi.
 */
export interface GyroData {
  /** Z ekseni etrafındaki dönüş açısı (0° ile 360° arası) */
  alpha: number;
  /** X ekseni etrafındaki öne/arkaya eğim açısı (-180° ile 180° arası) */
  beta: number;
  /** Y ekseni etrafındaki sola/sağa eğim açısı (-90° ile 90° arası) */
  gamma: number;
  /** Gecikme ölçümü için paketin üretildiği milisaniye cinsinden zaman damgası */
  timestamp: number;
}

/**
 * Socket.io üzerinden istemci ve sunucu arasında kullanılan
 * standart oda ve telemetri olay (event) isimleri.
 */
export enum RoomEvents {
  ROOM_CREATE = 'room:create',
  ROOM_CREATED = 'room:created',
  ROOM_JOIN = 'room:join',
  ROOM_PAIRED = 'room:paired',
  ROOM_ERROR = 'room:error',
  GYRO_UPDATE = 'gyro:update',
  GYRO_SYNC = 'gyro:sync',
  GYRO_CALIBRATE = 'gyro:calibrate',
}

/**
 * Oda oluşturma ve eşleşme durumunu temsil eden temel arayüz.
 */
export interface RoomState {
  /** 6 karakterli benzersiz oda kodu */
  roomId: string;
  /** Mobil kontrolcünün odaya bağlı olup olmadığını belirtir */
  isControllerConnected: boolean;
}
