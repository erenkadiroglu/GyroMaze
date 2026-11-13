'use client';

import { useEffect, useRef, useState } from 'react';
import { useGameStore } from '@/store/useGameStore';
import {
  type MazeLevelDefinition,
  parseCustomMazeLevel,
  encodeCustomMazeLevelForUrl,
  decodeCustomMazeLevelFromUrl,
  EDITOR_GRID_SIZE,
  validateEditorGrid,
  levelDefinitionToEditorGrid,
  buildLevelFromEditorGrid,
  CUSTOM_MAP_URL_PARAM,
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
import {
  buildInitialEditorGrid,
  createShareUrl,
  detectClipboardMapType,
} from '@/utils/editorActionUtils';
import { soundEngine } from '@/utils/soundEngine';

const GRID_SIZE = EDITOR_GRID_SIZE;

export function useLevelEditor() {
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

  const [grid, setGrid] = useState<CellTool[][]>(() =>
    buildInitialEditorGrid(GRID_SIZE),
  );

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
        payload = createShareUrl(window.location.href, encoded);
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
      const type = detectClipboardMapType(raw);
      if (type === 'json') {
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

  return {
    isEditorOpen,
    closeEditor: () => setEditorOpen(false),
    activeTool,
    setActiveTool: (tool: CellTool) => {
      setActiveTool(tool);
      setImportError(null);
    },
    customTitle,
    setCustomTitle,
    boardSize,
    setBoardSize,
    copiedKind,
    importError,
    grid,
    gridSize: GRID_SIZE,
    handleCellClick,
    handleClearGrid,
    handleApplyTemplate,
    handleRandomizeGrid,
    handlePlayCustomLevel,
    handleCopyExport,
    handleImportFromClipboard,
  };
}
