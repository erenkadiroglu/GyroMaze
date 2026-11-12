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
  const holeCells = new Set<string>();
  for (let i = 0; i < holeCount && cursor < freeCells.length; i++) {
    const [r, c] = freeCells[cursor++];
    holeCells.add(`${r},${c}`);
    voidHoles.push({
      position: [cellCoord(c), cellCoord(r)],
      radius: 0.4,
    });
  }

  const isEdgeWallBlocked = (r: number, c: number, dr: number, dc: number) => {
    const nr = r + dr;
    const nc = c + dc;
    if (nr < 0 || nr >= G || nc < 0 || nc >= G) return true;
    if (dr === -1) return hWalls[r - 1][c];
    if (dr === 1) return hWalls[r][c];
    if (dc === -1) return vWalls[r][c - 1];
    return vWalls[r][c];
  };

  const boostPads: BoostPadDefinition[] = [];
  for (let i = 0; i < 2 && cursor < freeCells.length; i++) {
    const [r, c] = freeCells[cursor++];
    const direction =
      pickBestOpenDirection(
        r,
        c,
        [goalR, goalC],
        (cr, cc, dr, dc) =>
          isEdgeWallBlocked(cr, cc, dr, dc) ||
          holeCells.has(`${cr + dr},${cc + dc}`),
      ) ??
      pickBestOpenDirection(r, c, [goalR, goalC], isEdgeWallBlocked) ??
      [0, 1];
    boostPads.push({
      position: [cellCoord(c), cellCoord(r)],
      direction,
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
    subtitle: `${crystalCount} kristali topla, kademe ${tierRoman} portalına ulaş`,
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
  const safeId = Number.isFinite(levelId)
    ? Math.max(1, Math.floor(levelId))
    : 1;
  if (safeId <= MAZE_LEVELS.length) {
    return MAZE_LEVELS[safeId - 1];
  }
  return generateProceduralLevel(safeId);
}

/**
 * 2. oyuncu bilyesinin tahta sınırları, iç duvarlar ve tuzak delikleriyle
 * çakışmayan en güvenli başlangıç sapmasını [offsetX, offsetZ] hesaplar.
 */
export function findSafeP2SpawnOffset(
  levelData: MazeLevelDefinition,
  ballRadius = 0.34,
): [number, number] {
  const [sx, , sz] = levelData.startPosition;
  const halfBoard = levelData.boardSize / 2;
  const minMargin = ballRadius + 0.04;
  const minMarginSq = minMargin * minMargin;
  const perimeterLimit = halfBoard - (ballRadius + 0.22);

  const candidates: Array<[number, number]> = [
    [0.72, 0],
    [-0.72, 0],
    [0, 0.72],
    [0, -0.72],
    [0.46, 0],
    [-0.46, 0],
    [0, 0.46],
    [0, -0.46],
  ];

  for (const [ox, oz] of candidates) {
    const px = sx + ox;
    const pz = sz + oz;
    if (Math.abs(px) > perimeterLimit || Math.abs(pz) > perimeterLimit) {
      continue;
    }

    let blocked = false;
    for (const wall of levelData.innerWalls) {
      const [wx, , wz] = wall.position;
      const halfW = wall.size[0] / 2;
      const halfD = wall.size[2] / 2;
      const dx = Math.max(Math.abs(px - wx) - halfW, 0);
      const dz = Math.max(Math.abs(pz - wz) - halfD, 0);
      if (dx * dx + dz * dz < minMarginSq) {
        blocked = true;
        break;
      }
    }
    if (blocked) continue;

    for (const hole of levelData.voidHoles) {
      const safeRadius = (hole.radius ?? 0.42) + minMargin;
      const dx = px - hole.position[0];
      const dz = pz - hole.position[1];
      if (dx * dx + dz * dz < safeRadius * safeRadius) {
        blocked = true;
        break;
      }
    }
    if (!blocked) {
      return [ox, oz];
    }
  }

  return [0, 0];
}

/**
 * Standart/prosedürel bölümlerde kimliği, özel editör haritalarında (`id === 99`)
 * ise geometriyi tanımlayan benzersiz anahtar üretir.
 */
export function getLevelRevisionKey(levelData: MazeLevelDefinition): string {
  if (levelData.id !== 99) {
    return String(levelData.id);
  }
  const wallsSig = levelData.innerWalls
    .map((w) => `${w.position[0]},${w.position[2]},${w.size[0]}x${w.size[2]}`)
    .join(';');
  const holesSig = levelData.voidHoles
    .map((h) => `${h.position[0]},${h.position[1]},${h.radius ?? 0.42}`)
    .join(';');
  const crystalsSig = levelData.crystals
    .map(([cx, cz]) => `${cx},${cz}`)
    .join(';');
  const lasersSig = levelData.laserGates
    .map(
      (g) =>
        `${g.position[0]},${g.position[1]},${g.axis},${g.length},${g.periodSeconds},${g.phaseOffset}`,
    )
    .join(';');
  const boostsSig = (levelData.boostPads ?? [])
    .map(
      (b) =>
        `${b.position[0]},${b.position[1]},${b.direction[0]},${b.direction[1]}`,
    )
    .join(';');
  const teleportersSig = (levelData.teleporters ?? [])
    .map((t) => `${t.entry[0]},${t.entry[1]}->${t.exit[0]},${t.exit[1]}`)
    .join(';');
  const movingSig = (levelData.movingObstacles ?? [])
    .map(
      (m) =>
        `${m.center[0]},${m.center[1]},${m.axis},${m.amplitude},${m.speed},${m.phaseOffset}`,
    )
    .join(';');
  return `99-${levelData.boardSize}-${levelData.startPosition.join(',')}-${levelData.goalPosition.join(',')}-${wallsSig}|${holesSig}|${crystalsSig}|${lasersSig}|${boostsSig}|${teleportersSig}|${movingSig}`;
}

function isVec2(value: unknown): value is [number, number] {
  return (
    Array.isArray(value) &&
    value.length === 2 &&
    value.every((n) => typeof n === 'number' && Number.isFinite(n))
  );
}

function isVec3(value: unknown): value is [number, number, number] {
  return (
    Array.isArray(value) &&
    value.length === 3 &&
    value.every((n) => typeof n === 'number' && Number.isFinite(n))
  );
}

function isPlainRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value));
}

