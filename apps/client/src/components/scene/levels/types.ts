/**
 * Labirent içindeki tek bir duvar bloğunun konum ve boyut tanımı.
 */
export interface WallDefinition {
  /** [x, y, z] merkez koordinatları */
  position: [number, number, number];
  /** [genişlik, yükseklik, derinlik] boyutları */
  size: [number, number, number];
}

/**
 * Labirent zemininde bilyenin içine düşebileceği tuzak deliklerinin (Void Hole) koordinat tanımı.
 */
export interface VoidHoleDefinition {
  /** [x, z] düzlem koordinatları */
  position: [number, number];
  /** Delik yarıçapı (varsayılan 0.42) */
  radius?: number;
}

/**
 * Belirli periyotlarla açılıp kapanan enerji lazer kapısı tanımı.
 */
export interface LaserGateDefinition {
  /** [x, z] merkez koordinatları */
  position: [number, number];
  /** Lazer ışınının uzunluğu */
  length: number;
  /** Lazerin uzandığı eksen ('x' yatay, 'z' dikey) */
  axis: 'x' | 'z';
  /** Tam açılıp-kapanma döngü süresi (saniye) */
  periodSeconds: number;
  /** Faz farkı (saniye) */
  phaseOffset: number;
}

/**
 * Küre üzerinden geçtiğinde ok yönünde kinetik ivme kazandıran hızlandırma rampası.
 */
export interface BoostPadDefinition {
  /** [x, z] merkez koordinatları */
  position: [number, number];
  /** Normalize edilmiş [dx, dz] itiş yönü vektörü */
  direction: [number, number];
}

/**
 * Küreyi giriş noktasından çıkış noktasına (veya tersine) anında ışınlayan kuantum portal çifti.
 */
export interface TeleporterPairDefinition {
  /** 1. Portal [x, z] koordinatları */
  entry: [number, number];
  /** 2. Portal [x, z] koordinatları */
  exit: [number, number];
}

/**
 * Koridor boyunca sinüsoidal olarak ileri-geri devriye gezen dinamik engel bloğu.
 */
export interface MovingObstacleDefinition {
  /** [x, z] merkez koordinatları */
  center: [number, number];
  /** Hareket ekseni ('x' veya 'z') */
  axis: 'x' | 'z';
  /** Salınım genliği (birim) */
  amplitude: number;
  /** Salınım hızı (radyan/sn) */
  speed: number;
  /** Faz farkı */
  phaseOffset: number;
}

/**
 * Bir labirent seviyesinin tüm geometrik ve oynanış verileri.
 */
export interface MazeLevelDefinition {
  id: number;
  title: string;
  subtitle: string;
  boardSize: number;
  startPosition: [number, number, number];
  goalPosition: [number, number, number];
  innerWalls: WallDefinition[];
  voidHoles: VoidHoleDefinition[];
  /** Hedef portalının kilidini açmak için toplanması gereken enerji kristalleri [x, z] */
  crystals: [number, number][];
  /** Periyodik açılıp kapanan lazer enerji kapıları */
  laserGates: LaserGateDefinition[];
  /** Kinetik hızlandırma rampaları */
  boostPads?: BoostPadDefinition[];
  /** Çift yönlü kuantum ışınlanma portalları */
  teleporters?: TeleporterPairDefinition[];
  /** Dinamik devriye gezen kinetik engeller */
  movingObstacles?: MovingObstacleDefinition[];
  /** [3 Yıldız Süre Sınırı (sn), 2 Yıldız Süre Sınırı (sn)] */
  starThresholds?: [number, number];
}
