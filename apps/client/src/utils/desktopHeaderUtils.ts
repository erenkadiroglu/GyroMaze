/**
 * Masaüstü HUD üst bilgi çubuğu (DesktopHeader) yardımcı fonksiyonları.
 */

/**
 * Masaüstü üst başlık çubuğu için erişilebilir semantik etiket döner.
 */
export function getHeaderAriaLabel(): string {
  return 'Masaüstü oyun üst bilgi çubuğu';
}

/**
 * Masaüstü üst çubuğu durum okumaları ve eylemler sağ kapsülü CSS sınıflarını döner.
 */
export function getHeaderStatusPanelClass(): string {
  return 'gm-panel pointer-events-auto flex flex-wrap items-center gap-2.5 rounded-2xl px-3.5 py-2 shadow-lg';
}

/**
 * Ekran okuyucu veya testler için anlık kristal, süre ve oyun modu özetini formatlar.
 */
export function formatHeaderStateSummary(
  ratioText: string,
  visibleTimerText: string,
  isMultiplayer: boolean,
): string {
  const crystalPart = (ratioText ?? '').trim() || '0/0';
  const timerPart = (visibleTimerText ?? '').trim() || '00:00.0';
  const modePart = isMultiplayer ? 'Çok Oyunculu' : 'Tek Oyunculu';

  return `Kristaller: ${crystalPart}, Süre: ${timerPart}, Mod: ${modePart}`;
}

/**
 * Üst çubuk eyleminin geçerli bir aksiyon olup olmadığını doğrular.
 */
export function isHeaderActionAvailable(
  action: 'pairing' | 'settings' | 'help' | string,
): boolean {
  return action === 'pairing' || action === 'settings' || action === 'help';
}

