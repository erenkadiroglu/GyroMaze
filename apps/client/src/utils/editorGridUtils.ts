import type { ToolDefinition } from './editorToolbarUtils.ts';

export interface GridNavigationResult {
  nextR: number;
  nextC: number;
  handled: boolean;
}

/**
 * 2B Izgarada ok ve Home/End tuşlarına göre hedef koordinatı hesaplar.
 */
export function calculateNextGridCoords(
  key: string,
  rIdx: number,
  cIdx: number,
  gridSize: number,
): GridNavigationResult {
  let nextR = rIdx;
  let nextC = cIdx;
  let handled = true;

  if (key === 'ArrowRight') nextC = Math.min(gridSize - 1, cIdx + 1);
  else if (key === 'ArrowLeft') nextC = Math.max(0, cIdx - 1);
  else if (key === 'ArrowDown') nextR = Math.min(gridSize - 1, rIdx + 1);
  else if (key === 'ArrowUp') nextR = Math.max(0, rIdx - 1);
  else if (key === 'Home') nextC = 0;
  else if (key === 'End') nextC = gridSize - 1;
  else handled = false;

  return { nextR, nextC, handled };
}

/**
 * Hücre için erişilebilir ARIA etiketini üretir.
 */
export function formatCellAriaLabel(
  rIdx: number,
  cIdx: number,
  toolLabel: string,
): string {
  return `Hücre Satır ${rIdx + 1}, Sütun ${cIdx + 1}: ${toolLabel}`;
}

/**
 * Hücre butonunun stil sınıfını belirler.
 */
export function resolveGridCellClass(
  tool: ToolDefinition,
  isErase: boolean,
): string {
  const base =
    'aspect-square rounded-lg border text-xs font-mono font-semibold transition-all flex items-center justify-center select-none cursor-pointer';

  if (isErase) {
    return `${base} border-line/60 bg-surface hover:border-fg/30 hover:bg-surface-2`;
  }
  return `${base} ${tool.cellClass}`;
}
