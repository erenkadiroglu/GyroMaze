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
  /** Delik yarıçapı (varsayılan 0.52) */
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

const WALL_HEIGHT = 0.75;
const WALL_THICKNESS = 0.35;

/**
 * GyroMaze içerisindeki el yapımı, artan zorluk derecesine ve tuzak deliklerine sahip 5 labirent seviyesi.
 */
export const MAZE_LEVELS: MazeLevelDefinition[] = [
  {
    id: 1,
    title: 'Bölüm 01 — Uyanış Koridoru',
    subtitle: 'Temel jiroskop eğim kontrolü ve momentum dengesi',
    boardSize: 12,
    startPosition: [-4.5, 0.34, -4.5],
    goalPosition: [4.5, 0.35, 4.5],
    innerWalls: [
      {
        position: [-2.0, WALL_HEIGHT / 2, -2.5],
        size: [WALL_THICKNESS, WALL_HEIGHT, 7.0],
      },
      {
        position: [0.5, WALL_HEIGHT / 2, 1.5],
        size: [5.0, WALL_HEIGHT, WALL_THICKNESS],
      },
      {
        position: [2.5, WALL_HEIGHT / 2, -1.5],
        size: [WALL_THICKNESS, WALL_HEIGHT, 6.0],
      },
      {
        position: [-1.5, WALL_HEIGHT / 2, 3.8],
        size: [5.5, WALL_HEIGHT, WALL_THICKNESS],
      },
    ],
    voidHoles: [
      { position: [0.2, -3.8] },
      { position: [4.2, -0.5] },
    ],
  },
  {
    id: 2,
    title: 'Bölüm 02 — Sismik Sarmal',
    subtitle: 'Dar dönüşler ve hassas açısal sönümleme testi',
    boardSize: 12,
    startPosition: [-4.8, 0.34, 4.8],
    goalPosition: [0, 0.35, 0],
    innerWalls: [
      {
        position: [-3.2, WALL_HEIGHT / 2, 1.0],
        size: [WALL_THICKNESS, WALL_HEIGHT, 8.0],
      },
      {
        position: [0.5, WALL_HEIGHT / 2, -3.2],
        size: [7.5, WALL_HEIGHT, WALL_THICKNESS],
      },
      {
        position: [3.5, WALL_HEIGHT / 2, 0.5],
        size: [WALL_THICKNESS, WALL_HEIGHT, 7.5],
      },
      {
        position: [0.5, WALL_HEIGHT / 2, 3.5],
        size: [5.5, WALL_HEIGHT, WALL_THICKNESS],
      },
      {
        position: [-1.5, WALL_HEIGHT / 2, 0.5],
        size: [WALL_THICKNESS, WALL_HEIGHT, 4.5],
      },
      {
        position: [0.5, WALL_HEIGHT / 2, -1.2],
        size: [3.2, WALL_HEIGHT, WALL_THICKNESS],
      },
    ],
    voidHoles: [
      { position: [-4.5, -4.5] },
      { position: [4.6, -4.5] },
      { position: [2.2, 2.2] },
    ],
  },
  {
    id: 3,
    title: 'Bölüm 03 — Kuantum Labirenti',
    subtitle: 'Tuzak delikleri arasında zikzaklı yüksek hassasiyet koridoru',
    boardSize: 12,
    startPosition: [-4.8, 0.34, -4.8],
    goalPosition: [4.8, 0.35, -4.8],
    innerWalls: [
      {
        position: [-3.0, WALL_HEIGHT / 2, -2.0],
        size: [WALL_THICKNESS, WALL_HEIGHT, 8.0],
      },
      {
        position: [-1.0, WALL_HEIGHT / 2, 2.0],
        size: [WALL_THICKNESS, WALL_HEIGHT, 8.0],
      },
      {
        position: [1.0, WALL_HEIGHT / 2, -2.0],
        size: [WALL_THICKNESS, WALL_HEIGHT, 8.0],
      },
      {
        position: [3.0, WALL_HEIGHT / 2, 2.0],
        size: [WALL_THICKNESS, WALL_HEIGHT, 8.0],
      },
    ],
    voidHoles: [
      { position: [-4.0, 4.5] },
      { position: [-2.0, -4.5] },
      { position: [0.0, 4.5] },
      { position: [2.0, -4.5] },
      { position: [4.0, 4.5] },
    ],
  },
  {
    id: 4,
    title: 'Bölüm 04 — İkiz Kuleler ve Köprü',
    subtitle: 'Simetrik bölmeler ve merkezdeki dar geçiş',
    boardSize: 12,
    startPosition: [-4.6, 0.34, 0],
    goalPosition: [4.6, 0.35, 0],
    innerWalls: [
      {
        position: [-2.2, WALL_HEIGHT / 2, -2.6],
        size: [WALL_THICKNESS, WALL_HEIGHT, 4.2],
      },
      {
        position: [-2.2, WALL_HEIGHT / 2, 2.6],
        size: [WALL_THICKNESS, WALL_HEIGHT, 4.2],
      },
      {
        position: [0, WALL_HEIGHT / 2, 0],
        size: [WALL_THICKNESS, WALL_HEIGHT, 6.2],
      },
      {
        position: [2.2, WALL_HEIGHT / 2, -2.6],
        size: [WALL_THICKNESS, WALL_HEIGHT, 4.2],
      },
      {
        position: [2.2, WALL_HEIGHT / 2, 2.6],
        size: [WALL_THICKNESS, WALL_HEIGHT, 4.2],
      },
    ],
    voidHoles: [
      { position: [-1.1, 0] },
      { position: [1.1, 0] },
      { position: [0, -4.6] },
      { position: [0, 4.6] },
    ],
  },
  {
    id: 5,
    title: 'Bölüm 05 — Karanlık Çekirdek',
    subtitle: 'Usta seviye jiroskop dengesi ve çoklu kara delik sınavı',
    boardSize: 12,
    startPosition: [0, 0.34, 4.8],
    goalPosition: [0, 0.35, -4.8],
    innerWalls: [
      {
        position: [0, WALL_HEIGHT / 2, 3.0],
        size: [7.5, WALL_HEIGHT, WALL_THICKNESS],
      },
      {
        position: [-3.6, WALL_HEIGHT / 2, 0.8],
        size: [WALL_THICKNESS, WALL_HEIGHT, 4.5],
      },
      {
        position: [3.6, WALL_HEIGHT / 2, 0.8],
        size: [WALL_THICKNESS, WALL_HEIGHT, 4.5],
      },
      {
        position: [0, WALL_HEIGHT / 2, -0.5],
        size: [4.5, WALL_HEIGHT, WALL_THICKNESS],
      },
      {
        position: [-2.2, WALL_HEIGHT / 2, -2.8],
        size: [4.2, WALL_HEIGHT, WALL_THICKNESS],
      },
      {
        position: [2.2, WALL_HEIGHT / 2, -2.8],
        size: [4.2, WALL_HEIGHT, WALL_THICKNESS],
      },
    ],
    voidHoles: [
      { position: [-4.8, 3.2] },
      { position: [4.8, 3.2] },
      { position: [-1.8, 1.2] },
      { position: [1.8, 1.2] },
      { position: [0, -2.8] },
      { position: [-3.2, -4.5] },
      { position: [3.2, -4.5] },
    ],
  },
];
