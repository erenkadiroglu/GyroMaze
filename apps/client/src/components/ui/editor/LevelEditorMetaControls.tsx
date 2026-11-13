'use client';

import { EditorTitleInput } from './meta/EditorTitleInput';
import { EditorBoardSizeSelector } from './meta/EditorBoardSizeSelector';

interface LevelEditorMetaControlsProps {
  customTitle: string;
  onTitleChange: (title: string) => void;
  boardSize: number;
  onBoardSizeChange: (size: number) => void;
}

/**
 * Harita editörü üst meta kontrolleri:
 * Harita adı girişi ve tahta boyutu seçici ızgarası.
 */
export function LevelEditorMetaControls({
  customTitle,
  onTitleChange,
  boardSize,
  onBoardSizeChange,
}: LevelEditorMetaControlsProps) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <EditorTitleInput
        customTitle={customTitle}
        onTitleChange={onTitleChange}
      />
      <EditorBoardSizeSelector
        boardSize={boardSize}
        onBoardSizeChange={onBoardSizeChange}
      />
    </div>
  );
}
