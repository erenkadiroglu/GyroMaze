/**
 * 3B Labirent Sahnesi Olay ve Ses/Haptik Kuralları Motoru
 */

/**
 * Duvar çarpma hızına göre ses seviyesi ve haptik tetikleme gereksinimini hesaplar.
 */
export function calculateWallHitIntensity(speed: number): {
  volume: number;
  triggerHaptic: boolean;
} {
  const safeSpeed = Math.max(0, speed);
  const volume = Math.min(1, safeSpeed / 8);
  const triggerHaptic = safeSpeed > 2.4;
  return { volume, triggerHaptic };
}

/**
 * Duvar sesinin ardışık patlamasını önlemek için zaman eşiğini kontrol eder (varsayılan 95ms).
 */
export function shouldThrottleWallHit(
  now: number,
  lastWallHitTime: number,
  throttleMs = 95,
): boolean {
  return now - lastWallHitTime < throttleMs;
}

/**
 * Bilye hızının duvar çarpma sesi çıkarmaya yetecek eşikte (varsayılan 1.3 br/sn) olup olmadığını denetler.
 */
export function isBallSpeedSufficientForWallHit(
  speed: number,
  minSpeed = 1.3,
): boolean {
  return speed > minSpeed;
}

/**
 * Kilitli portal uyarı mesajının sık tekrarlanmasını önleyen zaman aşımı kontrolü (varsayılan 1300ms).
 */
export function shouldWarnLockedPortal(
  now: number,
  lastWarnTime: number,
  cooldownMs = 1300,
): boolean {
  return now - lastWarnTime > cooldownMs;
}

/**
 * Kalan toplanması gereken kristal sayısını hesaplar (en az 1).
 */
export function getRemainingCrystalsCount(
  totalCrystals: number,
  collectedCount: number,
): number {
  return Math.max(1, totalCrystals - collectedCount);
}

/**
 * Kilitli portal uyarı metnini formatlar.
 */
export function formatLockedPortalMessage(remaining: number): string {
  return `🔒 Portal Kilitli! Önce kalan ${remaining} enerji kristalini toplayın.`;
}

/**
 * Tüm kristaller toplandığında gösterilecek başarı metnini formatlar.
 */
export function formatAllCrystalsCollectedMessage(): string {
  return '🔓 Tüm enerji kristalleri toplandı! Hedef Portalı açıldı!';
}

/**
 * Hedefe ulaşma olayının tetiklenip tetiklenemeyeceğini (aktif oyun, sekme görünürlüğü, açık modal olmaması) doğrular.
 */
export function canTriggerGoal(
  gameStatus: string,
  isPageHidden: boolean,
  isAnyModalOpen: boolean,
): boolean {
  return gameStatus === 'playing' && !isPageHidden && !isAnyModalOpen;
}

/**
 * Boşluğa düşme veya lazere çarpma tehlikesinde tek/çok oyunculu mod ayrımına göre aksiyon belirler.
 */
export function resolveHazardFallAction(
  isMultiplayer: boolean,
  slot: 1 | 2,
  hazardType: 'hole' | 'laser',
): {
  shouldResetBall: boolean;
  notificationMessage?: string;
  notificationType: 'warn';
} {
  if (!isMultiplayer) {
    return {
      shouldResetBall: true,
      notificationType: 'warn',
    };
  }

  const actionText = hazardType === 'hole' ? 'boşluğa düştü' : 'lazere çarptı';
  return {
    shouldResetBall: false,
    notificationMessage: `Oyuncu ${slot} ${actionText}`,
    notificationType: 'warn',
  };
}
