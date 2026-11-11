'use client';

import { useState } from 'react';
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
  const setEditorOpen = useGameStore((s) => s.setEditorOpen);
  const setCustomLevel = useGameStore((s) => s.setCustomLevel);

  const [activeTool, setActiveTool] = useState<CellTool>('wall');
  const [customTitle, setCustomTitle] = useState('Özel Labirent — Tasarım 1');
  const [copiedJson, setCopiedJson] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);

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

  const handleCellClick = (r: number, c: number) => {
    setGrid((prev) => {
      const next = prev.map((row) => [...row]);

      if (activeTool === 'start' || activeTool === 'goal') {
        for (let i = 0; i < GRID_SIZE; i++) {
          for (let j = 0; j < GRID_SIZE; j++) {
            if (next[i][j] === activeTool) {
              next[i][j] = 'erase';
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
    setGrid(() => {
      const next: CellTool[][] = Array.from({ length: GRID_SIZE }, () =>
        Array.from({ length: GRID_SIZE }, () => 'erase'),
      );
      next[0][0] = 'start';
      next[GRID_SIZE - 1][GRID_SIZE - 1] = 'goal';

      for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
          if ((r <= 1 && c <= 1) || (r >= GRID_SIZE - 2 && c >= GRID_SIZE - 2))
            continue;
          const roll = Math.random();
          if (roll < 0.16) next[r][c] = 'wall';
          else if (roll < 0.23) next[r][c] = 'crystal';
          else if (roll < 0.28) next[r][c] = 'hole';
          else if (roll < 0.31) next[r][c] = 'boost';
          else if (roll < 0.34) next[r][c] = 'moving';
        }
      }
      return next;
    });
  };

  const buildLevelDefinition = (): MazeLevelDefinition => {
    let startPos: [number, number, number] = [-4.5, 0.34, -4.5];
    let goalPos: [number, number, number] = [4.5, 0.35, 4.5];
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
            axis: 'x',
            periodSeconds: 3.2,
            phaseOffset: (r + c) * 0.4,
          });
        } else if (cell === 'boost') {
          boostPads.push({
            position: [wx, wz],
            direction: [0, 1],
          });
        } else if (cell === 'moving') {
          movingObstacles.push({
            center: [wx, wz],
            axis: (r + c) % 2 === 0 ? 'x' : 'z',
            amplitude: 0.9,
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
    setCustomLevel(buildLevelDefinition());
  };

  const handleCopyJson = async () => {
    try {
      const levelDef = buildLevelDefinition();
      await navigator.clipboard.writeText(JSON.stringify(levelDef, null, 2));
      setCopiedJson(true);
      setImportError(null);
      window.setTimeout(() => setCopiedJson(false), 2000);
    } catch {
      setImportError('Pano erişimi reddedildi; harita kopyalanamadı.');
    }
  };

  const handleImportFromClipboard = async () => {
    try {
      const raw = await navigator.clipboard.readText();
      const parsed = JSON.parse(raw) as MazeLevelDefinition;
      if (
        !parsed ||
        !Array.isArray(parsed.startPosition) ||
        !Array.isArray(parsed.goalPosition) ||
        !Array.isArray(parsed.innerWalls)
      ) {
        setImportError('Panodaki metin geçerli bir GyroMaze JSON haritası değil.');
        return;
      }
      setImportError(null);
      setCustomLevel({
        ...parsed,
        id: 99,
      });
    } catch {
      setImportError('Panodan geçerli bir JSON haritası okunamadı.');
    }
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
                    type="button"
                    aria-label={`Satır ${rIdx + 1} Sütun ${cIdx + 1}: ${cell === 'erase' ? 'Boş' : meta.label}`}
                    onClick={() => handleCellClick(rIdx, cIdx)}
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
