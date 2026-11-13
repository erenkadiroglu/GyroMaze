/**
 * Liderlik tablosu liste kayıtları ve boş durum kartı yardımcı fonksiyonları.
 */

/**
 * Skor süresinin birincilik (altın/pirinç) veya diğer dereceler (yeşil/ok) metin rengi sınıfını döner.
 */
export function resolveScoreTimeColorClass(isFirst: boolean): string {
  return isFirst ? 'text-brass' : 'text-ok';
}

/**
 * 'all' (tüm bölümler) seçiliyse her satırda seviye etiketinin gösterilip gösterilmeyeceğini belirler.
 */
export function shouldShowLevelBadge(selectedLevel: number | 'all'): boolean {
  return selectedLevel === 'all';
}

/**
 * Kayıt tarihinin geçerli ve pozitif bir zaman damgası olup olmadığını doğrular.
 */
export function shouldShowRecordDate(createdAt: number | null | undefined): boolean {
  return typeof createdAt === 'number' && Number.isFinite(createdAt) && createdAt > 0;
}

/**
 * Sıralama indeksine (0 tabanlı) göre ekran okuyucu için madalya ve derece açıklamasını döner.
 */
export function resolveRankAriaDescription(rankIndex: number): string {
  const rank = Number.isFinite(rankIndex) && rankIndex >= 0 ? Math.floor(rankIndex) + 1 : 1;
  if (rank === 1) return '1. sıra, altın madalya';
  if (rank === 2) return '2. sıra, gümüş madalya';
  if (rank === 3) return '3. sıra, bronz madalya';
  return `${rank}. sıra`;
}

/**
 * Bir skor satırının ekran okuyucular tarafından net okunabilmesi için erişilebilir etiket üretir.
 */
export function formatRowAriaLabel(
  rankIndex: number,
  playerName: string,
  timeText: string,
  levelBadge?: string,
): string {
  const rankDesc = resolveRankAriaDescription(rankIndex);
  const safeName = (playerName ?? '').trim() || 'Anonim';
  const levelPart = levelBadge ? `, ${levelBadge}` : '';
  return `${rankDesc}: ${safeName}, süre ${timeText}${levelPart}`;
}

