'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
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
} from 'lucide-react';
import { useGameStore } from '@/store/useGameStore';
import {
  MazeLevelDefinition,
  WallDefinition,
  VoidHoleDefinition,
  LaserGateDefinition,
  BoostPadDefinition,
} from '@/components/scene/mazeLevels';

type CellTool =
  | 'wall'
  | 'hole'
  | 'crystal'
  | 'laser'
  | 'boost'
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

/**
 * Kullanıcının tarayıcı üzerinden kendi 3B labirent haritasını (duvar, delik, kristal, lazer)
 * görsel bir ızgara üzerinde tasarlayıp anında oynayabilmesini sağlayan Harita Editörü.
 */
export function LevelEditorModal() {
  const isEditorOpen = useGameStore((s) => s.isEditorOpen);
  const setEditorOpen = useGameStore((s) => s.setEditorOpen);
  const setCustomLevel = useGameStore((s) => s.setCustomLevel);

  const [activeTool, setActiveTool] = useState<CellTool>('wall');
  const [customTitle, setCustomTitle] = useState('Özel Labirent — Tasarım #1');
  const [copiedJson, setCopiedJson] = useState(false);

  // 8x8 ızgara durumu
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

      // Başlangıç veya Hedef taşınıyorsa eski konumu temizle
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

      // Mevcut başlangıç veya hedef hücresinin silinmesini engelle
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

  const buildLevelDefinition = (): MazeLevelDefinition => {
    let startPos: [number, number, number] = [-4.5, 0.34, -4.5];
    let goalPos: [number, number, number] = [4.5, 0.35, 4.5];
    const innerWalls: WallDefinition[] = [];
    const voidHoles: VoidHoleDefinition[] = [];
    const crystals: [number, number][] = [];
    const laserGates: LaserGateDefinition[] = [];
    const boostPads: BoostPadDefinition[] = [];

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
        }
      }
    }

    return {
      id: 99,
      title: customTitle.trim() || 'Özel Harita',
      subtitle: 'Harita Editörü ile oluşturulan özel labirent',
      boardSize: 12,
      startPosition: startPos,
      goalPosition: goalPos,
      innerWalls,
      voidHoles,
      crystals,
      laserGates,
      boostPads,
    };
  };

  const handlePlayCustomLevel = () => {
    const levelDef = buildLevelDefinition();
    setCustomLevel(levelDef);
  };

  const handleCopyJson = async () => {
    try {
      const levelDef = buildLevelDefinition();
      await navigator.clipboard.writeText(JSON.stringify(levelDef, null, 2));
      setCopiedJson(true);
      window.setTimeout(() => setCopiedJson(false), 2000);
    } catch {
      // Panoya kopyalama başarısız olursa yoksay
    }
  };

  const tools: Array<{
    id: CellTool;
    label: string;
    colorClass: string;
    icon: React.ReactNode;
  }> = [
    {
      id: 'wall',
      label: 'Duvar Bloğu',
      colorClass: 'border-zinc-500 bg-zinc-700 text-zinc-100',
      icon: <Box className="h-3.5 w-3.5" />,
    },
    {
      id: 'hole',
      label: 'Tuzak Deliği',
      colorClass: 'border-rose-500/50 bg-rose-500/20 text-rose-300',
      icon: <CircleDot className="h-3.5 w-3.5" />,
    },
    {
      id: 'crystal',
      label: 'Enerji Kristali',
      colorClass: 'border-sky-500/50 bg-sky-500/20 text-sky-300',
      icon: <Gem className="h-3.5 w-3.5" />,
    },
    {
      id: 'laser',
      label: 'Lazer Kapı',
      colorClass: 'border-pink-500/50 bg-pink-500/20 text-pink-300',
      icon: <Zap className="h-3.5 w-3.5" />,
    },
    {
      id: 'boost',
      label: 'Hız Rampası',
      colorClass: 'border-purple-500/50 bg-purple-500/20 text-purple-300',
      icon: <Play className="h-3.5 w-3.5" />,
    },
    {
      id: 'start',
      label: 'Başlangıç',
      colorClass: 'border-cyan-400/50 bg-cyan-500/20 text-cyan-200',
      icon: <MapPin className="h-3.5 w-3.5" />,
    },
    {
      id: 'goal',
      label: 'Hedef Portalı',
      colorClass: 'border-emerald-500/50 bg-emerald-500/20 text-emerald-300',
      icon: <Flag className="h-3.5 w-3.5" />,
    },
    {
      id: 'erase',
      label: 'Silgi',
      colorClass: 'border-zinc-700 bg-zinc-800/80 text-zinc-400',
      icon: <Eraser className="h-3.5 w-3.5" />,
    },
  ];

  return (
    <AnimatePresence>
      {isEditorOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="pointer-events-auto fixed inset-0 z-40 flex items-center justify-center bg-zinc-950/80 p-4 backdrop-blur-md"
        >
          <motion.div
            initial={{ scale: 0.94, opacity: 0, y: 12 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.94, opacity: 0, y: 12 }}
            className="w-full max-w-2xl rounded-3xl border border-zinc-800 bg-zinc-900/95 p-6 shadow-2xl"
          >
            {/* Başlık */}
            <div className="mb-4 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold tracking-wider text-emerald-400 uppercase">
                  Faz 5 • Özel Bölüm Tasarımcısı
                </span>
                <h2 className="text-xl font-semibold text-zinc-100">
                  3B Labirent Harita Editörü
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setEditorOpen(false)}
                className="cursor-pointer rounded-xl border border-zinc-800 bg-zinc-800/60 p-2 text-zinc-400 transition hover:text-zinc-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
              {/* Sol Araç Paleti */}
              <div className="flex flex-col justify-between space-y-4 md:col-span-5">
                <div className="space-y-3">
                  <label className="block text-xs font-medium text-zinc-400">
                    Harita Adı
                    <input
                      type="text"
                      value={customTitle}
                      onChange={(e) => setCustomTitle(e.target.value)}
                      className="mt-1.5 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-zinc-100 outline-none focus:border-emerald-500"
                    />
                  </label>

                  <span className="block text-xs font-medium text-zinc-400">
                    Yerleştirme Aracı Seçin
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    {tools.map((tool) => (
                      <button
                        key={tool.id}
                        type="button"
                        onClick={() => setActiveTool(tool.id)}
                        className={`flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 text-xs font-medium transition ${
                          activeTool === tool.id
                            ? tool.colorClass
                            : 'border-zinc-800/80 bg-zinc-950/60 text-zinc-400 hover:bg-zinc-800/50'
                        }`}
                      >
                        {tool.icon}
                        <span>{tool.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleClearGrid}
                      className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-800/50 py-2.5 text-xs font-medium text-zinc-300 transition hover:bg-zinc-800"
                    >
                      <Trash2 className="h-3.5 w-3.5 text-rose-400" />
                      <span>Temizle</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleCopyJson}
                      className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-800/50 py-2.5 text-xs font-medium text-zinc-300 transition hover:bg-zinc-800"
                    >
                      {copiedJson ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-emerald-400" />
                          <span className="text-emerald-300">Kopyalandı</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5 text-zinc-400" />
                          <span>JSON Kopyala</span>
                        </>
                      )}
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handlePlayCustomLevel}
                    className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-emerald-500 py-3 text-xs font-semibold text-zinc-950 shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-400"
                  >
                    <Play className="h-4 w-4 fill-current" />
                    <span>Haritayı 3B Sahnede Hemen Oyna</span>
                  </button>
                </div>
              </div>

              {/* Sağ 8x8 Etkileşimli Harita Izgarası */}
              <div className="flex flex-col items-center justify-center md:col-span-7">
                <div className="grid aspect-square w-full max-w-[330px] grid-cols-8 gap-1.5 rounded-2xl border border-zinc-800 bg-zinc-950 p-3">
                  {grid.map((row, rIdx) =>
                    row.map((cell, cIdx) => {
                      let cellStyle =
                        'border-zinc-800/70 bg-zinc-900/60 hover:bg-zinc-800/70';
                      let label = '';

                      if (cell === 'wall') {
                        cellStyle = 'border-zinc-500 bg-zinc-600 text-zinc-100';
                        label = '■';
                      } else if (cell === 'hole') {
                        cellStyle =
                          'border-rose-500 bg-rose-500/30 text-rose-300';
                        label = '●';
                      } else if (cell === 'crystal') {
                        cellStyle = 'border-sky-400 bg-sky-500/30 text-sky-200';
                        label = '◆';
                      } else if (cell === 'laser') {
                        cellStyle =
                          'border-pink-500 bg-pink-500/30 text-pink-200';
                        label = '⚡';
                      } else if (cell === 'boost') {
                        cellStyle =
                          'border-purple-500 bg-purple-500/30 text-purple-200';
                        label = '▲';
                      } else if (cell === 'start') {
                        cellStyle =
                          'border-cyan-400 bg-cyan-500/30 text-cyan-200 font-bold';
                        label = 'B';
                      } else if (cell === 'goal') {
                        cellStyle =
                          'border-emerald-400 bg-emerald-500/30 text-emerald-200 font-bold';
                        label = 'H';
                      }

                      return (
                        <button
                          key={`${rIdx}-${cIdx}`}
                          type="button"
                          onClick={() => handleCellClick(rIdx, cIdx)}
                          className={`flex aspect-square cursor-pointer items-center justify-center rounded-lg border text-xs transition active:scale-90 ${cellStyle}`}
                        >
                          {label}
                        </button>
                      );
                    }),
                  )}
                </div>
                <span className="mt-2 text-[11px] text-zinc-400">
                  Hücrelere tıklayarak duvar (■), delik (●), kristal (◆) veya
                  lazer (⚡) yerleştirin
                </span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

