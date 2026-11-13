'use client';

import { useEffect, useRef, useState } from 'react';
import { useGameStore } from '@/store/useGameStore';
import {
  type MazeLevelDefinition,
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
} from '@/utils/editorUtils';
import { buildInitialEditorGrid } from '@/utils/editorActionUtils';
import {
  canExportGrid,
  resolveExportPayload,
  parseClipboardMapData,
  getEditorInitialTitle,
  getEditorInitialBoardSize,
} from '@/utils/editorOrchestrationUtils';
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
  const [customTitle, setCustomTitle] = useState(() =>
    getEditorInitialTitle(customLevel?.title),
  );
  const [boardSize, setBoardSize] = useState<number>(() =>
    getEditorInitialBoardSize(customLevel?.boardSize),
  );
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
    const exportCheck = canExportGrid(grid);
    if (!exportCheck.canExport) {
      setImportError(exportCheck.reason ?? 'Harita dışa aktarılamadı.');
      return;
    }

    try {
      const levelDef = buildLevelDefinition();
      const payload = resolveExportPayload(levelDef, kind, window.location.href);

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
      const raw = await navigator.clipboard.readText();
      const validated = parseClipboardMapData(raw);

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
