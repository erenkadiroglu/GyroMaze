/**
 * Bölüm Seçici Popover (LevelSelectPopover) görünüm, erişilebilirlik ve durum yardımcı fonksiyonları.
 */

/**
 * Bölüm seçici popover konteyneri için erişilebilir etiket metnini döner.
 */
export function getLevelSelectContainerAriaLabel(): string {
  return 'Bölüm Seçici ve İlerleme Menüsü';
}

/**
 * Açılır menünün açık olup olmadığını boolean olarak doğrular.
 */
export function isLevelSelectOpen(isOpen?: boolean | null): boolean {
  return Boolean(isOpen);
}

/**
 * Önceki bölüme geçiş düğmesinin devre dışı bırakılma durumunu hesaplar.
 * Seviye 1 veya daha küçükse ve özel harita (99) değilse devre dışıdır.
 */
export function isPrevLevelDisabled(
  activeNumericLevel: number,
  level: number,
): boolean {
  return activeNumericLevel <= 1 && level !== 99;
}

/**
 * Tetikleyici düğme için erişilebilir tooltip ve açıklama metnini formatlar.
 */
export function formatLevelSelectTriggerTooltip(
  cleanTitle: string,
  stars: number,
): string {
  const safeTitle = (cleanTitle ?? '').trim() || 'Bölüm';
  const safeStars = Number.isFinite(stars) && stars > 0 ? Math.floor(stars) : 0;
  return safeStars > 0 ? `${safeTitle} — ${safeStars} Yıldız` : safeTitle;
}

/**
 * Bölüm seçici menü kapsayıcısı için aria-expanded niteliğini döner.
 */
export function resolveLevelPopoverAriaExpanded(isOpen: boolean): boolean {
  return Boolean(isOpen);
}

