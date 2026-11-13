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
