import { BOARD_SIZE_OPTIONS } from './editorUtils.ts';

export { BOARD_SIZE_OPTIONS };

export const MAX_MAP_TITLE_LENGTH = 40;

/**
 * Harita başlığını temizler ve maksimum uzunluğa kırpar.
 */
export function sanitizeMapTitle(title: string): string {
  if (typeof title !== 'string') return '';
  return title.slice(0, MAX_MAP_TITLE_LENGTH);
}

/**
 * Tahta boyutu için etiket üretir (örn: 12 -> "12×12").
 */
export function formatBoardSizeLabel(size: number): string {
  const safeSize = Number.isFinite(size) && size > 0 ? size : 12;
  return `${safeSize}×${safeSize}`;
}

/**
 * Belirtilen tahta boyutunun seçili olup olmadığını denetler.
 */
export function isBoardSizeSelected(currentSize: number, optionSize: number): boolean {
  return currentSize === optionSize;
}

/**
 * Tahta boyutu butonu için stil sınıfını üretir.
 */
export function resolveBoardSizeButtonClass(isSelected: boolean): string {
  const base =
    'rounded-xl border py-2 text-center text-xs font-medium transition-colors cursor-pointer';
  if (isSelected) {
    return `${base} border-signal bg-signal/15 text-signal`;
  }
  return `${base} border-line bg-surface-2/40 text-muted hover:border-line hover:text-fg`;
}
