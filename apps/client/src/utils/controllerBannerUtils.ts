/**
 * Bölüm ve kristal gezinme şeridinin gösterilip gösterilmeyeceğini belirler.
 */
export function shouldShowLevelNavBanner(
  isControllerPaired: boolean,
  isRoomEditorOpen: boolean,
): boolean {
  return isControllerPaired && !isRoomEditorOpen;
}

/**
 * Zafer durumunda "Sonraki bölüme geç" şeridinin gösterilip gösterilmeyeceğini belirler.
 */
export function shouldShowVictoryBanner(
  isControllerPaired: boolean,
  gameStatus: string,
  isRoomEditorOpen: boolean,
): boolean {
  return isControllerPaired && gameStatus === 'won' && !isRoomEditorOpen;
}

/**
 * Süre dolduğunda (lost) "Tekrar dene" şeridinin gösterilip gösterilmeyeceğini belirler.
 */
export function shouldShowDefeatBanner(
  isControllerPaired: boolean,
  gameStatus: string,
  isRoomEditorOpen: boolean,
): boolean {
  return isControllerPaired && gameStatus === 'lost' && !isRoomEditorOpen;
}

/**
 * 1. bölümde veya özel haritada "Önceki" butonunun devre dışı olup olmadığını belirler.
 */
export function isPrevLevelDisabled(level: number): boolean {
  return level <= 1;
}
