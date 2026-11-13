/**
 * Klavye ve yardım rehberi modalı için standart başlık metnini döner.
 */
export function getHelpModalTitle(): string {
  return 'Klavye Kısayolları ve Kontrol Rehberi';
}

/**
 * Klavye ve yardım rehberi modalı için açıklama metnini döner.
 */
export function getHelpModalDescription(): string {
  return 'GyroMaze masaüstü kontrolleri, kamera modları ve mobil eşleştirme rehberi.';
}

/**
 * Modal footer kapatma butonunun metnini döner.
 */
export function getHelpModalDismissLabel(): string {
  return 'Anladım';
}

/**
 * Modal footer ipucu metnini döner.
 */
export function getHelpModalFooterTip(): string {
  return 'İpucu: Oyun esnasında H veya ? tuşuna basarak bu pencereyi açabilirsiniz.';
}

/**
 * Kısayol tuşları ve eylem açıklaması için ekran okuyucu dostu metin formatlar.
 */
export function formatShortcutBadgeAria(keys: string[], description: string): string {
  const safeKeys = keys && keys.length > 0 ? keys.join(' veya ') : 'Belirtilmemiş tuş';
  const safeDesc = description || 'Açıklama yok';
  return `${safeKeys} kısayolu: ${safeDesc}`;
}

