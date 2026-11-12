import type {
  MazeLevelDefinition,
  WallDefinition,
  VoidHoleDefinition,
  LaserGateDefinition,
  BoostPadDefinition,
  TeleporterPairDefinition,
  MovingObstacleDefinition,
} from '../components/scene/mazeLevels.ts';

export const EDITOR_GRID_SIZE = 8;
export const EDITOR_CELL_WORLD_SIZE = 1.35;

export type EditorCellTool =
  | 'wall'
  | 'hole'
  | 'crystal'
  | 'laser'
  | 'boost'
  | 'moving'
  | 'portal'
  | 'start'
  | 'goal'
  | 'erase';

/**
 * Komşu karelerden geçit kısıtı olmayan yönler arasında hedef hücreye
 * en yakın `[dx, dz]` birim yön vektörünü seçer; açık geçit yoksa `null` döner.
 */
export function pickBestOpenDirection(
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

function clampEditorBoardSize(boardSize?: number): number {
  return typeof boardSize === 'number' && Number.isFinite(boardSize)
    ? Math.max(8, Math.min(18, boardSize))
    : 12;
}

/**
 * Düzenleyici ızgarasındaki `'portal'` hücrelerini satır-sütun sırasıyla çiftler
 * ve bir hücreden eşine atlamak için arama tablosu üretir.
 */
function buildEditorPortalJumpMap(grid: EditorCellTool[][]): {
  portalCells: Array<[number, number]>;
  jumpMap: Map<string, [number, number]>;
} {
  const portalCells: Array<[number, number]> = [];
  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < grid[r].length; c++) {
      if (grid[r][c] === 'portal') {
        portalCells.push([r, c]);
      }
    }
  }
  const jumpMap = new Map<string, [number, number]>();
  for (let i = 0; i + 1 < portalCells.length; i += 2) {
    const a = portalCells[i];
    const b = portalCells[i + 1];
    jumpMap.set(`${a[0]},${a[1]}`, b);
    jumpMap.set(`${b[0]},${b[1]}`, a);
  }
  return { portalCells, jumpMap };
}

/**
 * 8×8 editör ızgarasında geçerli başlangıç/hedef noktası, çiftlenmiş portallar ve
 * başlangıçtan tüm kristallere ve hedefe ulaşılabilir bir yol bulunup bulunmadığını doğrular.
 */
export function validateEditorGrid(
  grid: EditorCellTool[][],
): { ok: true } | { ok: false; reason: string } {
  const gridSize = grid.length;
  let startCell: [number, number] | null = null;
  let hasGoal = false;
  let totalCrystals = 0;

  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < grid[r].length; c++) {
      const cell = grid[r][c];
      if (cell === 'start') startCell = [r, c];
      else if (cell === 'goal') hasGoal = true;
      else if (cell === 'crystal') totalCrystals += 1;
    }
  }

  if (!startCell || !hasGoal) {
    return {
      ok: false,
      reason: 'Haritada hem başlangıç hem de hedef noktası bulunmalıdır.',
    };
  }

  const { portalCells, jumpMap } = buildEditorPortalJumpMap(grid);
  if (portalCells.length % 2 !== 0) {
    return {
      ok: false,
      reason:
        'Kuantum portallar çift halinde çalışır; açıkta kalan portal için bir eş daha yerleştirin.',
    };
  }

  const visited = Array.from({ length: gridSize }, () =>
    Array.from({ length: gridSize }, () => false),
  );
  const queue: Array<[number, number]> = [startCell];
  visited[startCell[0]][startCell[1]] = true;

  let reachedGoal = false;
  let reachedCrystals = 0;
  const dirs: Array<[number, number]> = [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
  ];

  while (queue.length > 0) {
    const [r, c] = queue.shift()!;
    const currentCell = grid[r][c];
    if (currentCell === 'goal') reachedGoal = true;
    if (currentCell === 'crystal') reachedCrystals += 1;

    const partner = jumpMap.get(`${r},${c}`);
    if (partner) {
      const [pr, pc] = partner;
      if (!visited[pr][pc]) {
        visited[pr][pc] = true;
        queue.push([pr, pc]);
      }
    }

    for (const [dr, dc] of dirs) {
      const nr = r + dr;
      const nc = c + dc;
      if (
        nr < 0 ||
        nr >= gridSize ||
        nc < 0 ||
        nc >= gridSize ||
        visited[nr][nc]
      ) {
        continue;
      }
      const nextCell = grid[nr][nc];
      if (nextCell === 'wall' || nextCell === 'hole') continue;
      visited[nr][nc] = true;
      queue.push([nr, nc]);
    }
  }

  if (!reachedGoal || reachedCrystals < totalCrystals) {
    return {
      ok: false,
      reason:
        'Başlangıç noktasından tüm kristallere ve hedefe ulaşılabilir bir yol bulunmalıdır.',
    };
  }

  return { ok: true };
}

