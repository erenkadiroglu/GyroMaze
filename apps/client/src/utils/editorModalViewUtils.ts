/**
 * Harita Editörü Modalı (LevelEditorModal) görünüm, başlık ve araç yardımcı fonksiyonları.
 */

/**
 * Harita editörü modalı standart başlığını döner.
 */
export function getEditorModalTitle(): string {
  return '3B Harita Editörü';
}

/**
 * Harita editörü modalı standart açıklama metnini döner.
 */
export function getEditorModalDescription(): string {
  return '8×8 ızgara üzerinde duvar, engel ve hedef noktalarını yerleştirin';
}

/**
 * Modal boyutu için standart tasarım boyutunu döner ('xl').
 */
export function getEditorModalSize(): 'xl' {
  return 'xl';
}

/**
 * Harita başlığını temizler ve boşsa varsayılan başlığı atar.
 */
export function resolveEditorModalInitialTitle(title?: string | null): string {
  const safe = (title ?? '').trim();
  return safe.length > 0 ? safe : 'Özel Labirent Haritası';
}

/**
 * Ekran okuyucular için harita adı ve ızgara boyutunu içeren açıklayıcı etiket döner.
 */
export function formatEditorModalAriaLabel(
  customTitle: string,
  boardSize: number,
): string {
  const safeTitle = (customTitle ?? '').trim() || 'Özel Harita';
  const safeSize = Number.isFinite(boardSize) && boardSize > 0 ? Math.floor(boardSize) : 12;
  return `${safeTitle} (${safeSize}x${safeSize} Izgara)`;
}

/**
 * İki boyutlu ızgara matrisinin tamamen boş olup olmadığını denetler.
 */
export function isEditorGridEmpty(grid?: unknown[][]): boolean {
  if (!Array.isArray(grid) || grid.length === 0) return true;
  for (const row of grid) {
    if (!Array.isArray(row)) continue;
    for (const cell of row) {
      if (cell !== 0 && cell !== 'empty' && cell !== null && cell !== undefined) {
        return false;
      }
    }
  }
  return true;
}

/**
 * Editör araç türüne göre insan tarafından okunabilir açıklama metnini döner.
 */
export function formatEditorToolDescription(tool: string): string {
  switch (tool) {
    case 'wall':
      return 'Duvar Bloğu';
    case 'goal':
      return 'Hedef Portalı';
    case 'crystal':
      return 'Toplanabilir Kristal';
    case 'hole':
      return 'Boşluk Çukuru';
    case 'boost':
      return 'Hızlandırıcı Rampa';
    case 'laser':
      return 'Lazer Bariyeri';
    case 'eraser':
      return 'Silgi Aracı';
    default:
      return 'Bilinmeyen Araç';
  }
}

