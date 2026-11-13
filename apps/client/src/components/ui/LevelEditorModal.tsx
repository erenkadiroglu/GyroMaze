'use client';

import { Wrench } from 'lucide-react';
import { useLevelEditor } from '@/hooks/useLevelEditor';
import {
  getEditorModalTitle,
  getEditorModalDescription,
  getEditorModalSize,
} from '@/utils/editorModalViewUtils';
import { Modal } from './primitives';
import {
  LevelEditorToolbar,
  LevelEditorGrid,
  LevelEditorTemplatesList,
  LevelEditorMetaControls,
  LevelEditorFooter,
} from './editor';

/**
 * 8×8 görsel ızgara üzerinden kendi 3B labirent haritasını
 * tasarlayıp anında oynayabildiği ve JSON/bağlantı olarak paylaşabildiği
 * modüler Harita Editörü Modalı.
 */
export function LevelEditorModal() {
  const {
    isEditorOpen,
    closeEditor,
    activeTool,
    setActiveTool,
    customTitle,
    setCustomTitle,
    boardSize,
    setBoardSize,
    copiedKind,
    importError,
    grid,
    gridSize,
    handleCellClick,
    handleClearGrid,
    handleApplyTemplate,
    handleRandomizeGrid,
    handlePlayCustomLevel,
    handleCopyExport,
    handleImportFromClipboard,
  } = useLevelEditor();

  return (
    <Modal
      open={isEditorOpen}
      onClose={closeEditor}
      size={getEditorModalSize()}
      title={getEditorModalTitle()}
      description={getEditorModalDescription()}
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
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2" role="region" aria-label="Harita Editörü Çalışma Alanı">
        <div className="space-y-4">
          <LevelEditorTemplatesList onApplyTemplate={handleApplyTemplate} />
          <LevelEditorToolbar
            activeTool={activeTool}
            onSelectTool={setActiveTool}
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
            gridSize={gridSize}
            onCellClick={handleCellClick}
          />
        </div>
      </div>
    </Modal>
  );
}
