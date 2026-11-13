'use client';

import {
  BOARD_SIZE_OPTIONS,
  formatBoardSizeLabel,
  isBoardSizeSelected,
  resolveBoardSizeButtonClass,
} from '@/utils/editorMetaUtils';
import { handleRadioGroupKeyDown } from '../../primitives';

interface EditorBoardSizeSelectorProps {
  boardSize: number;
  onBoardSizeChange: (size: number) => void;
}

/**
 * Harita tahta boyutu radyo buton grubu (12x12, 14x14, 16x16)
 */
export function EditorBoardSizeSelector({
  boardSize,
  onBoardSizeChange,
}: EditorBoardSizeSelectorProps) {
  return (
    <div>
      <span
        id="board-size-label"
        className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted"
      >
        Tahta boyutu
      </span>
      <div
        role="radiogroup"
        aria-labelledby="board-size-label"
        className="grid grid-cols-3 gap-1.5"
      >
        {BOARD_SIZE_OPTIONS.map((size, idx) => {
          const isChecked = isBoardSizeSelected(boardSize, size);
          return (
            <button
              key={size}
              type="button"
              role="radio"
              aria-checked={isChecked}
              tabIndex={isChecked ? 0 : -1}
              onClick={() => onBoardSizeChange(size)}
              onKeyDown={(e) =>
                handleRadioGroupKeyDown(
                  e,
                  idx,
                  BOARD_SIZE_OPTIONS.length,
                  (nextIdx) => onBoardSizeChange(BOARD_SIZE_OPTIONS[nextIdx]),
                )
              }
              className={resolveBoardSizeButtonClass(isChecked)}
            >
              {formatBoardSizeLabel(size)}
            </button>
          );
        })}
      </div>
    </div>
  );
}
