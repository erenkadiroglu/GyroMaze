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
  /** Çok oyunculu modda veriyi gönderen oyuncu yuvası (1 veya 2) */
  playerSlot?: 1 | 2;
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
 * Mobil cihazda tetiklenecek titreşim (Haptic Feedback) tipi.
 */
export type HapticType =
  | 'wall'
  | 'hole'
  | 'goal'
  | 'calibrate'
  | 'crystal'
  | 'laser'
  | 'boost'
  | 'teleport';

/**
 * Masaüstü 3B sahne kamera bakış açısı modu.
 */
export type CameraMode = 'isometric' | 'topdown' | 'follow';

/**
 * 3B Labirent sahnesi görsel atmosfer ve ışıklandırma teması.
 */
export type BoardTheme = 'emerald' | 'cyberpunk' | 'crimson' | 'daylight';

/**
 * Uygulama genel arayüz ve 3B sahne aydınlık/karanlık renk modu.
 */
export type ColorScheme = 'dark' | 'light';

/**
 * Küresel skor tablosundaki (Leaderboard) tek bir rekor kaydı.
 */
export interface LeaderboardEntry {
  id: string;
  playerName: string;
  levelId: number;
  timeSeconds: number;
  createdAt: number;
}

/**
 * Yeni bir bölüm skoru gönderilirken kullanılan veri yükü.
 */
export interface SubmitScorePayload {
  playerName: string;
  levelId: number;
  timeSeconds: number;
}

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
 * Oyun durumu güncellemeleri için kullanılan veri yükü.
 */
export interface GameStatePayload {
  roomId: string;
  status: GameStatus;
  level?: number;
  crystalsCollected?: number;
  crystalsTotal?: number;
}

/**
 * Mobil kontrolcüden masaüstüne gönderilen bölüm değiştirme isteği.
 */
export interface ChangeLevelPayload {
  roomId: string;
  direction?: 'next' | 'prev';
  level?: number;
}

/**
 * Mobil cihazda dokunsal titreşim tetiklemek için gönderilen veri yükü.
 */
export interface HapticPayload {
  roomId: string;
  type: HapticType;
}

/**
 * Oda hatalarında dönülen standart hata yanıtı.
 */
export interface RoomErrorPayload {
  code: 'ROOM_NOT_FOUND' | 'ROOM_FULL' | 'INVALID_PAYLOAD';
  message: string;
}
