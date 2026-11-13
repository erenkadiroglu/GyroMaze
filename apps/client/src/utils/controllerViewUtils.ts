/**
 * Mobil kontrolcü ana sayfası ve görünüm konteyneri yardımcı fonksiyonları.
 */

/**
 * Mobil kontrolcü ana arayüzü için semantik erişilebilirlik etiketini döner.
 */
export function getControllerMainAriaLabel(): string {
  return 'GyroMaze Mobil Kontrolcü Paneli';
}

/**
 * Mobil kontrolcü ana ekran kapsayıcısının (main) CSS stil sınıflarını döner.
 */
export function getControllerMainContainerClass(): string {
  return 'flex min-h-dvh flex-col justify-between bg-base px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))] text-fg select-none';
}

/**
 * Suspense fallback yükleme metnini döner.
 */
export function getControllerFallbackText(): string {
  return 'Kontrolcü yükleniyor...';
}

/**
 * Suspense fallback yükleme ekranı kapsayıcısının CSS stil sınıflarını döner.
 */
export function getControllerFallbackClass(): string {
  return 'flex min-h-dvh items-center justify-center bg-base text-xs text-muted';
}

/**
 * Aktif oda ve oyuncu yuvasına göre tarayıcı / sekme başlığı formatını üretir.
 */
export function formatControllerDocumentTitle(
  activeRoomCode?: string | null,
  playerSlot?: number | null,
): string {
  const safeCode = (activeRoomCode ?? '').trim();
  if (safeCode.length > 0) {
    const slot = playerSlot === 2 ? 2 : 1;
    return `GyroMaze Kontrolcü [${safeCode.toUpperCase()} - P${slot}]`;
  }
  return 'GyroMaze Kontrolcü';
}

/**
 * Kontrolcünün hem soket bağlantısının hem de oda eşleşmesinin hazır olup olmadığını doğrular.
 */
export function isControllerReady(
  isSocketConnected?: boolean | null,
  isControllerPaired?: boolean | null,
): boolean {
  return Boolean(isSocketConnected && isControllerPaired);
}

