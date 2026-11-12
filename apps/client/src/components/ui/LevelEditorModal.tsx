'use client';

import { useEffect, useRef, useState } from 'react';
import { Wrench } from 'lucide-react';
import { useGameStore } from '@/store/useGameStore';
import {
  MazeLevelDefinition,
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
  type EditorTemplate,
  createEmptyGrid,
} from '@/utils/editorTemplates';
import {
  type CellTool,
  applyToolToCell,
  generateRandomEditorGrid,
  isPortalCountBalanced,
} from '@/utils/editorUtils';
import { soundEngine } from '@/utils/soundEngine';
import { Modal } from './primitives';
import { LevelEditorToolbar } from './editor/LevelEditorToolbar';
import { LevelEditorGrid } from './editor/LevelEditorGrid';
import { LevelEditorTemplatesList } from './editor/LevelEditorTemplatesList';
import { LevelEditorMetaControls } from './editor/LevelEditorMetaControls';
import { LevelEditorFooter } from './editor/LevelEditorFooter';

const GRID_SIZE = EDITOR_GRID_SIZE;

/**
 * 8×8 görsel ızgara üzerinden kendi 3B labirent haritasını
 * tasarlayıp anında oynayabildiği ve JSON/bağlantı olarak paylaşabildiği
 * modüler Harita Editörü Modalı.
 */
export function LevelEditorModal() {
  const isEditorOpen = useGameStore((s) => s.isEditorOpen);
  const customLevel = useGameStore((s) => s.customLevel);
  const setEditorOpen = useGameStore((s) => s.setEditorOpen);
  const setCustomLevel = useGameStore((s) => s.setCustomLevel);
  const isSoundMuted = useGameStore((s) => s.isSoundMuted);

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
    setGrid((prev) => applyToolToCell(prev, r, c, activeTool, GRID_SIZE));
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
    setGrid(generateRandomEditorGrid(GRID_SIZE, validateEditorGrid));
    if (!isSoundMuted) soundEngine.playUIClick();
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
    if (!isPortalCountBalanced(grid)) {
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

  return (
    <Modal
      open={isEditorOpen}
      onClose={() => setEditorOpen(false)}
      size="xl"
      title="3B Harita Editörü"
      description="8×8 ızgara üzerinde duvar, engel ve hedef noktalarını yerleştirin"
      icon={<Wrench className="h-4 w-4" aria-hidden="true" />}
      footer={
        <LevelEditorFooter
          onClearGrid={handleClearGrid}
          onRandomizeGrid={handleRandomizeGrid}
          copiedKind={copiedKind}
          onCopyExport={handleCopyExport}
          onImportFromClipboard={handleImportFromClipboard}
          onPlayCustomLevel={handlePlayCustomLevel}
          importError={importError}
        />
      }
    >
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <LevelEditorTemplatesList onApplyTemplate={handleApplyTemplate} />
          <LevelEditorToolbar
            activeTool={activeTool}
            onSelectTool={(tool) => {
              setActiveTool(tool);
              setImportError(null);
            }}
          />
        </div>

        <div className="space-y-4">
          <LevelEditorMetaControls
            customTitle={customTitle}
            onTitleChange={setCustomTitle}
            boardSize={boardSize}
            onBoardSizeChange={setBoardSize}
          />
          <LevelEditorGrid
            grid={grid}
            gridSize={GRID_SIZE}
            onCellClick={handleCellClick}
          />
        </div>
      </div>
    </Modal>
  );
}
