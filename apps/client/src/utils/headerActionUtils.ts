/**
 * Bağlı kontrolcü varlığına göre eşleştirme butonu stil varyantını belirler.
 */
export function resolvePairingButtonVariant(isAnyPaired: boolean): 'primary' | 'secondary' {
  return isAnyPaired ? 'secondary' : 'primary';
}

/**
 * Oda kodu metnini güvenle formatlar (yoksa yer tutucu '......' döner).
 */
export function formatPairingButtonRoomCode(roomId?: string | null): string {
  return roomId && roomId.trim() ? roomId.trim() : '......';
}

/**
 * Eşleştirme rozeti metin rengi stilini belirler (gecikme ise yeşil text-ok).
 */
export function resolvePairingBadgeClass(isLatency: boolean): string {
  return isLatency ? 'gm-num hidden text-xs text-ok sm:inline' : 'hidden sm:inline';
}

/**
 * Eşleştirme butonu için ekran okuyucu etiketini formatlar.
 */
export function formatPairingButtonAriaLabel(
  roomId?: string | null,
  badgeText?: string,
): string {
  const code = formatPairingButtonRoomCode(roomId);
  return badgeText ? `Oda kodu ${code}, durum: ${badgeText}` : `Oda kodu ${code}`;
}
