/**
 * Oyunun anlık durumunu temsil eden durum tipi.
 */
export type GameStatus = 'waiting' | 'ready' | 'playing' | 'paused' | 'won' | 'lost';

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
 * 1. Oyuncu bilyesinin 3B materyal ve ışık kaplama (Skin) tipi.
 */
export type BallSkin = 'chrome' | 'emerald' | 'plasma' | 'crimson';

/**
 * Oyun akış modu (Standart en hızlı süre veya Geri Sayımlı Time Attack).
 */
export type GameMode = 'standard' | 'time_attack';

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