/**
 * Editörden dışa aktarılan JSON veya yerel depolamadan (localStorage) okunan ham
 * veriyi sıkı şema doğrulamasından geçirerek güvenli bir `MazeLevelDefinition` (id: 99) döndürür.
 * Bozuk veya eksik veride `null` döner.
 */
export function parseCustomMazeLevel(raw: unknown): MazeLevelDefinition | null {
  if (!isPlainRecord(raw)) return null;
  if (
    !isVec3(raw.startPosition) ||
    !isVec3(raw.goalPosition) ||
    !Array.isArray(raw.innerWalls)
  ) {
    return null;
  }

  const boardSize =
    typeof raw.boardSize === 'number' && Number.isFinite(raw.boardSize)
      ? Math.max(8, Math.min(18, raw.boardSize))
      : 12;
  const maxCoord = Math.max(2, boardSize / 2 - 0.65);
  const clampCoord = (n: number): number =>
    Number(Math.max(-maxCoord, Math.min(maxCoord, n)).toFixed(2));
  const halfBoardLimit = Number((boardSize / 2).toFixed(2));
  const clampWallCoord = (n: number): number =>
    Number(Math.max(-halfBoardLimit, Math.min(halfBoardLimit, n)).toFixed(2));

  const innerWalls: WallDefinition[] = [];
  for (const w of raw.innerWalls) {
    if (
      !isPlainRecord(w) ||
      !isVec3(w.position) ||
      !isVec3(w.size) ||
      !w.size.every((dim) => dim > 0)
    ) {
      return null;
    }
    const wallW = Number(Math.max(0.1, Math.min(boardSize, w.size[0])).toFixed(2));
    const wallH = Number(Math.max(0.2, Math.min(2.5, w.size[1])).toFixed(2));
    const wallD = Number(Math.max(0.1, Math.min(boardSize, w.size[2])).toFixed(2));
    innerWalls.push({
      position: [
        clampWallCoord(w.position[0]),
        Number((wallH / 2).toFixed(3)),
        clampWallCoord(w.position[2]),
      ],
      size: [wallW, wallH, wallD],
    });
  }

  const safeStart: [number, number, number] = [
    clampCoord(raw.startPosition[0]),
    0.34,
    clampCoord(raw.startPosition[2]),
  ];
  const safeGoal: [number, number, number] = [
    clampCoord(raw.goalPosition[0]),
    0.35,
    clampCoord(raw.goalPosition[2]),
  ];

  const voidHoles: VoidHoleDefinition[] = [];
  if (Array.isArray(raw.voidHoles)) {
    for (const h of raw.voidHoles) {
      if (isPlainRecord(h) && isVec2(h.position)) {
        const radius =
          typeof h.radius === 'number' && Number.isFinite(h.radius) && h.radius > 0
            ? Number(Math.max(0.25, Math.min(0.75, h.radius)).toFixed(2))
            : undefined;
        const pos: [number, number] = [
          clampCoord(h.position[0]),
          clampCoord(h.position[1]),
        ];
        voidHoles.push(
          radius !== undefined
            ? { position: pos, radius }
            : { position: pos },
        );
      }
    }
  }

  const crystals: [number, number][] = Array.isArray(raw.crystals)
    ? raw.crystals
        .filter(isVec2)
        .map(([cx, cz]) => [clampCoord(cx), clampCoord(cz)])
    : [];

  const maxLaserLen = Math.max(1.2, boardSize - 0.8);
  const laserGates: LaserGateDefinition[] = [];
  if (Array.isArray(raw.laserGates)) {
    for (const g of raw.laserGates) {
      if (
        isPlainRecord(g) &&
        isVec2(g.position) &&
        typeof g.length === 'number' &&
        Number.isFinite(g.length) &&
        g.length > 0 &&
        (g.axis === 'x' || g.axis === 'z') &&
        typeof g.periodSeconds === 'number' &&
        Number.isFinite(g.periodSeconds) &&
        g.periodSeconds > 0 &&
        typeof g.phaseOffset === 'number' &&
        Number.isFinite(g.phaseOffset)
      ) {
        laserGates.push({
          position: [clampCoord(g.position[0]), clampCoord(g.position[1])],
          length: Number(Math.max(0.4, Math.min(maxLaserLen, g.length)).toFixed(2)),
          axis: g.axis,
          periodSeconds: Number(Math.max(0.4, Math.min(20, g.periodSeconds)).toFixed(2)),
          phaseOffset: Number(Math.max(-20, Math.min(20, g.phaseOffset)).toFixed(2)),
        });
      }
    }
  }

  const boostPads: BoostPadDefinition[] = [];
  if (Array.isArray(raw.boostPads)) {
    for (const b of raw.boostPads) {
      if (isPlainRecord(b) && isVec2(b.position) && isVec2(b.direction)) {
        const mag = Math.hypot(b.direction[0], b.direction[1]);
        if (mag > 0.001) {
          boostPads.push({
            position: [clampCoord(b.position[0]), clampCoord(b.position[1])],
            direction: [
              Number((b.direction[0] / mag).toFixed(3)),
              Number((b.direction[1] / mag).toFixed(3)),
            ],
          });
        }
      }
    }
  }

  const teleporters: TeleporterPairDefinition[] = [];
  if (Array.isArray(raw.teleporters)) {
    for (const t of raw.teleporters) {
      if (isPlainRecord(t) && isVec2(t.entry) && isVec2(t.exit)) {
        const entry: [number, number] = [
          clampCoord(t.entry[0]),
          clampCoord(t.entry[1]),
        ];
        const exit: [number, number] = [
          clampCoord(t.exit[0]),
          clampCoord(t.exit[1]),
        ];
        if (Math.hypot(entry[0] - exit[0], entry[1] - exit[1]) >= 0.75) {
          teleporters.push({ entry, exit });
        }
      }
    }
  }

  const maxMovingAmp = Math.max(0.4, boardSize / 2 - 0.8);
  const movingObstacles: MovingObstacleDefinition[] = [];
  if (Array.isArray(raw.movingObstacles)) {
    for (const m of raw.movingObstacles) {
      if (
        isPlainRecord(m) &&
        isVec2(m.center) &&
        (m.axis === 'x' || m.axis === 'z') &&
        typeof m.amplitude === 'number' &&
        Number.isFinite(m.amplitude) &&
        typeof m.speed === 'number' &&
        Number.isFinite(m.speed) &&
        typeof m.phaseOffset === 'number' &&
        Number.isFinite(m.phaseOffset)
      ) {
        movingObstacles.push({
          center: [clampCoord(m.center[0]), clampCoord(m.center[1])],
          axis: m.axis,
          amplitude: Number(Math.max(0, Math.min(maxMovingAmp, m.amplitude)).toFixed(2)),
          speed: Number(Math.max(0.1, Math.min(10, m.speed)).toFixed(2)),
          phaseOffset: Number(Math.max(-20, Math.min(20, m.phaseOffset)).toFixed(2)),
        });
      }
    }
  }

  const title =
    typeof raw.title === 'string' && raw.title.trim()
      ? raw.title.trim().slice(0, 48)
      : 'Özel İçe Aktarılan Harita';
  const subtitle =
    typeof raw.subtitle === 'string' && raw.subtitle.trim()
      ? raw.subtitle.trim().slice(0, 80)
      : 'Özel Editör Haritası';

  return {
    id: 99,
    title,
    subtitle,
    boardSize,
    startPosition: safeStart,
    goalPosition: safeGoal,
    innerWalls,
    voidHoles,
    crystals,
    laserGates,
    boostPads,
    teleporters,
    movingObstacles,
    starThresholds:
      isVec2(raw.starThresholds) &&
      raw.starThresholds[0] > 0 &&
      raw.starThresholds[1] > raw.starThresholds[0]
        ? raw.starThresholds
        : undefined,
  };
}

