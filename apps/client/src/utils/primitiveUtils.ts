/**
 * UI Primitives yardımcı ve hesaplama motoru.
 */

export const MODAL_WIDTH: Record<'sm' | 'md' | 'lg' | 'xl', string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-3xl',
};

/**
 * Koşullu sınıf adlarını birleştirir.
 */
export function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

/**
 * Modal boyutu için CSS sınıfını döner.
 */
export function getModalWidthClass(size: 'sm' | 'md' | 'lg' | 'xl' = 'md'): string {
  return MODAL_WIDTH[size] || MODAL_WIDTH.md;
}

/**
 * Düğme başlığı ve klavye kısayolu metnini formatlar.
 */
export function formatShortcutTitle(label: string, shortcut?: string): string {
  if (!shortcut || !shortcut.trim()) return label;
  return `${label} (${shortcut.trim()})`;
}

/**
 * WAI-ARIA radyo gruplarında yön tuşlarına basıldığında yeni indeksi hesaplar.
 * Değişiklik yoksa -1 döner.
 */
export function calculateNextRadioIndex(
  key: string,
  currentIndex: number,
  total: number,
): number {
  if (total < 2) return -1;

  if (key === 'ArrowRight' || key === 'ArrowDown') {
    return (currentIndex + 1) % total;
  }
  if (key === 'ArrowLeft' || key === 'ArrowUp') {
    return (currentIndex - 1 + total) % total;
  }
  if (key === 'Home') {
    return 0;
  }
  if (key === 'End') {
    return total - 1;
  }
  return -1;
}

