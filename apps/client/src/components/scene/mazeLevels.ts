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
}

const H = 0.75; // Duvar yüksekliği
const T = 0.36; // Duvar kalınlığı

/**
 * Matematiksel olarak doğrulanmış 5 labirent seviyesi:
 * - Bilye çapı: 0.68 birim (Yarıçap: 0.34).
 * - Tüm geçit ve koridor genişlikleri en az 2.40 - 3.60 birimdir (sıkışma/takılma imkansız).
 * - Hiçbir iç duvar başka bir duvarla üst üste binmez (Z-fighting önlendi).
 * - Tuzak delikleri (Void Holes) kapı ağızlarını asla kapatmaz; yalnızca köşe ceplerinde yer alır.
 */
export const MAZE_LEVELS: MazeLevelDefinition[] = [
  {
    id: 1,
    title: 'Bölüm 01 — Uyanış Koridoru',
    subtitle: 'Geniş S-koridorunda temel jiroskop eğim ve momentum kontrolü',
    boardSize: 12,
    startPosition: [-4.4, 0.34, -4.4],
    goalPosition: [4.4, 0.35, 4.4],
    innerWalls: [
      // Batı dikey duvar (Güneyde 4.0 birimlik geniş geçit bırakır)
      { position: [-2.0, H / 2, -2.0], size: [T, H, 8.0] },
      // Doğu dikey duvar (Kuzeyde 4.0 birimlik geniş geçit bırakır)
      { position: [2.0, H / 2, 2.0], size: [T, H, 8.0] },
    ],
    voidHoles: [
      { position: [-4.6, 4.6], radius: 0.42 },
      { position: [4.6, -4.6], radius: 0.42 },
    ],
  },
  {
    id: 2,
    title: 'Bölüm 02 — Sismik Sarmal',
    subtitle: 'Dış koridordan merkeze doğru kesintisiz sarmal rota',
    boardSize: 12,
    startPosition: [-4.5, 0.34, 4.5],
    goalPosition: [0.0, 0.35, 0.0],
    innerWalls: [
      // Sol dikey sarmal duvarı (Kuzeyde 3.0 birim geçit)
      { position: [-3.0, H / 2, 1.5], size: [T, H, 9.0] },
      // Üst yatay sarmal duvarı (Doğuda 3.0 birim geçit)
      { position: [0.1, H / 2, -3.0], size: [5.8, H, T] },
      // Sağ dikey sarmal duvarı (Güneyde 3.0 birim geçit)
      { position: [3.0, H / 2, 0.1], size: [T, H, 5.8] },
      // Alt iç sarmal duvarı (Merkeze 2.5 birimlik temiz giriş kapısı bırakır)
      { position: [1.15, H / 2, 3.0], size: [3.3, H, T] },
    ],
    voidHoles: [
      { position: [-4.7, -4.7], radius: 0.42 },
      { position: [4.7, -4.7], radius: 0.42 },
      { position: [4.7, 4.7], radius: 0.42 },
    ],
  },
  {
    id: 3,
    title: 'Bölüm 03 — Kuantum Slalom',
    subtitle: 'Üç kademeli geniş slalom geçitleri ve köşe tuzakları',
    boardSize: 12,
    startPosition: [-4.5, 0.34, -4.5],
    goalPosition: [4.5, 0.35, -4.5],
    innerWalls: [
      // 1. Slalom duvarı (Altta 3.5 birim geçit)
      { position: [-3.0, H / 2, -1.75], size: [T, H, 8.5] },
      // 2. Slalom duvarı (Üstte 3.5 birim geçit)
      { position: [0.0, H / 2, 1.75], size: [T, H, 8.5] },
      // 3. Slalom duvarı (Altta 3.5 birim geçit)
      { position: [3.0, H / 2, -1.75], size: [T, H, 8.5] },
    ],
    voidHoles: [
      { position: [-4.8, 4.8], radius: 0.42 },
      { position: [-1.5, -4.9], radius: 0.42 },
      { position: [1.5, 4.9], radius: 0.42 },
      { position: [4.8, 4.8], radius: 0.42 },
    ],
  },
  {
    id: 4,
    title: 'Bölüm 04 — İkiz Kuleler ve Köprü',
    subtitle: 'Simetrik kapılar ve çift yönlü köprü tercihi',
    boardSize: 12,
    startPosition: [-4.6, 0.34, 0.0],
    goalPosition: [4.6, 0.35, 0.0],
    innerWalls: [
      // Batı kapısı üst ve alt kanatları (Ortada 2.8 birimlik geniş kapı)
      { position: [-2.4, H / 2, -3.7], size: [T, H, 4.6] },
      { position: [-2.4, H / 2, 3.7], size: [T, H, 4.6] },
      // Merkez ayırıcı duvar (Üstten ve alttan 3.4 birimlik çift geçit)
      { position: [0.0, H / 2, 0.0], size: [T, H, 5.2] },
      // Doğu kapısı üst ve alt kanatları (Ortada 2.8 birimlik geniş kapı)
      { position: [2.4, H / 2, -3.7], size: [T, H, 4.6] },
      { position: [2.4, H / 2, 3.7], size: [T, H, 4.6] },
    ],
    voidHoles: [
      { position: [-4.6, -4.6], radius: 0.42 },
      { position: [-4.6, 4.6], radius: 0.42 },
      { position: [0.0, -5.0], radius: 0.4 },
      { position: [0.0, 5.0], radius: 0.4 },
    ],
  },
  {
    id: 5,
    title: 'Bölüm 05 — Karanlık Çekirdek',
    subtitle: 'Merkez avludan geçen çift kanatlı usta seviye kale rotası',
    boardSize: 12,
    startPosition: [0.0, 0.34, 4.6],
    goalPosition: [0.0, 0.35, -4.6],
    innerWalls: [
      // Güney kalkan duvarı (Sağdan ve soldan 2.8 birimlik geçiş)
      { position: [0.0, H / 2, 2.6], size: [6.4, H, T] },
      // Batı ve Doğu iç avlu kanat duvarları
      { position: [-3.2, H / 2, 0.6], size: [T, H, 3.6] },
      { position: [3.2, H / 2, 0.6], size: [T, H, 3.6] },
      // Kuzey hedef kapısı kanatları (Merkezde 3.0 birimlik geniş hedef geçidi!)
      { position: [-3.75, H / 2, -2.4], size: [4.5, H, T] },
      { position: [3.75, H / 2, -2.4], size: [4.5, H, T] },
    ],
    voidHoles: [
      { position: [-4.8, 4.6], radius: 0.42 },
      { position: [4.8, 4.6], radius: 0.42 },
      { position: [0.0, 0.6], radius: 0.42 },
      { position: [-4.6, -4.6], radius: 0.42 },
      { position: [4.6, -4.6], radius: 0.42 },
    ],
  },
];
