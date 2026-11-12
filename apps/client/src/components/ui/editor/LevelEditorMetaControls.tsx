'use client';

import { BOARD_SIZE_OPTIONS } from '@/utils/editorUtils';
import { cx, handleRadioGroupKeyDown } from '../primitives';

interface LevelEditorMetaControlsProps {
  customTitle: string;
  onTitleChange: (title: string) => void;
  boardSize: number;
  onBoardSizeChange: (size: number) => void;
}

export function LevelEditorMetaControls({
  customTitle,
  onTitleChange,
  boardSize,
  onBoardSizeChange,
}: LevelEditorMetaControlsProps) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <div>
        <label
          htmlFor="level-title-input"
          className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted"
        >
          Harita adı
        </label>
        <input
          id="level-title-input"
          type="text"
          value={customTitle}
          maxLength={40}
          onChange={(e) => onTitleChange(e.target.value)}
          className="w-full rounded-xl border border-line bg-surface-2/40 px-3 py-2 text-xs text-fg focus:border-signal focus:outline-none"
        />
      </div>

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
            const isChecked = boardSize === size;
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
                className={cx(
                  'rounded-xl border py-2 text-center text-xs font-medium transition-colors',
                  isChecked
                    ? 'border-signal bg-signal/15 text-signal'
                    : 'border-line bg-surface-2/40 text-muted hover:border-line hover:text-fg',
                )}
              >
                {size}×{size}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

