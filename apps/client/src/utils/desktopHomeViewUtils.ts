/**
 * GyroMaze Masaüstü Ana Ekranı (HomePage / DesktopHomeView) stil, yükleme ve erişilebilirlik yardımcıları.
 */

/**
 * Masaüstü ana ekran <main> etiketinin standart CSS sınıfını döner.
 */
export function getDesktopHomeMainClassName(): string {
  return 'relative h-screen w-screen overflow-hidden bg-base text-fg';
}

/**
 * 3B sahne dynamic yüklenirken gösterilen kapsayıcı div sınıfını döner.
 */
export function getDesktopLoadingContainerClassName(): string {
  return 'fixed inset-0 flex flex-col items-center justify-center bg-base text-muted';
}

/**
 * Yükleme göstergesi döner çember (spinner) sınıfını döner.
 */
export function getDesktopLoadingSpinnerClassName(): string {
  return 'h-8 w-8 animate-spin rounded-full border-2 border-line border-t-brass';
}

/**
 * 3B sahne yüklenirken ekrana ve ekran okuyuculara yansıtılan bilgilendirme metnini döner.
 */
export function getDesktopLoadingMessage(): string {
  return '3B fizik sahnesi hazırlanıyor...';
}

/**
 * Masaüstü ev sahibi soket başlatma yapılandırma nesnesini döner.
 */
export function getDesktopSocketRoleConfig(): { role: 'host' } {
  return { role: 'host' };
}

/**
 * Masaüstü ana sahne erişilebilir bölgesinin açıklama etiketini formatlar.
 */
export function formatDesktopStageAriaLabel(level?: number | string | null): string {
  if (level !== undefined && level !== null && String(level).trim().length > 0) {
    return `GyroMaze Masaüstü 3B Labirent Sahnesi — Seviye ${String(level).trim()}`;
  }
  return 'GyroMaze Masaüstü 3B Labirent Sahnesi';
}
