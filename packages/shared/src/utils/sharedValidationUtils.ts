/**
 * İstemci ve sunucu arasında paylaşılan ortak doğrulama ve veri temizleme yardımcıları.
 */

/**
 * Oda kodunun 6 haneli, alfanümerik ve geçerli formatta olup olmadığını denetler.
 */
export function isValidRoomCode(code?: unknown): boolean {
  if (typeof code !== 'string') return false;
  const trimmed = code.trim();
  return /^[A-HJ-NP-Z2-9]{6}$/i.test(trimmed);
}

/**
 * Oyuncu adını güvenlik ve görünüm için temizler.
 * Boş ise 'Misafir' döner, maksimum 16 karakterle sınırlar.
 */
export function sanitizePlayerName(name?: unknown): string {
  if (typeof name !== 'string') return 'Misafir';
  const trimmed = name.trim();
  if (trimmed.length === 0) return 'Misafir';
  return trimmed.slice(0, 16);
}

/**
 * Oyuncu yuvasının 1 veya 2 olup olmadığını doğrular.
 */
export function isValidPlayerSlot(slot?: unknown): slot is 1 | 2 {
  return slot === 1 || slot === 2;
}

/**
 * Bölüm numarasının pozitif geçerli bir tamsayı olup olmadığını denetler.
 */
export function isValidLevelNumber(level?: unknown): boolean {
  return typeof level === 'number' && Number.isFinite(level) && level > 0 && Math.floor(level) === level;
}

/**
 * Eğim ve yatış açılarını güvenli sınırlar içinde sınırlar (varsayılan: -45° ile +45°).
 * NaN veya Infinity durumunda 0 döner.
 */
export function clampAngle(angle: number, min = -45, max = 45): number {
  if (!Number.isFinite(angle)) return 0;
  return Math.max(min, Math.min(max, angle));
}
