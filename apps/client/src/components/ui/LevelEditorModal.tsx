'use client';

import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import {
  Play,
  Trash2,
  Copy,
  Check,
  Box,
  CircleDot,
  Gem,
  Zap,
  Flag,
  MapPin,
  Eraser,
  Activity,
  Shuffle,
  Wrench,
  Upload,
} from 'lucide-react';
import { useGameStore } from '@/store/useGameStore';
import {
  MazeLevelDefinition,
  WallDefinition,
  VoidHoleDefinition,
  LaserGateDefinition,
  BoostPadDefinition,
  MovingObstacleDefinition,
  parseCustomMazeLevel,
  computeEditorBoostDirection,
  computeEditorLaserAxis,
  computeEditorMovingConfig,
} from '@/components/scene/mazeLevels';
import { Modal, Button, cx } from './primitives';

type CellTool =
  | 'wall'
  | 'hole'
  | 'crystal'
  | 'laser'
  | 'boost'
  | 'moving'
  | 'start'
  | 'goal'
  | 'erase';

const GRID_SIZE = 8;
const CELL_WORLD_SIZE = 1.35;

function gridToWorld(row: number, col: number): [number, number] {
  const offset = (GRID_SIZE - 1) / 2;
  const x = Number(((col - offset) * CELL_WORLD_SIZE).toFixed(2));
  const z = Number(((row - offset) * CELL_WORLD_SIZE).toFixed(2));
  return [x, z];
}

function worldToGrid(x: number, z: number): [number, number] {
  const offset = (GRID_SIZE - 1) / 2;
  const col = Math.max(
    0,
    Math.min(GRID_SIZE - 1, Math.round(x / CELL_WORLD_SIZE + offset)),
  );
  const row = Math.max(
    0,
    Math.min(GRID_SIZE - 1, Math.round(z / CELL_WORLD_SIZE + offset)),
  );
  return [row, col];
}

function levelDefinitionToGrid(levelDef: MazeLevelDefinition): CellTool[][] {
  const next: CellTool[][] = Array.from({ length: GRID_SIZE }, () =>
    Array.from({ length: GRID_SIZE }, () => 'erase'),
  );
  for (const w of levelDef.innerWalls) {
    const [r, c] = worldToGrid(w.position[0], w.position[2]);
    next[r][c] = 'wall';
  }
  for (const h of levelDef.voidHoles) {
    const [r, c] = worldToGrid(h.position[0], h.position[1]);
    next[r][c] = 'hole';
  }
  for (const [cx, cz] of levelDef.crystals) {
    const [r, c] = worldToGrid(cx, cz);
    next[r][c] = 'crystal';
  }
  for (const l of levelDef.laserGates) {
    const [r, c] = worldToGrid(l.position[0], l.position[1]);
    next[r][c] = 'laser';
  }
  for (const b of levelDef.boostPads ?? []) {
    const [r, c] = worldToGrid(b.position[0], b.position[1]);
    next[r][c] = 'boost';
  }
  for (const m of levelDef.movingObstacles ?? []) {
    const [r, c] = worldToGrid(m.center[0], m.center[1]);
    next[r][c] = 'moving';
  }
  const [sr, sc] = worldToGrid(
    levelDef.startPosition[0],
    levelDef.startPosition[2],
  );
  let [gr, gc] = worldToGrid(levelDef.goalPosition[0], levelDef.goalPosition[2]);
  if (gr === sr && gc === sc) {
    const candidates: Array<[number, number]> = [
      [gr, gc + 1],
      [gr + 1, gc],
      [gr, gc - 1],
      [gr - 1, gc],
      [GRID_SIZE - 1, GRID_SIZE - 1],
      [0, 0],
    ];
    const alt = candidates.find(
      ([r, c]) => r >= 0 && r < GRID_SIZE && c >= 0 && c < GRID_SIZE && (r !== sr || c !== sc),
    );
    if (alt) {
      [gr, gc] = alt;
    }
  }
  next[gr][gc] = 'goal';
  next[sr][sc] = 'start';
  return next;
}

/**
 * Editör ızgarasında başlangıç hücresinden ('start') tüm kristallere ve hedefe ('goal')
 * yürünür bir yol olup olmadığını BFS ile doğrular.
 */