/**
 * Komşu karelerden geçit kısıtı olmayan yönler arasında hedef hücreye
 * en yakın `[dx, dz]` birim yön vektörünü seçer; açık geçit yoksa `null` döner.
 */
function pickBestOpenDirection(
  row: number,
  col: number,
  goalCell: [number, number],
  isStepBlocked: (r: number, c: number, dr: number, dc: number) => boolean,
): [number, number] | null {
  const [goalRow, goalCol] = goalCell;
  const candidates: readonly [number, number][] = [
    [0, 1],
    [1, 0],
    [0, -1],
    [-1, 0],
  ];

  let bestDirection: [number, number] | null = null;
  let bestDistanceSq = Number.POSITIVE_INFINITY;

  for (const [dr, dc] of candidates) {
    if (isStepBlocked(row, col, dr, dc)) {
      continue;
    }

    const dRow = goalRow - (row + dr);
    const dCol = goalCol - (col + dc);
    const distanceSq = dRow * dRow + dCol * dCol;

    if (distanceSq < bestDistanceSq) {
      bestDistanceSq = distanceSq;
      // Izgara sütun farkı X eksenine, satır farkı Z eksenine karşılık gelir
      bestDirection = [dc, dr];
    }
  }

  return bestDirection;
}

/**
 * Düzenleyicideki bir hızlandırma (boost) karesi için açık koridora ve hedefe
 * yönelen `[dx, dz]` birim yön vektörünü hesaplar; tüm komşular kapalıysa `[0, 1]` döner.
 */
