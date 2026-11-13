/**
 * Portal kilit durumuna göre ekran okuyucu etiketini belirler.
 */
export function resolvePortalLockAriaLabel(isUnlocked: boolean): string {
  return isUnlocked ? 'Portal açık' : 'Portal kilitli';
}

/**
 * Bölüm rekoru metnini tek ondalıklı formatlar.
 */
export function formatRecordBadgeText(bestTime: number): string {
  return Number.isFinite(bestTime) ? bestTime.toFixed(1) : '0.0';
}

/**
 * Çok oyunculu rozet metni ve ekran okuyucu etiketini döner.
 */
export function resolveMultiplayerBadgeAriaLabel(isMultiplayer: boolean): string {
  return isMultiplayer ? 'Çok oyunculu mod: 2 Oyuncu aktif' : 'Tek oyunculu mod';
}

/**
 * Süre göstergesi kapsülü için erişilebilir başlık metni üretir.
 */
export function resolveTimerStatusTitle(isTimeAttack: boolean, bestTime?: number): string {
  if (isTimeAttack) return 'Kalan süre';
  if (bestTime !== undefined && Number.isFinite(bestTime)) {
    return `Bölüm rekoru: ${bestTime.toFixed(1)} sn`;
  }
  return 'Geçen süre';
}
