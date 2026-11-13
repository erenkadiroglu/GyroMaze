import type { MazeLevelDefinition } from './types.ts';

const H = 0.75; // Duvar yüksekliği
const T = 0.36; // Duvar kalınlığı

/**
 * Matematiksel olarak doğrulanmış 5 labirent seviyesi:
 * - Bilye çapı: 0.68 birim (Yarıçap: 0.34).
 * - Tüm geçit ve koridor genişlikleri en az 2.40 - 3.60 birimdir.
 * - Her bölümde portal kilidini açan Enerji Kristalleri ve zamanlamalı Lazer Kapılar yer alır.
 */
export const MAZE_LEVELS: MazeLevelDefinition[] = [
  {
    id: 1,
    title: 'Bölüm 01 — Uyanış Koridoru',
    subtitle: '3 enerji kristalini toplayarak hedef portalının kilidini açın',
    boardSize: 12,
    startPosition: [-4.4, 0.34, -4.4],
    goalPosition: [4.4, 0.35, 4.4],
    innerWalls: [
      { position: [-2.0, H / 2, -2.0], size: [T, H, 8.0] },
      { position: [2.0, H / 2, 2.0], size: [T, H, 8.0] },
    ],
    voidHoles: [
      { position: [-4.6, 4.6], radius: 0.42 },
      { position: [4.6, -4.6], radius: 0.42 },
    ],
    crystals: [
      [-4.0, 3.2],
      [0.0, 0.0],
      [4.0, -3.2],
    ],
    laserGates: [],
    boostPads: [
      { position: [-4.0, -1.2], direction: [0, 1] },
      { position: [0.0, 2.2], direction: [0, -1] },
    ],
    starThresholds: [11.0, 17.0],
  },
  {
    id: 2,
    title: 'Bölüm 02 — Sismik Sarmal',
    subtitle: 'Sarmal koridordaki kristalleri toplayıp lazer kapıdan merkeze ulaşın',
    boardSize: 12,
    startPosition: [-4.5, 0.34, 4.5],
    goalPosition: [0.0, 0.35, 0.0],
    innerWalls: [
      { position: [-3.0, H / 2, 1.5], size: [T, H, 9.0] },
      { position: [0.1, H / 2, -3.0], size: [5.8, H, T] },
      { position: [3.0, H / 2, 0.1], size: [T, H, 5.8] },
      { position: [1.15, H / 2, 3.0], size: [3.3, H, T] },
    ],
    voidHoles: [
      { position: [-4.7, -4.7], radius: 0.42 },
      { position: [4.7, -4.7], radius: 0.42 },
      { position: [4.7, 4.7], radius: 0.42 },
    ],
    crystals: [
      [-4.5, -1.5],
      [1.5, -4.5],
      [4.5, 1.5],
    ],
    laserGates: [
      {
        position: [-1.75, 3.0],
        length: 2.2,
        axis: 'x',
        periodSeconds: 3.4,
        phaseOffset: 0,
      },
    ],
    boostPads: [
      { position: [-1.2, -4.5], direction: [1, 0] },
      { position: [4.5, -1.5], direction: [0, 1] },
    ],
    starThresholds: [15.5, 23.0],
  },
  {
    id: 3,
    title: 'Bölüm 03 — Kuantum Slalom',
    subtitle: 'Asenkron lazer bariyerleri ve 4 enerji kristalli slalom parkuru',
    boardSize: 12,
    startPosition: [-4.5, 0.34, -4.5],
    goalPosition: [4.5, 0.35, -4.5],
    innerWalls: [
      { position: [-3.0, H / 2, -1.75], size: [T, H, 8.5] },
      { position: [0.0, H / 2, 1.75], size: [T, H, 8.5] },
      { position: [3.0, H / 2, -1.75], size: [T, H, 8.5] },
    ],
    voidHoles: [
      { position: [-4.8, 4.8], radius: 0.42 },
      { position: [-1.5, -4.9], radius: 0.42 },
      { position: [1.5, 4.9], radius: 0.42 },
      { position: [4.8, 4.8], radius: 0.42 },
    ],
    crystals: [
      [-4.5, 1.5],
      [-1.5, 0.0],
      [1.5, 0.0],
      [4.5, 1.5],
    ],
    laserGates: [
      {
        position: [-1.5, 2.2],
        length: 2.5,
        axis: 'x',
        periodSeconds: 3.2,
        phaseOffset: 0,
      },
      {
        position: [1.5, -2.2],
        length: 2.5,
        axis: 'x',
        periodSeconds: 3.2,
        phaseOffset: 1.6,
      },
    ],
    boostPads: [
      { position: [-4.5, -1.5], direction: [0, 1] },
      { position: [4.5, 3.0], direction: [0, -1] },
    ],
    teleporters: [{ entry: [-1.5, 4.0], exit: [1.5, -4.0] }],
    starThresholds: [19.5, 28.0],
  },
  {
    id: 4,
    title: 'Bölüm 04 — İkiz Kuleler ve Köprü',
    subtitle: 'Lazer korumalı kule kapıları ve köprü kristalleri',
    boardSize: 12,
    startPosition: [-4.6, 0.34, 0.0],
    goalPosition: [4.6, 0.35, 0.0],
    innerWalls: [
      { position: [-2.4, H / 2, -3.7], size: [T, H, 4.6] },
      { position: [-2.4, H / 2, 3.7], size: [T, H, 4.6] },
      { position: [0.0, H / 2, 0.0], size: [T, H, 5.2] },
      { position: [2.4, H / 2, -3.7], size: [T, H, 4.6] },
      { position: [2.4, H / 2, 3.7], size: [T, H, 4.6] },
    ],
    voidHoles: [
      { position: [-4.6, -4.6], radius: 0.42 },
      { position: [-4.6, 4.6], radius: 0.42 },
      { position: [0.0, -5.0], radius: 0.4 },
      { position: [0.0, 5.0], radius: 0.4 },
    ],
    crystals: [
      [-1.2, 0.0],
      [0.0, -3.5],
      [0.0, 3.5],
    ],
    laserGates: [
      {
        position: [-2.4, 0.0],
        length: 2.4,
        axis: 'z',
        periodSeconds: 3.6,
        phaseOffset: 0,
      },
      {
        position: [2.4, 0.0],
        length: 2.4,
        axis: 'z',
        periodSeconds: 3.6,
        phaseOffset: 1.8,
      },
    ],
    boostPads: [
      { position: [1.2, -3.5], direction: [0, 1] },
    ],
    teleporters: [{ entry: [-3.8, -3.5], exit: [3.8, 3.5] }],
    starThresholds: [18.0, 26.0],
  },
  {
    id: 5,
    title: 'Bölüm 05 — Karanlık Çekirdek',
    subtitle: '4 köşe kristalini toplayıp kuzey lazer kapısından çekirdeğe girin',
    boardSize: 12,
    startPosition: [0.0, 0.34, 4.6],
    goalPosition: [0.0, 0.35, -4.6],
    innerWalls: [
      { position: [0.0, H / 2, 2.6], size: [6.4, H, T] },
      { position: [-3.2, H / 2, 0.6], size: [T, H, 3.6] },
      { position: [3.2, H / 2, 0.6], size: [T, H, 3.6] },
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
    crystals: [
      [-4.6, 0.6],
      [4.6, 0.6],
      [-1.8, -1.0],
      [1.8, -1.0],
    ],
    laserGates: [
      {
        position: [0.0, -2.4],
        length: 2.6,
        axis: 'x',
        periodSeconds: 3.2,
        phaseOffset: 0,
      },
    ],
    boostPads: [
      { position: [-4.6, 2.6], direction: [0, -1] },
      { position: [4.6, 2.6], direction: [0, -1] },
    ],
    teleporters: [{ entry: [-4.6, -1.2], exit: [4.6, -1.2] }],
    movingObstacles: [
      {
        center: [0.0, -0.9],
        axis: 'x',
        amplitude: 1.4,
        speed: 2.2,
        phaseOffset: 0,
      },
    ],
    starThresholds: [22.0, 32.0],
  },
];
