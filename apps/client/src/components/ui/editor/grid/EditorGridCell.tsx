'use client';

import type { KeyboardEvent } from 'react';
import type { CellTool } from '@/utils/editorUtils';
import { TOOL_BY_ID } from '@/utils/editorToolbarUtils';
import {
  formatCellAriaLabel,
  resolveGridCellClass,
} from '@/utils/editorGridUtils';

interface EditorGridCellProps {
  rIdx: number;
  cIdx: number;
  cell: CellTool;
  isInitialTab: boolean;
  onCellClick: (r: number, c: number) => void;
  onKeyDown: (e: KeyboardEvent<HTMLButtonElement>, r: number, c: number) => void;
  cellRef: (el: HTMLButtonElement | null) => void;
}

/**
 * 8x8 Harita editörü tekil ızgara hücresi (role="gridcell")
 */
export function EditorGridCell({
  rIdx,
  cIdx,
  cell,
  isInitialTab,
  onCellClick,
  onKeyDown,
  cellRef,
}: EditorGridCellProps) {
  const tool = TOOL_BY_ID[cell];
  const isErase = cell === 'erase';

  return (
    <button
      ref={cellRef}
      type="button"
      role="gridcell"
      tabIndex={isInitialTab ? 0 : -1}
      aria-label={formatCellAriaLabel(rIdx, cIdx, tool.label)}
      onClick={() => onCellClick(rIdx, cIdx)}
      onKeyDown={(e) => onKeyDown(e, rIdx, cIdx)}
      className={resolveGridCellClass(tool, isErase)}
    >
      {tool.symbol}
    </button>
  );
}