function hasSolvableGridPath(grid: CellTool[][]): boolean {
  let startCell: [number, number] | null = null;
  let totalCrystals = 0;

  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (grid[r][c] === 'start') startCell = [r, c];
      else if (grid[r][c] === 'crystal') totalCrystals += 1;
    }
  }

  if (!startCell) return false;

  const visited = Array.from({ length: GRID_SIZE }, () =>
    Array.from({ length: GRID_SIZE }, () => false),
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
    if (grid[r][c] === 'goal') reachedGoal = true;
    if (grid[r][c] === 'crystal') reachedCrystals += 1;

    for (const [dr, dc] of dirs) {
      const nr = r + dr;
      const nc = c + dc;
      if (
        nr < 0 ||
        nr >= GRID_SIZE ||
        nc < 0 ||
        nc >= GRID_SIZE ||
        visited[nr][nc]
      ) {
        continue;
      }
      const cell = grid[nr][nc];
      if (cell === 'wall' || cell === 'hole') continue;
      visited[nr][nc] = true;
      queue.push([nr, nc]);
    }
  }

  return reachedGoal && reachedCrystals >= totalCrystals;
}

const TOOLS: Array<{
  id: CellTool;
  label: string;
  activeClass: string;
  cellClass: string;
  symbol: string;
  icon: React.ReactNode;
}> = [
  {
    id: 'wall',
    label: 'Duvar',
    activeClass: 'border-fg/40 bg-surface-2 text-fg',
    cellClass: 'border-muted/50 bg-muted/30 text-fg',
    symbol: '■',
    icon: <Box className="h-3.5 w-3.5" aria-hidden="true" />,
  },
  {
    id: 'hole',
    label: 'Delik',
    activeClass: 'border-danger/50 bg-danger/15 text-danger',
    cellClass: 'border-danger/60 bg-danger/20 text-danger',
    symbol: '●',
    icon: <CircleDot className="h-3.5 w-3.5" aria-hidden="true" />,
  },
  {
    id: 'crystal',
    label: 'Kristal',
    activeClass: 'border-signal/50 bg-signal/15 text-signal',
    cellClass: 'border-signal/60 bg-signal/20 text-signal',
    symbol: '◆',
    icon: <Gem className="h-3.5 w-3.5" aria-hidden="true" />,
  },
  {
    id: 'laser',
    label: 'Lazer',
    activeClass: 'border-warn/50 bg-warn/15 text-warn',
    cellClass: 'border-warn/60 bg-warn/20 text-warn',
    symbol: '⚡',
    icon: <Zap className="h-3.5 w-3.5" aria-hidden="true" />,
  },
  {
    id: 'boost',
    label: 'Hız rampası',
    activeClass: 'border-brass/50 bg-brass/15 text-brass',
    cellClass: 'border-brass/60 bg-brass/20 text-brass',
    symbol: '▲',
    icon: <Play className="h-3.5 w-3.5" aria-hidden="true" />,
  },
  {
    id: 'moving',
    label: 'Devriye engel',
    activeClass: 'border-warn/50 bg-warn/15 text-warn',
    cellClass: 'border-warn/60 bg-warn/20 text-warn',
    symbol: '↔',
    icon: <Activity className="h-3.5 w-3.5" aria-hidden="true" />,
  },
  {
    id: 'start',
    label: 'Başlangıç',
    activeClass: 'border-signal/50 bg-signal/15 text-signal',
    cellClass: 'border-signal bg-signal/25 text-signal font-bold',
    symbol: 'B',
    icon: <MapPin className="h-3.5 w-3.5" aria-hidden="true" />,
  },
  {
    id: 'goal',
    label: 'Hedef',
    activeClass: 'border-ok/50 bg-ok/15 text-ok',
    cellClass: 'border-ok bg-ok/25 text-ok font-bold',
    symbol: 'H',
    icon: <Flag className="h-3.5 w-3.5" aria-hidden="true" />,
  },
  {
    id: 'erase',
    label: 'Silgi',
    activeClass: 'border-line bg-surface-2 text-fg',
    cellClass: '',
    symbol: '',
    icon: <Eraser className="h-3.5 w-3.5" aria-hidden="true" />,
  },
];

const TOOL_BY_ID = Object.fromEntries(TOOLS.map((t) => [t.id, t])) as Record<
  CellTool,
  (typeof TOOLS)[number]
>;

/**
 * Kullanıcının 8×8 görsel ızgara üzerinden kendi 3B labirent haritasını
 * (duvar, delik, kristal, lazer, devriye engel, rampa) tasarlayıp anında
 * oynayabildiği ve JSON olarak paylaşabildiği Harita Editörü.
 */
