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
  Orbit,
  Link2,
} from 'lucide-react';
import { useGameStore } from '@/store/useGameStore';
import {
  MazeLevelDefinition,
  EditorCellTool,
  parseCustomMazeLevel,
  CUSTOM_MAP_URL_PARAM,
  encodeCustomMazeLevelForUrl,
  decodeCustomMazeLevelFromUrl,
  EDITOR_GRID_SIZE,
  validateEditorGrid,
  levelDefinitionToEditorGrid,
  buildLevelFromEditorGrid,
} from '@/components/scene/mazeLevels';
import {
  EDITOR_TEMPLATES,
  EditorTemplate,
  createEmptyGrid,
} from '@/utils/editorTemplates';
import { soundEngine } from '@/utils/soundEngine';
import { Modal, Button, cx, handleRadioGroupKeyDown } from './primitives';

type CellTool = EditorCellTool;

const GRID_SIZE = EDITOR_GRID_SIZE;
const BOARD_SIZE_OPTIONS = [12, 14, 16] as const;

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
    id: 'portal',
    label: 'Portal (çift)',
    activeClass: 'border-signal/50 bg-signal/15 text-signal',
    cellClass: 'border-signal/60 bg-signal/20 text-signal font-bold',
    symbol: '◎',
    icon: <Orbit className="h-3.5 w-3.5" aria-hidden="true" />,
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
  const isSoundMuted = useGameStore((s) => s.isSoundMuted);

  const cellRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const copyTimerRef = useRef<number | null>(null);
  const [activeTool, setActiveTool] = useState<CellTool>('wall');
  const [customTitle, setCustomTitle] = useState('Özel Labirent — Tasarım 1');
  const [boardSize, setBoardSize] = useState<number>(12);
  const [copiedKind, setCopiedKind] = useState<'json' | 'link' | null>(null);
  const [importError, setImportError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (copyTimerRef.current !== null) {
        window.clearTimeout(copyTimerRef.current);
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
      setGrid(levelDefinitionToEditorGrid(customLevel, GRID_SIZE));
      setCustomTitle(customLevel.title);
      setBoardSize(customLevel.boardSize);
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
    setGrid(createEmptyGrid(GRID_SIZE));
    if (!isSoundMuted) soundEngine.playUIClick();
  };

  const handleApplyTemplate = (tmpl: EditorTemplate) => {
    setImportError(null);
    setGrid(tmpl.grid.map((row) => [...row]));
    setCustomTitle(`Özel — ${tmpl.name}`);
    setBoardSize(tmpl.boardSize);
    if (!isSoundMuted) soundEngine.playUIClick();
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

        if (validateEditorGrid(next).ok) {
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

  const buildLevelDefinition = (): MazeLevelDefinition =>
    buildLevelFromEditorGrid(grid, {
      title: customTitle,
      boardSize,
    });

  const handlePlayCustomLevel = () => {
    const validation = validateEditorGrid(grid);
    if (!validation.ok) {
      setImportError(validation.reason);
      return;
    }
    setImportError(null);
    setCustomLevel(buildLevelDefinition());
  };

  const handleCopyExport = async (kind: 'json' | 'link') => {
    const portalCount = grid.flat().filter((c) => c === 'portal').length;
    if (portalCount % 2 !== 0) {
      setImportError(
        'Dışa aktarmadan önce açıkta kalan kuantum portal için bir eş daha yerleştirin.',
      );
      return;
    }
    try {
      const levelDef = buildLevelDefinition();
      let payload: string;
      if (kind === 'link') {
        const encoded = encodeCustomMazeLevelForUrl(levelDef);
        const shareUrl = new URL(window.location.href);
        shareUrl.pathname = '/';
        shareUrl.search = '';
        shareUrl.hash = '';
        shareUrl.searchParams.set(CUSTOM_MAP_URL_PARAM, encoded);
        payload = shareUrl.toString();
      } else {
        payload = JSON.stringify(levelDef, null, 2);
      }

      await navigator.clipboard.writeText(payload);
      setCopiedKind(kind);
      setImportError(null);
      if (copyTimerRef.current !== null) {
        window.clearTimeout(copyTimerRef.current);
      }
      copyTimerRef.current = window.setTimeout(() => {
        setCopiedKind(null);
        copyTimerRef.current = null;
      }, 2000);
    } catch {
      setImportError('Pano erişimi reddedildi; harita kopyalanamadı.');
    }
  };

  const handleImportFromClipboard = async () => {
    try {
      const raw = (await navigator.clipboard.readText()).trim();
      let validated: MazeLevelDefinition | null = null;
      if (raw.startsWith('{')) {
        const parsed: unknown = JSON.parse(raw);
        validated = parseCustomMazeLevel(parsed);
      } else {
        let encodedParam: string | null = null;
        try {
          const parsedUrl = new URL(raw);
          encodedParam = parsedUrl.searchParams.get(CUSTOM_MAP_URL_PARAM);
        } catch {
          encodedParam = raw;
        }
        if (encodedParam) {
          validated = decodeCustomMazeLevelFromUrl(encodedParam);
        }
      }
      if (!validated) {
        setImportError(
          'Panodaki metin geçerli bir GyroMaze JSON haritası veya paylaşım bağlantısı değil.',
        );
        return;
      }

      setImportError(null);
      setCustomLevel(validated);
    } catch {
      setImportError(
        'Panodan geçerli bir GyroMaze haritası veya paylaşım bağlantısı okunamadı.',
      );
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
                copiedKind === 'json' ? (
                  <Check className="h-3.5 w-3.5 text-ok" aria-hidden="true" />
                ) : (
                  <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                )
              }
              onClick={() => handleCopyExport('json')}
            >
              {copiedKind === 'json' ? 'JSON kopyalandı' : 'JSON kopyala'}
            </Button>
            <Button
              variant="secondary"
              size="sm"
              icon={
                copiedKind === 'link' ? (
                  <Check className="h-3.5 w-3.5 text-ok" aria-hidden="true" />
                ) : (
                  <Link2 className="h-3.5 w-3.5 text-brass" aria-hidden="true" />
                )
              }
              onClick={() => handleCopyExport('link')}
            >
              {copiedKind === 'link' ? 'Bağlantı kopyalandı' : 'Bağlantı kopyala'}
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
            <span className="mb-1.5 block text-xs font-medium text-muted">
              Tahta boyutu
            </span>
            <div
              role="radiogroup"
              aria-label="Tahta boyutu"
              className="grid grid-cols-3 gap-1 rounded-xl border border-line bg-surface-2/60 p-1"
            >
              {BOARD_SIZE_OPTIONS.map((sizeOption, idx) => {
                const active = boardSize === sizeOption;
                return (
                  <button
                    key={sizeOption}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    tabIndex={active ? 0 : -1}
                    onClick={() => setBoardSize(sizeOption)}
                    onKeyDown={(e) =>
                      handleRadioGroupKeyDown(
                        e,
                        idx,
                        BOARD_SIZE_OPTIONS.length,
                        (nextIdx) => setBoardSize(BOARD_SIZE_OPTIONS[nextIdx]),
                      )
                    }
                    className={cx(
                      'cursor-pointer rounded-lg py-1.5 text-xs font-semibold transition-colors',
                      active
                        ? 'bg-surface text-brass ring-1 ring-brass/50'
                        : 'text-muted hover:text-fg',
                    )}
                  >
                    {sizeOption}×{sizeOption}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <span className="mb-1.5 block text-xs font-medium text-muted">
              Hazır şablonlar
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              {EDITOR_TEMPLATES.map((tmpl) => (
                <button
                  key={tmpl.id}
                  type="button"
                  onClick={() => handleApplyTemplate(tmpl)}
                  title={tmpl.description}
                  className="flex min-h-[34px] cursor-pointer items-center justify-between rounded-xl border border-line bg-surface-2/60 px-2.5 py-1 text-xs font-medium text-fg transition-colors hover:border-brass/60 hover:bg-surface-2 active:scale-95"
                >
                  <span className="truncate">{tmpl.name}</span>
                  <span className="gm-num font-mono text-[10px] text-muted">
                    {tmpl.boardSize}×
                  </span>
                </button>
              ))}
            </div>
          </div>

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
          {(() => {
            const portalOrderMap = new Map<string, number>();
            let portalCounter = 0;
            for (let r = 0; r < GRID_SIZE; r++) {
              for (let c = 0; c < GRID_SIZE; c++) {
                if (grid[r][c] === 'portal') {
                  portalOrderMap.set(`${r},${c}`, portalCounter++);
                }
              }
            }
            const portalCount = portalCounter;
            const hasOddPortal = portalCount % 2 !== 0;

            return (
              <>
                <div
                  role="grid"
                  aria-label="8 çarpı 8 labirent ızgarası"
                  className="grid aspect-square w-full max-w-[332px] grid-cols-8 gap-1.5 rounded-2xl border border-line bg-base/70 p-3"
                >
                  {grid.map((row, rIdx) =>
                    row.map((cell, cIdx) => {
                      const meta = TOOL_BY_ID[cell];
                      const portalIdx = portalOrderMap.get(`${rIdx},${cIdx}`);
                      const pairNumber =
                        portalIdx !== undefined
                          ? Math.floor(portalIdx / 2) + 1
                          : null;
                      const cellText =
                        cell === 'portal' && pairNumber !== null
                          ? `◎${pairNumber}`
                          : meta.symbol;
                      const cellLabel =
                        cell === 'portal' && pairNumber !== null
                          ? `Kuantum Portal Çifti #${pairNumber}`
                          : cell === 'erase'
                            ? 'Boş'
                            : meta.label;

                      return (
                        <button
                          key={`${rIdx}-${cIdx}`}
                          ref={(el) => {
                            cellRefs.current[rIdx * GRID_SIZE + cIdx] = el;
                          }}
                          type="button"
                          aria-label={`Satır ${rIdx + 1} Sütun ${cIdx + 1}: ${cellLabel}`}
                          onClick={() => handleCellClick(rIdx, cIdx)}
                          onKeyDown={(e) => handleGridKeyDown(e, rIdx, cIdx)}
                          className={cx(
                            'flex aspect-square cursor-pointer items-center justify-center rounded-lg border text-xs transition active:scale-90',
                            cell === 'erase'
                              ? 'border-line/70 bg-surface-2/50 hover:bg-surface-2'
                              : meta.cellClass,
                          )}
                        >
                          {cellText}
                        </button>
                      );
                    }),
                  )}
                </div>
                <p
                  className={cx(
                    'mt-2.5 text-center text-xs',
                    hasOddPortal ? 'font-medium text-warn' : 'text-muted',
                  )}
                >
                  {hasOddPortal
                    ? `Portal #${Math.floor(portalCount / 2) + 1} için bir çıkış portalı daha yerleştirin.`
                    : portalCount > 0
                      ? `${portalCount / 2} kuantum portal çifti eşleşti. Hücrelere tıklayarak öğe yerleştirin veya kaldırın.`
                      : 'Hücrelere tıklayarak öğe yerleştirin veya mevcut öğeyi kaldırın.'}
                </p>
              </>
            );
          })()}
        </div>
      </div>
    </Modal>
  );
}
