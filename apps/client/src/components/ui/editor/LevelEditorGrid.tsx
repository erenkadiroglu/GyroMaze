'use client';

import { useRef, type KeyboardEvent } from 'react';
import type { CellTool } from '@/utils/editorUtils';
import { TOOL_BY_ID } from './LevelEditorToolbar';
import { cx } from '../primitives';

interface LevelEditorGridProps {
  grid: CellTool[][];
  gridSize: number;
  onCellClick: (r: number, c: number) => void;
}

export function LevelEditorGrid({
  grid,
  gridSize,
  onCellClick,
}: LevelEditorGridProps) {
  const cellRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const handleGridKeyDown = (
    e: KeyboardEvent<HTMLButtonElement>,
    rIdx: number,
    cIdx: number,
  ) => {
    let nextR = rIdx;
    let nextC = cIdx;
    if (e.key === 'ArrowRight') nextC = Math.min(gridSize - 1, cIdx + 1);
    else if (e.key === 'ArrowLeft') nextC = Math.max(0, cIdx - 1);
    else if (e.key === 'ArrowDown') nextR = Math.min(gridSize - 1, rIdx + 1);
    else if (e.key === 'ArrowUp') nextR = Math.max(0, rIdx - 1);
    else if (e.key === 'Home') nextC = 0;
    else if (e.key === 'End') nextC = gridSize - 1;
    else return;

    e.preventDefault();
    cellRefs.current[nextR * gridSize + nextC]?.focus();
  };

  return (
    <div
      role="grid"
      aria-label="Labirent ızgarası"
      className="grid grid-cols-8 gap-1 rounded-2xl border border-line bg-surface-2/40 p-2 sm:gap-1.5 sm:p-3"
    >
      {grid.map((row, rIdx) =>
        row.map((cell, cIdx) => {
          const tool = TOOL_BY_ID[cell];
          const flatIdx = rIdx * gridSize + cIdx;
          const isInitialTab = rIdx === 0 && cIdx === 0;

          return (
            <button
              key={`${rIdx}-${cIdx}`}
              ref={(el) => {
                cellRefs.current[flatIdx] = el;
              }}
              type="button"
              role="gridcell"
              tabIndex={isInitialTab ? 0 : -1}
              aria-label={`Hücre Satır ${rIdx + 1}, Sütun ${cIdx + 1}: ${tool.label}`}
              onClick={() => onCellClick(rIdx, cIdx)}
              onKeyDown={(e) => handleGridKeyDown(e, rIdx, cIdx)}
              className={cx(
                'aspect-square rounded-lg border text-xs font-mono font-semibold transition-all flex items-center justify-center select-none',
                cell === 'erase'
                  ? 'border-line/60 bg-surface hover:border-fg/30 hover:bg-surface-2'
                  : tool.cellClass,
              )}
            >
              {tool.symbol}
            </button>
          );
        }),
      )}
    </div>
  );
}

