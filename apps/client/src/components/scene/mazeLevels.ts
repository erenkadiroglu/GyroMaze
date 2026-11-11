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

const PROCEDURAL_SECTOR_NAMES = [
  'Nöral Ağ geçidi',
  'Plazma Koridoru',
  'Siber Nöron',
  'Kuantum Reaktörü',
  'Karanlık Madde',
  'Hiperuzay Kavşağı',
  'Manyetik Fırtına',
  'Foton Kapanı',
  'Yörünge İstasyonu',
  'Tekillik Ufku',
];

/**
 * Tohum (seed) tabanlı deterministik sözde-rastgele sayı üreteci (Mulberry32).
 * Aynı bölüm numarası tüm cihazlarda birebir aynı sonsuz haritayı üretir.
 */
function createSeededRng(seed: number): () => number {
  let a = (seed * 2654435761) >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const proceduralCache = new Map<number, MazeLevelDefinition>();

/**
 * Bölüm 6 ve sonrası (Bölüm 6..∞) için %100 çözülebilir (Spanning-Tree / DFS),
 * geniş koridorlu (2.64 birim) ve çarpışmasız sonsuz prosedürel labirent üreticisi.
 */
export function generateProceduralLevel(levelId: number): MazeLevelDefinition {
  const cached = proceduralCache.get(levelId);
  if (cached) return cached;

  const rng = createSeededRng(levelId * 7919 + 104729);
  const G = 4; // 4x4 makro hücre ızgarası (Her hücre 3.0 x 3.0 birim)
  const cellCoord = (idx: number) => Number((-4.5 + idx * 3.0).toFixed(2));

  // Hücreler arası duvar durumları (Başlangıçta tüm iç duvarlar kapalı)
  // vWalls[r][c]: (r, c) ile (r, c+1) arasındaki dikey duvar (r: 0..3, c: 0..2)
  const vWalls: boolean[][] = Array.from({ length: G }, () =>
    Array.from({ length: G - 1 }, () => true),
  );
  // hWalls[r][c]: (r, c) ile (r+1, c) arasındaki yatay duvar (r: 0..2, c: 0..3)
  const hWalls: boolean[][] = Array.from({ length: G - 1 }, () =>
    Array.from({ length: G }, () => true),
  );

  const visited: boolean[][] = Array.from({ length: G }, () =>
    Array.from({ length: G }, () => false),
  );

  const corners: Array<[number, number]> = [
    [0, 0],
    [0, G - 1],
    [G - 1, 0],
    [G - 1, G - 1],
  ];
  const startCornerIdx = levelId % 4;
  const [startR, startC] = corners[startCornerIdx];
  const [goalR, goalC] = corners[(startCornerIdx + 2) % 4];

  // 1. Recursive Backtracker (DFS) ile tüm 16 hücreyi birbirine bağlayan ağacı oluştur
  const stack: Array<[number, number]> = [[startR, startC]];
  visited[startR][startC] = true;

  const openPassages: Array<{
    x: number;
    z: number;
    axis: 'x' | 'z';
  }> = [];

  while (stack.length > 0) {
    const [cr, cc] = stack[stack.length - 1];
    const neighbors: Array<{
      nr: number;
      nc: number;
      removeWall: () => void;
    }> = [];

    if (cr > 0 && !visited[cr - 1][cc]) {
      neighbors.push({
        nr: cr - 1,
        nc: cc,
        removeWall: () => {
          hWalls[cr - 1][cc] = false;
          openPassages.push({
            x: cellCoord(cc),
            z: Number((-3.0 + (cr - 1) * 3.0).toFixed(2)),
            axis: 'x',
          });
        },
      });
    }
    if (cr < G - 1 && !visited[cr + 1][cc]) {
      neighbors.push({
        nr: cr + 1,
        nc: cc,
        removeWall: () => {
          hWalls[cr][cc] = false;
          openPassages.push({
            x: cellCoord(cc),
            z: Number((-3.0 + cr * 3.0).toFixed(2)),
            axis: 'x',
          });
        },
      });
    }
    if (cc > 0 && !visited[cr][cc - 1]) {
      neighbors.push({
        nr: cr,
        nc: cc - 1,
        removeWall: () => {
          vWalls[cr][cc - 1] = false;
          openPassages.push({
            x: Number((-3.0 + (cc - 1) * 3.0).toFixed(2)),
            z: cellCoord(cr),
            axis: 'z',
          });
        },
      });
    }
    if (cc < G - 1 && !visited[cr][cc + 1]) {
      neighbors.push({
        nr: cr,
        nc: cc + 1,
        removeWall: () => {
          vWalls[cr][cc] = false;
          openPassages.push({
            x: Number((-3.0 + cc * 3.0).toFixed(2)),
            z: cellCoord(cr),
            axis: 'z',
          });
        },
      });
    }

    if (neighbors.length > 0) {
      const chosen = neighbors[Math.floor(rng() * neighbors.length)];
      chosen.removeWall();
      visited[chosen.nr][chosen.nc] = true;
      stack.push([chosen.nr, chosen.nc]);
    } else {
      stack.pop();
    }
  }

  // 2. Alternatif rotalar yaratmak için 3 ekstra iç duvarı daha aç (Braided Maze)
  let extraOpened = 0;
  for (let attempt = 0; attempt < 24 && extraOpened < 3; attempt++) {
    if (rng() < 0.5) {
      const r = Math.floor(rng() * G);
      const c = Math.floor(rng() * (G - 1));
      if (vWalls[r][c]) {
        vWalls[r][c] = false;
        extraOpened++;
      }
    } else {
      const r = Math.floor(rng() * (G - 1));
      const c = Math.floor(rng() * G);
      if (hWalls[r][c]) {
        hWalls[r][c] = false;
        extraOpened++;
      }
    }
  }

  // 3. Kalan duvarları 3B WallDefinition dizisine dönüştür (Köşe boşluklu 2.40 birim uzunluk)
  const innerWalls: WallDefinition[] = [];
  for (let r = 0; r < G; r++) {
    for (let c = 0; c < G - 1; c++) {
      if (vWalls[r][c]) {
        innerWalls.push({
          position: [
            Number((-3.0 + c * 3.0).toFixed(2)),
            H / 2,
            cellCoord(r),
          ],
          size: [T, H, 2.4],
        });
      }
    }
  }
  for (let r = 0; r < G - 1; r++) {
    for (let c = 0; c < G; c++) {
      if (hWalls[r][c]) {
        innerWalls.push({
          position: [
            cellCoord(c),
            H / 2,
            Number((-3.0 + r * 3.0).toFixed(2)),
          ],
          size: [2.4, H, T],
        });
      }
    }
  }

  // 4. Başlangıç ve Hedef dışındaki 14 serbest hücreyi karıştır
  const freeCells: Array<[number, number]> = [];
  for (let r = 0; r < G; r++) {
    for (let c = 0; c < G; c++) {
      if (
        (r === startR && c === startC) ||
        (r === goalR && c === goalC)
      ) {
        continue;
      }
      freeCells.push([r, c]);
    }
  }
  for (let i = freeCells.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const tmp = freeCells[i];
    freeCells[i] = freeCells[j];
    freeCells[j] = tmp;
  }

  let cursor = 0;
  const crystalCount = Math.min(5, 3 + Math.floor((levelId - 4) / 3));
  const crystals: [number, number][] = [];
  for (let i = 0; i < crystalCount && cursor < freeCells.length; i++) {
    const [r, c] = freeCells[cursor++];
    crystals.push([cellCoord(c), cellCoord(r)]);
  }

  const holeCount = Math.min(4, 2 + Math.floor((levelId - 5) / 4));
  const voidHoles: VoidHoleDefinition[] = [];
  for (let i = 0; i < holeCount && cursor < freeCells.length; i++) {
    const [r, c] = freeCells[cursor++];
    voidHoles.push({
      position: [cellCoord(c), cellCoord(r)],
      radius: 0.4,
    });
  }

  const boostPads: BoostPadDefinition[] = [];
  const dirs: Array<[number, number]> = [
    [0, 1],
    [0, -1],
    [1, 0],
    [-1, 0],
  ];
  for (let i = 0; i < 2 && cursor < freeCells.length; i++) {
    const [r, c] = freeCells[cursor++];
    boostPads.push({
      position: [cellCoord(c), cellCoord(r)],
      direction: dirs[(levelId + i) % dirs.length],
    });
  }

  const teleporters: TeleporterPairDefinition[] = [];
  if (cursor + 1 < freeCells.length) {
    const [r1, c1] = freeCells[cursor++];
    const [r2, c2] = freeCells[cursor++];
    teleporters.push({
      entry: [cellCoord(c1), cellCoord(r1)],
      exit: [cellCoord(c2), cellCoord(r2)],
    });
  }

  // Açık koridor geçitlerine periyodik lazer ve hareketli devriye engeli yerleştir
  const laserCount = Math.min(3, 1 + Math.floor((levelId - 4) / 3));
  const laserGates: LaserGateDefinition[] = [];
  for (let i = 0; i < laserCount && i < openPassages.length; i++) {
    const p = openPassages[(i * 3 + 1) % openPassages.length];
    laserGates.push({
      position: [p.x, p.z],
      length: 2.2,
      axis: p.axis,
      periodSeconds: Math.max(2.6, 3.6 - (levelId % 5) * 0.15),
      phaseOffset: i * 1.1,
    });
  }

  const movingObstacles: MovingObstacleDefinition[] = [];
  if (openPassages.length > 2) {
    const p = openPassages[(openPassages.length - 1) % openPassages.length];
    movingObstacles.push({
      center: [p.x, p.z],
      axis: p.axis,
      amplitude: 0.85,
      speed: Math.min(3.0, 1.8 + (levelId % 6) * 0.18),
      phaseOffset: (levelId % 4) * 0.7,
    });
  }

  const sectorName =
    PROCEDURAL_SECTOR_NAMES[(levelId - 6) % PROCEDURAL_SECTOR_NAMES.length];
  const tierRoman = Math.floor((levelId - 6) / PROCEDURAL_SECTOR_NAMES.length) + 1;
  const paddedNum = levelId < 10 ? `0${levelId}` : `${levelId}`;

  const generated: MazeLevelDefinition = {
    id: levelId,
    title: `Bölüm ${paddedNum} — ${sectorName} #${tierRoman}`,
    subtitle: `Sonsuz Prosedürel Sektör • ${crystalCount} Kristal • Kademe ${tierRoman}`,
    boardSize: 12,
    startPosition: [cellCoord(startC), 0.34, cellCoord(startR)],
    goalPosition: [cellCoord(goalC), 0.35, cellCoord(goalR)],
    innerWalls,
    voidHoles,
    crystals,
    laserGates,
    boostPads,
    teleporters,
    movingObstacles,
    starThresholds: [18.0 + crystalCount * 2, 28.0 + crystalCount * 3],
  };

  proceduralCache.set(levelId, generated);
  return generated;
}

/**
 * İstenen bölüm numarasına göre (1..5 el yapımı, 6..∞ prosedürel, 99 özel editör)
 * labirent tanımını döndürür.
 */
export function getMazeLevel(
  levelId: number,
  customLevel?: MazeLevelDefinition | null,
): MazeLevelDefinition {
  if (levelId === 99 && customLevel) {
    return customLevel;
  }
  const safeId = Math.max(1, Math.floor(levelId));
  if (safeId <= MAZE_LEVELS.length) {
    return MAZE_LEVELS[safeId - 1];
  }
  return generateProceduralLevel(safeId);
}
