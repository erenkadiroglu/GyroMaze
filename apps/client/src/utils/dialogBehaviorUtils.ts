export const FOCUSABLE_ELEMENTS_SELECTOR =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Tuşun Escape olup olmadığını denetler.
 */
export function isEscapeKey(key: string): boolean {
  return key === 'Escape';
}

/**
 * Tuşun Tab olup olmadığını denetler.
 */
export function isTabKey(key: string): boolean {
  return key === 'Tab';
}

/**
 * Tab tuşuna basıldığında odak döngüsündeki bir sonraki veya önceki elemanı hesaplar.
 */
export function resolveNextFocusElement(
  focusables: HTMLElement[],
  activeEl: HTMLElement | null,
  isShift: boolean,
  container: HTMLElement | null,
): HTMLElement | null {
  if (!focusables || focusables.length === 0) {
    return null;
  }

  const first = focusables[0];
  const last = focusables[focusables.length - 1];

  if (isShift) {
    if (!activeEl || activeEl === first || (container && !container.contains(activeEl))) {
      return last;
    }
  } else if (!activeEl || activeEl === last || (container && !container.contains(activeEl))) {
    return first;
  }

  return null;
}
