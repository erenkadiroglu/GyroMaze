import { pickBestOpenDirection } from '../../../utils/editorCompiler.ts';
import type {
  MazeLevelDefinition,
  WallDefinition,
  VoidHoleDefinition,
  LaserGateDefinition,
  BoostPadDefinition,
  TeleporterPairDefinition,
  MovingObstacleDefinition,
} from './types.ts';

const H = 0.75; // Duvar yüksekliği
const T = 0.36; // Duvar kalınlığı

export const PROCEDURAL_SECTOR_NAMES = [
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
] as const;

/**
 * Tohum (seed) tabanlı deterministik sözde-rastgele sayı üreteci (Mulberry32).
 * Aynı bölüm numarası tüm cihazlarda birebir aynı sonsuz haritayı üretir.
 */
export function createSeededRng(seed: number): () => number {
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
