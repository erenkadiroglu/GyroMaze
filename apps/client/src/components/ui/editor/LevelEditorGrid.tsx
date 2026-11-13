'use client';

import { useRef, type KeyboardEvent } from 'react';
import type { CellTool } from '@/utils/editorUtils';
import { calculateNextGridCoords } from '@/utils/editorGridUtils';
import { EditorGridCell } from './grid/EditorGridCell';

interface LevelEditorGridProps {
  grid: CellTool[][];
  gridSize: number;
  onCellClick: (r: number, c: number) => void;
}

/**
 * Harita editörü 8x8 interaktif çizim ızgarası:
 * Erişilebilir iki boyutlu grid semantiği ve ok/home/end tuşlarıyla gezinim.
 */
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
    const { nextR, nextC, handled } = calculateNextGridCoords(
      e.key,
      rIdx,
      cIdx,
      gridSize,
    );

    if (handled) {
      e.preventDefault();
      cellRefs.current[nextR * gridSize + nextC]?.focus();
    }
  };

  return (
    <div
      role="grid"
      aria-label="Labirent ızgarası"
      className="grid grid-cols-8 gap-1 rounded-2xl border border-line bg-surface-2/40 p-2 sm:gap-1.5 sm:p-3"
    >
      {grid.map((row, rIdx) =>
        row.map((cell, cIdx) => {
          const flatIdx = rIdx * gridSize + cIdx;
          const isInitialTab = rIdx === 0 && cIdx === 0;

          return (
            <EditorGridCell
              key={`${rIdx}-${cIdx}`}
              rIdx={rIdx}
              cIdx={cIdx}
              cell={cell}
              isInitialTab={isInitialTab}
              onCellClick={onCellClick}
              onKeyDown={handleGridKeyDown}
              cellRef={(el) => {
                cellRefs.current[flatIdx] = el;
              }}
            />
          );
        }),
      )}
    </div>
  );
}
