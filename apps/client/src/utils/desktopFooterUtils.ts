/**
 * Masaüstü HUD alt paneli (DesktopFooterControls) yardımcı ve formatlayıcı fonksiyonları.
 */

/**
 * Masaüstü alt paneli için semantik erişilebilir etiket döner.
 */
export function getFooterAriaLabel(): string {
  return 'Masaüstü oyun alt kontroller paneli';
}

/**
 * Masaüstü alt paneli ana container CSS sınıflarını döner.
 */
export function getFooterContainerClass(): string {
  return 'flex flex-wrap items-end justify-between gap-4';
}

/**
 * Mini-harita radarının gösterilip gösterilmeyeceğini güvenli boolean olarak doğrular.
 */
export function shouldRenderMiniMap(showMiniMap?: boolean | null): boolean {
  return Boolean(showMiniMap);
}

/**
 * Ekran okuyucu veya test telemetrisi için alt panel durum özetini üretir.
 */
export function formatFooterSummary(
  isMultiplayer: boolean,
  isControllerPaired: boolean,
  showMiniMap: boolean,
): string {
  const modeText = isMultiplayer ? 'Çok Oyunculu' : 'Tek Oyunculu';
  const controllerText = isControllerPaired ? 'Kontrolcü Bağlı' : 'Klavye Aktif';
  const radarText = showMiniMap ? 'Radar Açık' : 'Radar Gizli';

  return `Alt Panel: ${modeText}, ${controllerText}, ${radarText}`;
}