/**
 * Mevcut bir özel harita tanımını `boardSize` ölçeğine uygun olarak 8×8 editör ızgarasına dönüştürür.
 */
export function levelDefinitionToEditorGrid(
  levelDef: MazeLevelDefinition,
  gridSize = EDITOR_GRID_SIZE,
): EditorCellTool[][] {
  const next: EditorCellTool[][] = Array.from({ length: gridSize }, () =>
    Array.from({ length: gridSize }, () => 'erase'),
  );
  const toGrid = (x: number, z: number) =>
    worldToEditorGridCell(x, z, levelDef.boardSize, gridSize);

  for (const w of levelDef.innerWalls) {
    const [r, c] = toGrid(w.position[0], w.position[2]);
    next[r][c] = 'wall';
  }
  for (const h of levelDef.voidHoles) {
    const [r, c] = toGrid(h.position[0], h.position[1]);
    next[r][c] = 'hole';
  }
  for (const [cx, cz] of levelDef.crystals) {
    const [r, c] = toGrid(cx, cz);
    next[r][c] = 'crystal';
  }
  for (const l of levelDef.laserGates) {
    const [r, c] = toGrid(l.position[0], l.position[1]);
    next[r][c] = 'laser';
  }
  for (const b of levelDef.boostPads ?? []) {
    const [r, c] = toGrid(b.position[0], b.position[1]);
    next[r][c] = 'boost';
  }
  for (const m of levelDef.movingObstacles ?? []) {
    const [r, c] = toGrid(m.center[0], m.center[1]);
    next[r][c] = 'moving';
  }
  for (const pair of levelDef.teleporters ?? []) {
    const [er, ec] = toGrid(pair.entry[0], pair.entry[1]);
    const [xr, xc] = toGrid(pair.exit[0], pair.exit[1]);
    next[er][ec] = 'portal';
    if (xr !== er || xc !== ec) {
      next[xr][xc] = 'portal';
    } else {
      const adj: Array<[number, number]> = [
        [xr, xc + 1],
        [xr + 1, xc],
        [xr, xc - 1],
        [xr - 1, xc],
      ];
      const freeAdj = adj.find(
        ([r, c]) =>
          r >= 0 &&
          r < gridSize &&
          c >= 0 &&
          c < gridSize &&
          next[r][c] === 'erase',
      );
      if (freeAdj) {
        next[freeAdj[0]][freeAdj[1]] = 'portal';
      }
    }
  }

  const [sr, sc] = toGrid(levelDef.startPosition[0], levelDef.startPosition[2]);
  let [gr, gc] = toGrid(levelDef.goalPosition[0], levelDef.goalPosition[2]);
  if (gr === sr && gc === sc) {
    const candidates: Array<[number, number]> = [
      [gr, gc + 1],
      [gr + 1, gc],
      [gr, gc - 1],
      [gr - 1, gc],
      [gridSize - 1, gridSize - 1],
      [0, 0],
    ];
    const validCandidates = candidates.filter(
      ([r, c]) =>
        r >= 0 && r < gridSize && c >= 0 && c < gridSize && (r !== sr || c !== sc),
    );
    const alt =
      validCandidates.find(([r, c]) => next[r][c] === 'erase') ??
      validCandidates[0];
    if (alt) {
      [gr, gc] = alt;
    }
  }
  next[gr][gc] = 'goal';
  next[sr][sc] = 'start';
  return next;
}

