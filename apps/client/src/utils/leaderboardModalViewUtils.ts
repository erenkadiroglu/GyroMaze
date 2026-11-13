/**
 * Skor tablosu modalı için standart başlık metnini döner.
 */
export function getLeaderboardModalTitle(): string {
  return 'Skor tablosu';
}

/**
 * Skor tablosu modalı için açıklama metnini döner.
 */
export function getLeaderboardModalDescription(): string {
  return 'Bölümlerde kaydedilen en hızlı tamamlama süreleri';
}

/**
 * Skor tablosu arama kutusu için yer tutucu metnini döner.
 */
export function formatLeaderboardSearchPlaceholder(): string {
  return 'Oyuncu adına göre filtrele...';
}

/**
 * Hata bildirim çubuğunun gösterilip gösterilmeyeceğini belirler.
 */
export function isErrorBannerVisible(error: string | null | undefined): boolean {
  return Boolean(error && error.trim().length > 0);
}

/**
 * Ekran okuyucular için seçili sekme ve kayıt adedini özetleyen erişilebilir metin formatlar.
 */
export function formatLeaderboardAriaLabel(
  selectedLevel: string | number,
  entryCount: number,
): string {
  const safeCount = Math.max(0, Number.isFinite(entryCount) ? entryCount : 0);
  if (selectedLevel === 'global') {
    return `Küresel skor tablosu, ${safeCount} kayıt listeleniyor`;
  }
  return `Seviye ${selectedLevel} skor tablosu, ${safeCount} kayıt listeleniyor`;
}