export function LevelEditorModal() {
  const isEditorOpen = useGameStore((s) => s.isEditorOpen);
  const customLevel = useGameStore((s) => s.customLevel);
  const setEditorOpen = useGameStore((s) => s.setEditorOpen);
  const setCustomLevel = useGameStore((s) => s.setCustomLevel);

  const cellRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const copiedJsonTimerRef = useRef<number | null>(null);
  const [activeTool, setActiveTool] = useState<CellTool>('wall');
  const [customTitle, setCustomTitle] = useState('Özel Labirent — Tasarım 1');
  const [copiedJson, setCopiedJson] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (copiedJsonTimerRef.current !== null) {
        window.clearTimeout(copiedJsonTimerRef.current);
      }
    };
  }, []);

  const [grid, setGrid] = useState<CellTool[][]>(() => {
    const initial: CellTool[][] = Array.from({ length: GRID_SIZE }, () =>
      Array.from({ length: GRID_SIZE }, () => 'erase'),
    );
    initial[0][0] = 'start';
    initial[GRID_SIZE - 1][GRID_SIZE - 1] = 'goal';
    initial[2][2] = 'wall';
    initial[2][3] = 'wall';
    initial[3][5] = 'crystal';
    initial[5][2] = 'hole';
    initial[4][4] = 'laser';
    return initial;
  });

  useEffect(() => {
    if (!isEditorOpen) return;
    setImportError(null);
    if (customLevel) {
      setGrid(levelDefinitionToGrid(customLevel));
      setCustomTitle(customLevel.title);
    }
  }, [isEditorOpen, customLevel]);

  const handleCellClick = (r: number, c: number) => {
    setImportError(null);
    setGrid((prev) => {
      const next = prev.map((row) => [...row]);

      if (activeTool === 'start' || activeTool === 'goal') {
        if (next[r][c] === activeTool) {
          return prev;
        }
        const displacedTool = next[r][c] === 'start' || next[r][c] === 'goal' ? next[r][c] : 'erase';
        for (let i = 0; i < GRID_SIZE; i++) {
          for (let j = 0; j < GRID_SIZE; j++) {
            if (next[i][j] === activeTool) {
              next[i][j] = displacedTool;
            }
          }
        }
        next[r][c] = activeTool;
        return next;
      }

      if (next[r][c] === 'start' || next[r][c] === 'goal') {
        return prev;
      }

      next[r][c] = next[r][c] === activeTool ? 'erase' : activeTool;
      return next;
    });
  };

  const handleClearGrid = () => {
    setImportError(null);
    setGrid(() => {
      const cleared: CellTool[][] = Array.from({ length: GRID_SIZE }, () =>
        Array.from({ length: GRID_SIZE }, () => 'erase'),
      );
      cleared[0][0] = 'start';
      cleared[GRID_SIZE - 1][GRID_SIZE - 1] = 'goal';
      return cleared;
    });
  };

  const handleRandomizeGrid = () => {
    setImportError(null);
    setGrid(() => {
      for (let attempt = 0; attempt < 25; attempt++) {
        const next: CellTool[][] = Array.from({ length: GRID_SIZE }, () =>
          Array.from({ length: GRID_SIZE }, () => 'erase'),
        );
        next[0][0] = 'start';
        next[GRID_SIZE - 1][GRID_SIZE - 1] = 'goal';

        for (let r = 0; r < GRID_SIZE; r++) {
          for (let c = 0; c < GRID_SIZE; c++) {
            if (
              (r <= 1 && c <= 1) ||
              (r >= GRID_SIZE - 2 && c >= GRID_SIZE - 2)
            ) {
              continue;
            }
            const roll = Math.random();
            if (roll < 0.16) next[r][c] = 'wall';
            else if (roll < 0.23) next[r][c] = 'crystal';
            else if (roll < 0.28) next[r][c] = 'hole';
            else if (roll < 0.31) next[r][c] = 'boost';
            else if (roll < 0.34) next[r][c] = 'moving';
          }
        }

        if (hasSolvableGridPath(next)) {
          return next;
        }
      }

      const fallback: CellTool[][] = Array.from({ length: GRID_SIZE }, () =>
        Array.from({ length: GRID_SIZE }, () => 'erase'),
      );
      fallback[0][0] = 'start';
      fallback[GRID_SIZE - 1][GRID_SIZE - 1] = 'goal';
      fallback[2][2] = 'crystal';
      fallback[5][5] = 'crystal';
      fallback[3][3] = 'wall';
      fallback[4][4] = 'wall';
      return fallback;
    });
  };

  const buildLevelDefinition = (): MazeLevelDefinition => {
    let startPos: [number, number, number] = [-4.5, 0.34, -4.5];
    let goalPos: [number, number, number] = [4.5, 0.35, 4.5];
    let goalCell: [number, number] = [GRID_SIZE - 1, GRID_SIZE - 1];
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (grid[r][c] === 'goal') {
          goalCell = [r, c];
        }
      }
    }

    const isOutOfBounds = (r: number, c: number) =>
      r < 0 || r >= GRID_SIZE || c < 0 || c >= GRID_SIZE;
    const isWallCell = (r: number, c: number) =>
      isOutOfBounds(r, c) || grid[r][c] === 'wall';
    const isBlockedCell = (r: number, c: number) =>
      isOutOfBounds(r, c) || grid[r][c] === 'wall' || grid[r][c] === 'hole';

    const innerWalls: WallDefinition[] = [];
    const voidHoles: VoidHoleDefinition[] = [];
    const crystals: [number, number][] = [];
    const laserGates: LaserGateDefinition[] = [];
    const boostPads: BoostPadDefinition[] = [];
    const movingObstacles: MovingObstacleDefinition[] = [];

    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        const cell = grid[r][c];
        const [wx, wz] = gridToWorld(r, c);

        if (cell === 'start') {
          startPos = [wx, 0.34, wz];
        } else if (cell === 'goal') {
          goalPos = [wx, 0.35, wz];
        } else if (cell === 'wall') {
          innerWalls.push({
            position: [wx, 0.375, wz],
            size: [1.25, 0.75, 1.25],
          });
        } else if (cell === 'hole') {
          voidHoles.push({
            position: [wx, wz],
            radius: 0.42,
          });
        } else if (cell === 'crystal') {
          crystals.push([wx, wz]);
        } else if (cell === 'laser') {
          laserGates.push({
            position: [wx, wz],
            length: 1.3,
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
            amplitude: movingConfig.amplitude,
            speed: 2.2,
            phaseOffset: (r + c) * 0.5,
          });
        }
      }
    }

    return {
      id: 99,
      title: customTitle.trim() || 'Özel Harita',
      subtitle: 'Harita editörü ile oluşturuldu',
      boardSize: 12,
      startPosition: startPos,
      goalPosition: goalPos,
      innerWalls,
      voidHoles,
      crystals,
      laserGates,
      boostPads,
      movingObstacles,
    };
  };

  const handlePlayCustomLevel = () => {
    if (!hasSolvableGridPath(grid)) {
      setImportError(
        'Başlangıç noktasından tüm kristallere ve hedefe ulaşılabilir bir yol bulunmalıdır.',
      );
      return;
    }
    setImportError(null);
    setCustomLevel(buildLevelDefinition());
  };

  const handleCopyJson = async () => {
    try {
      const levelDef = buildLevelDefinition();
      await navigator.clipboard.writeText(JSON.stringify(levelDef, null, 2));
      setCopiedJson(true);
      setImportError(null);
      if (copiedJsonTimerRef.current !== null) {
        window.clearTimeout(copiedJsonTimerRef.current);
      }
      copiedJsonTimerRef.current = window.setTimeout(() => {
        setCopiedJson(false);
        copiedJsonTimerRef.current = null;
      }, 2000);
    } catch {
      setImportError('Pano erişimi reddedildi; harita kopyalanamadı.');
    }
  };

  const handleImportFromClipboard = async () => {
    try {
      const raw = await navigator.clipboard.readText();
      const parsed: unknown = JSON.parse(raw);
      const validated = parseCustomMazeLevel(parsed);
      if (!validated) {
        setImportError('Panodaki metin geçerli bir GyroMaze JSON haritası değil.');
        return;
      }

      setImportError(null);
      setCustomLevel(validated);
    } catch {
      setImportError('Panodan geçerli bir JSON haritası okunamadı.');
    }
  };

  const handleGridKeyDown = (
    e: KeyboardEvent<HTMLButtonElement>,
    rIdx: number,
    cIdx: number,
  ) => {
    let nextR = rIdx;
    let nextC = cIdx;
    if (e.key === 'ArrowRight') nextC = Math.min(GRID_SIZE - 1, cIdx + 1);
    else if (e.key === 'ArrowLeft') nextC = Math.max(0, cIdx - 1);
    else if (e.key === 'ArrowDown') nextR = Math.min(GRID_SIZE - 1, rIdx + 1);
    else if (e.key === 'ArrowUp') nextR = Math.max(0, rIdx - 1);
    else if (e.key === 'Home') nextC = 0;
    else if (e.key === 'End') nextC = GRID_SIZE - 1;
    else return;

    e.preventDefault();
    cellRefs.current[nextR * GRID_SIZE + nextC]?.focus();
  };

  return (
    <Modal
      open={isEditorOpen}
      onClose={() => setEditorOpen(false)}
      size="xl"
      title="3B Harita Editörü"
      description="8×8 ızgara üzerinde duvar, engel ve hedef noktalarını yerleştirin"
      icon={<Wrench className="h-4 w-4" aria-hidden="true" />}
      footer={
        <>
          <div className="mr-auto flex flex-wrap items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              icon={<Trash2 className="h-3.5 w-3.5 text-danger" aria-hidden="true" />}
              onClick={handleClearGrid}
            >
              Temizle
            </Button>
            <Button
              variant="secondary"
              size="sm"
              icon={<Shuffle className="h-3.5 w-3.5 text-brass" aria-hidden="true" />}
              onClick={handleRandomizeGrid}
            >
              Rastgele doldur
            </Button>
            <Button
              variant="secondary"
              size="sm"
              icon={
                copiedJson ? (
                  <Check className="h-3.5 w-3.5 text-ok" aria-hidden="true" />
                ) : (
                  <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                )
              }
              onClick={handleCopyJson}
            >
              {copiedJson ? 'JSON kopyalandı' : 'JSON kopyala'}
            </Button>
            <Button
              variant="secondary"
              size="sm"
              icon={<Upload className="h-3.5 w-3.5 text-signal" aria-hidden="true" />}
              onClick={handleImportFromClipboard}
            >
              Panodan yükle
            </Button>
          </div>
          <Button
            variant="primary"
            icon={<Play className="h-4 w-4 fill-current" aria-hidden="true" />}
            onClick={handlePlayCustomLevel}
          >
            3B sahnede oyna
          </Button>
        </>
      }
    >
      <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
        {/* Sol Araç Paleti */}
        <div className="space-y-4 md:col-span-5">
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-muted">
              Harita adı
            </span>
            <input
              type="text"
              maxLength={40}
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              className="w-full rounded-xl border border-line bg-surface-2 px-3 py-2 text-sm text-fg outline-none focus:border-brass"
            />
          </label>

          <div>
            <span className="mb-2 block text-xs font-medium text-muted">
              Yerleştirme aracı
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              {TOOLS.map((tool) => {
                const isSelected = activeTool === tool.id;
                return (
                  <button
                    key={tool.id}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => setActiveTool(tool.id)}
                    className={cx(
                      'flex min-h-9 cursor-pointer items-center gap-2 rounded-xl border px-3 py-1.5 text-xs font-medium transition-colors',
                      isSelected
                        ? tool.activeClass
                        : 'border-line bg-surface-2/50 text-muted hover:text-fg',
                    )}
                  >
                    {tool.icon}
                    <span>{tool.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {importError && (
            <p role="alert" className="text-xs text-danger">
              {importError}
            </p>
          )}
        </div>

        {/* Sağ 8×8 Etkileşimli Harita Izgarası */}
        <div className="flex flex-col items-center justify-center md:col-span-7">
          <div
            role="grid"
            aria-label="8 çarpı 8 labirent ızgarası"
            className="grid aspect-square w-full max-w-[332px] grid-cols-8 gap-1.5 rounded-2xl border border-line bg-base/70 p-3"
          >
            {grid.map((row, rIdx) =>
              row.map((cell, cIdx) => {
                const meta = TOOL_BY_ID[cell];
                return (
                  <button
                    key={`${rIdx}-${cIdx}`}
                    ref={(el) => {
                      cellRefs.current[rIdx * GRID_SIZE + cIdx] = el;
                    }}
                    type="button"
                    aria-label={`Satır ${rIdx + 1} Sütun ${cIdx + 1}: ${cell === 'erase' ? 'Boş' : meta.label}`}
                    onClick={() => handleCellClick(rIdx, cIdx)}
                    onKeyDown={(e) => handleGridKeyDown(e, rIdx, cIdx)}
                    className={cx(
                      'flex aspect-square cursor-pointer items-center justify-center rounded-lg border text-xs transition active:scale-90',
                      cell === 'erase'
                        ? 'border-line/70 bg-surface-2/50 hover:bg-surface-2'
                        : meta.cellClass,
                    )}
                  >
                    {meta.symbol}
                  </button>
                );
              }),
            )}
          </div>
          <p className="mt-2.5 text-center text-xs text-muted">
            Hücrelere tıklayarak öğe yerleştirin veya mevcut öğeyi kaldırın.
          </p>
        </div>
      </div>
    </Modal>
  );
}
