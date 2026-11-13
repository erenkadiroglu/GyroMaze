/**
 * Kontrolcü bağlantı durumlarına göre klavye ipucu panelinin gösterilip gösterilmeyeceğini belirler.
 */
export function shouldShowKeyboardHints(
  isControllerPaired: boolean,
  isMultiplayer: boolean,
  isSecondControllerPaired: boolean,
): boolean {
  if (!isMultiplayer) {
    return !isControllerPaired;
  }
  return !isControllerPaired || !isSecondControllerPaired;
}

/**
 * Çok oyunculu modda 1. ve 2. oyuncu için hangi ipuçlarının ve ara ayırıcının gösterileceğini çözer.
 */
export function resolveMultiplayerSlotHints(
  isP1Paired: boolean,
  isP2Paired: boolean,
): {
  showP1: boolean;
  showP2: boolean;
  showSeparator: boolean;
} {
  const showP1 = !isP1Paired;
  const showP2 = !isP2Paired;
  const showSeparator = showP1 && showP2;

  return { showP1, showP2, showSeparator };
}