/**
 * 8×8 editör ızgarasını seçili `boardSize` ölçeğine göre oynanabilir bir `MazeLevelDefinition` nesnesine derler.
 */
export function buildLevelFromEditorGrid(
  grid: EditorCellTool[][],
  options: { title?: string; boardSize?: number } = {},
): MazeLevelDefinition {
  const gridSize = grid.length;
  const boardSize = clampEditorBoardSize(options.boardSize);
  const scale = boardSize / 12;
  const cellWorldSize = EDITOR_CELL_WORLD_SIZE * scale;

  let startPos: [number, number, number] = [-4.5, 0.34, -4.5];
  let goalPos: [number, number, number] = [4.5, 0.35, 4.5];
  let goalCell: [number, number] = [gridSize - 1, gridSize - 1];
  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      if (grid[r][c] === 'goal') {
        goalCell = [r, c];
      }
    }
  }

  const isOutOfBounds = (r: number, c: number) =>
    r < 0 || r >= gridSize || c < 0 || c >= gridSize;
  const isWallCell = (r: number, c: number) =>
    isOutOfBounds(r, c) || grid[r][c] === 'wall';
  const isBlockedCell = (r: number, c: number) =>
    isOutOfBounds(r, c) || grid[r][c] === 'wall' || grid[r][c] === 'hole';

  const wallSpan = Number((1.25 * scale).toFixed(2));
  const holeRadius = Number(Math.max(0.38, Math.min(0.55, 0.42 * scale)).toFixed(2));
  const laserLength = Number((1.3 * scale).toFixed(2));

  const innerWalls: WallDefinition[] = [];
  const voidHoles: VoidHoleDefinition[] = [];
  const crystals: [number, number][] = [];
  const laserGates: LaserGateDefinition[] = [];
  const boostPads: BoostPadDefinition[] = [];
  const movingObstacles: MovingObstacleDefinition[] = [];
  const portalCoords: Array<[number, number]> = [];

  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      const cell = grid[r][c];
      const [wx, wz] = editorGridCellToWorld(r, c, gridSize, cellWorldSize);

      if (cell === 'start') {
        startPos = [wx, 0.34, wz];
      } else if (cell === 'goal') {
        goalPos = [wx, 0.35, wz];
      } else if (cell === 'wall') {
        innerWalls.push({
          position: [wx, 0.375, wz],
          size: [wallSpan, 0.75, wallSpan],
        });
      } else if (cell === 'hole') {
        voidHoles.push({
          position: [wx, wz],
          radius: holeRadius,
        });
      } else if (cell === 'crystal') {
        crystals.push([wx, wz]);
      } else if (cell === 'laser') {
        laserGates.push({
          position: [wx, wz],
          length: laserLength,
          axis: computeEditorLaserAxis(r, c, isWallCell),
          periodSeconds: 3.2,
          phaseOffset: (r + c) * 0.4,
        });
      } else if (cell === 'boost') {
        boostPads.push({
          position: [wx, wz],
          direction: computeEditorBoostDirection(
            r,
            c,
            goalCell,
            isBlockedCell,
          ),
        });
      } else if (cell === 'moving') {
        const movingConfig = computeEditorMovingConfig(r, c, isWallCell);
        movingObstacles.push({
          center: [wx, wz],
          axis: movingConfig.axis,
          amplitude: Number((movingConfig.amplitude * scale).toFixed(2)),
          speed: 2.2,
          phaseOffset: (r + c) * 0.5,
        });
      } else if (cell === 'portal') {
        portalCoords.push([wx, wz]);
      }
    }
  }

  const teleporters: TeleporterPairDefinition[] = [];
  for (let i = 0; i + 1 < portalCoords.length; i += 2) {
    teleporters.push({
      entry: portalCoords[i],
      exit: portalCoords[i + 1],
    });
  }

  return {
    id: 99,
    title: options.title?.trim() || 'Özel Harita',
    subtitle: 'Harita editörü ile oluşturuldu',
    boardSize,
    startPosition: startPos,
    goalPosition: goalPos,
    innerWalls,
    voidHoles,
    crystals,
    laserGates,
    boostPads,
    teleporters,
    movingObstacles,
  };
}