export function computeEditorBoostDirection(
  row: number,
  col: number,
  goalCell: [number, number],
  isBlockedCell: (r: number, c: number) => boolean,
): [number, number] {
  return (
    pickBestOpenDirection(row, col, goalCell, (r, c, dr, dc) =>
      isBlockedCell(r + dr, c + dc),
    ) ?? [0, 1]
  );
}

function detectCorridorOrientation(
  row: number,
  col: number,
  isWallCell: (r: number, c: number) => boolean,
): {
  hasHorizontalClearance: boolean;
  hasVerticalClearance: boolean;
  preferredAxis: 'x' | 'z';
} {
  return {
    hasHorizontalClearance:
      !isWallCell(row, col - 1) && !isWallCell(row, col + 1),
    hasVerticalClearance:
      !isWallCell(row - 1, col) && !isWallCell(row + 1, col),
    preferredAxis: (row + col) % 2 === 0 ? 'x' : 'z',
  };
}

/**
 * Düzenleyicideki lazer kapısının komşu duvarlara dik uzanarak koridoru
 * kesmesini sağlayan ekseni (`'x'` veya `'z'`) belirler.
 */
export function computeEditorLaserAxis(
  row: number,
  col: number,
  isWallCell: (r: number, c: number) => boolean,
): 'x' | 'z' {
  const { hasHorizontalClearance, hasVerticalClearance, preferredAxis } =
    detectCorridorOrientation(row, col, isWallCell);

  if (hasHorizontalClearance && !hasVerticalClearance) {
    return 'z';
  }
  if (hasVerticalClearance && !hasHorizontalClearance) {
    return 'x';
  }
  return preferredAxis;
}

