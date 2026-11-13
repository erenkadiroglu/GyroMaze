/**
 * Sahne üstü duraklatma / bağlantı kurtarma çubuğunun gösterilip gösterilmeyeceğini belirler.
 */
export function shouldShowPauseRecoveryBar(
  gameStatus: string,
  isAnyOverlayOpen: boolean,
): boolean {
  return gameStatus === 'paused' && !isAnyOverlayOpen;
}

/**
 * Sahne üstü bildirim kartı (Toast) için animasyon parametrelerini döner.
 */
export function getToastMotionVariants() {
  return {
    initial: { opacity: 0, y: -10, scale: 0.97 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: -10, scale: 0.97 },
  };
}
