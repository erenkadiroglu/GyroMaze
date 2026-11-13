export interface PauseRecoveryActionsConfig {
  pairLabel: string;
  resumeLabel: string;
}

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
 * Kontrolcü bağlantısı koptuğunda gösterilen varsayılan durum mesajını döner.
 */
export function getPauseRecoveryMessage(): string {
  return 'Kontrolcü bağlantısı koptu — oyun duraklatıldı';
}

/**
 * Kurtarma çubuğu butonlarının metin yapılandırmasını döner.
 */
export function getPauseRecoveryActionsConfig(): PauseRecoveryActionsConfig {
  return {
    pairLabel: 'Bağla',
    resumeLabel: 'Devam et',
  };
}

/**
 * Bildirim tonuna göre ARIA canlı bölge önceliğini belirler.
 */
export function resolveToastAriaLive(tone?: string): 'assertive' | 'polite' {
  return tone === 'warn' ? 'assertive' : 'polite';
}

/**
 * Bildirim verisinin geçerli ve ekranda gösterilebilir olup olmadığını doğrular.
 */
export function isNotificationPresent(notification: unknown): boolean {
  return Boolean(
    notification &&
      typeof notification === 'object' &&
      'id' in notification &&
      'message' in notification,
  );
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
