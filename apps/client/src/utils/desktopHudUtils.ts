export interface OverlayFlags {
  isPairingModalOpen: boolean;
  isSettingsOpen: boolean;
  isEditorOpen: boolean;
  isLeaderboardOpen: boolean;
  isHelpOpen: boolean;
}

/**
 * Toplanan kristal indekslerine göre sahnede henüz toplanmamış kristalleri filtreler.
 */
export function calculateRemainingCrystals<T>(
  allCrystals: T[],
  collectedIndices: number[],
): T[] {
  return allCrystals.filter((_, idx) => !collectedIndices.includes(idx));
}

/**
 * Toplanan kristal sayısının toplam kristal sayısına ulaşıp ulaşmadığını doğrular.
 */
export function resolveIsPortalUnlocked(
  totalCrystals: number,
  collectedCount: number,
): boolean {
  return totalCrystals === 0 || collectedCount >= totalCrystals;
}

/**
 * Herhangi bir modal veya çekmecenin açık olup olmadığını tespit eder.
 */
export function resolveAnyOverlayOpen(flags: OverlayFlags): boolean {
  return (
    flags.isPairingModalOpen ||
    flags.isSettingsOpen ||
    flags.isEditorOpen ||
    flags.isLeaderboardOpen ||
    flags.isHelpOpen
  );
}

/**
 * Skor tablosu ilk açıldığında gösterilecek bölüm numarasını belirler (Özel harita 99 ise 1'e yönlendirir).
 */
export function resolveLeaderboardInitialLevel(levelId: number): number {
  return levelId === 99 ? 1 : Math.max(1, Math.floor(levelId));
}

/**
 * Masaüstü HUD kapsayıcısı için temel Tailwind stil sınıflarını döner.
 */
export function getDesktopHudContainerClass(): string {
  return 'pointer-events-none fixed inset-0 z-10 flex flex-col justify-between p-4 sm:p-5';
}

/**
 * Masaüstü HUD arayüzü için erişilebilir semantik bölge niteliklerini döner.
 */
export function getDesktopHudAriaProps(): { role: 'region'; 'aria-label': string } {
  return {
    role: 'region',
    'aria-label': 'Oyun arayüzü ve kontrolleri',
  };
}

/**
 * Bölüm kimliğinin özel editör haritası (99) olup olmadığını belirler.
 */
export function isCustomLevel(levelId: number): boolean {
  return levelId === 99;
}

/**
 * Bölüm numarası ve başlığına göre ekran etiketini formatlar.
 */
export function formatHudLevelBadge(levelId: number, levelName: string): string {
  if (isCustomLevel(levelId)) {
    return 'Özel Harita';
  }
  const safeName = levelName ? ` — ${levelName}` : '';
  return `${levelId}. Bölüm${safeName}`;
}