/**
 * Düzenleyicideki hareketli engelin komşu duvarlara çarpmaması için
 * açık olan hareket eksenini ve güvenli salınım genliğini seçer.
 */
export function computeEditorMovingConfig(
  row: number,
  col: number,
  isWallCell: (r: number, c: number) => boolean,
): { axis: 'x' | 'z'; amplitude: number } {
  const { hasHorizontalClearance, hasVerticalClearance, preferredAxis } =
    detectCorridorOrientation(row, col, isWallCell);

  if (hasHorizontalClearance && hasVerticalClearance) {
    return { axis: preferredAxis, amplitude: 0.72 };
  }
  if (hasHorizontalClearance) {
    return { axis: 'x', amplitude: 0.72 };
  }
  if (hasVerticalClearance) {
    return { axis: 'z', amplitude: 0.72 };
  }
  return { axis: preferredAxis, amplitude: 0.34 };
}

export const EDITOR_GRID_SIZE = 8;
export const EDITOR_CELL_WORLD_SIZE = 1.35;

/**
 * 8x8 düzenleyici ızgara koordinatını standart 12x12 dünya koordinatına [x, z] dönüştürür.
 */
export function editorGridCellToWorld(
  row: number,
  col: number,
  gridSize = EDITOR_GRID_SIZE,
  cellWorldSize = EDITOR_CELL_WORLD_SIZE,
): [number, number] {
  const offset = (gridSize - 1) / 2;
  const x = Number(((col - offset) * cellWorldSize).toFixed(2));
  const z = Number(((row - offset) * cellWorldSize).toFixed(2));
  return [x, z];
}

/**
 * Özel haritanın gerçek `boardSize` değerine göre dünya [x, z] konumunu
 * 8x8 düzenleyici ızgarasına orantılı biçimde eşler.
 */
export function worldToEditorGridCell(
  x: number,
  z: number,
  boardSize = 12,
  gridSize = EDITOR_GRID_SIZE,
  cellWorldSize = EDITOR_CELL_WORLD_SIZE,
): [number, number] {
  const safeBoardSize =
    typeof boardSize === 'number' && Number.isFinite(boardSize)
      ? Math.max(8, Math.min(18, boardSize))
      : 12;
  const scaledCellSize = cellWorldSize * (safeBoardSize / 12);
  const offset = (gridSize - 1) / 2;
  const safeX = Number.isFinite(x) ? x : 0;
  const safeZ = Number.isFinite(z) ? z : 0;

  const col = Math.max(
    0,
    Math.min(gridSize - 1, Math.round(safeX / scaledCellSize + offset)),
  );
  const row = Math.max(
    0,
    Math.min(gridSize - 1, Math.round(safeZ / scaledCellSize + offset)),
  );
  return [row, col];
}
