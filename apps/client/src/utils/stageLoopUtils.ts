/**
 * 3B Sahne animasyon ve kare döngüsü (frame loop) saf yardımcıları.
 */

/**
 * Sahnenin etkileşime açık (fizik ve engellerin aktif) olup olmadığını belirler.
 */
export function resolveIsInteractive(
  gameStatus: string,
  isPageHidden: boolean,
  isAnyModalOpen: boolean,
): boolean {
  return gameStatus === 'playing' && !isPageHidden && !isAnyModalOpen;
}

/**
 * Tehlike saatini duraklatma duyarlı olarak kare başına ilerletir.
 */
export function stepHazardElapsed(
  currentElapsed: number,
  delta: number,
  isInteractive: boolean,
): number {
  const safeDelta = Number.isFinite(delta) && delta > 0 ? Math.min(delta, 0.05) : 0;
  return isInteractive ? currentElapsed + safeDelta : currentElapsed;
}

/**
 * 2. Oyuncu bilye görselinin görünürlük durumunu belirler.
 */
export function resolveP2BallVisibility(
  isMultiplayer: boolean,
  hasBody: boolean,
): boolean {
  return Boolean(isMultiplayer && hasBody);
}

