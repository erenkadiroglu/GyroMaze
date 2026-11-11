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
}

const WALL_HEIGHT = 0.75;
const WALL_THICKNESS = 0.35;

/**
 * GyroMaze içerisindeki el yapımı, artan zorluk derecesine sahip 3B labirent seviyeleri.
 */
export const MAZE_LEVELS: MazeLevelDefinition[] = [
  {
    id: 1,
    title: 'Bölüm 01 — Uyanış Koridoru',
    subtitle: 'Temel jiroskop eğim kontrolü ve momentum dengesi',
    boardSize: 12,
    startPosition: [-4.5, 1.2, -4.5],
    goalPosition: [4.5, 0.35, 4.5],
    innerWalls: [
      { position: [-2.0, WALL_HEIGHT / 2, -2.5], size: [WALL_THICKNESS, WALL_HEIGHT, 7.0] },
      { position: [0.5, WALL_HEIGHT / 2, 1.5], size: [5.0, WALL_HEIGHT, WALL_THICKNESS] },
      { position: [2.5, WALL_HEIGHT / 2, -1.5], size: [WALL_THICKNESS, WALL_HEIGHT, 6.0] },
      { position: [-1.5, WALL_HEIGHT / 2, 3.8], size: [5.5, WALL_HEIGHT, WALL_THICKNESS] },
    ],
  },
  {
    id: 2,
    title: 'Bölüm 02 — Sismik Sarmal',
    subtitle: 'Dar dönüşler ve hassas açısal sönümleme testi',
    boardSize: 12,
    startPosition: [-4.8, 1.2, 4.8],
    goalPosition: [0, 0.35, 0],
    innerWalls: [
      { position: [-3.2, WALL_HEIGHT / 2, 1.0], size: [WALL_THICKNESS, WALL_HEIGHT, 8.0] },
      { position: [0.5, WALL_HEIGHT / 2, -3.2], size: [7.5, WALL_HEIGHT, WALL_THICKNESS] },
      { position: [3.5, WALL_HEIGHT / 2, 0.5], size: [WALL_THICKNESS, WALL_HEIGHT, 7.5] },
      { position: [0.5, WALL_HEIGHT / 2, 3.5], size: [5.5, WALL_HEIGHT, WALL_THICKNESS] },
      { position: [-1.5, WALL_HEIGHT / 2, 0.5], size: [WALL_THICKNESS, WALL_HEIGHT, 4.5] },
      { position: [0.5, WALL_HEIGHT / 2, -1.2], size: [3.2, WALL_HEIGHT, WALL_THICKNESS] },
    ],
  },
  {
    id: 3,
    title: 'Bölüm 03 — Kuantum Labirenti',
    subtitle: 'Yüksek hassasiyet gerektiren çok katmanlı dar geçitler',
    boardSize: 12,
    startPosition: [-4.8, 1.2, -4.8],
    goalPosition: [4.8, 0.35, -4.8],
    innerWalls: [
      { position: [-3.0, WALL_HEIGHT / 2, -2.0], size: [WALL_THICKNESS, WALL_HEIGHT, 8.0] },
      { position: [-1.0, WALL_HEIGHT / 2, 2.0], size: [WALL_THICKNESS, WALL_HEIGHT, 8.0] },
      { position: [1.0, WALL_HEIGHT / 2, -2.0], size: [WALL_THICKNESS, WALL_HEIGHT, 8.0] },
      { position: [3.0, WALL_HEIGHT / 2, 2.0], size: [WALL_THICKNESS, WALL_HEIGHT, 8.0] },
    ],
  },
];

