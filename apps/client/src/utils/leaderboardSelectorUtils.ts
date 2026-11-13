/**
 * Liderlik tablosu seviye ve filtre seçici çubuğu yardımcı ve formatlayıcı fonksiyonları.
 */

/**
 * Bölüm numarasını iki haneli (01, 02.. 10) gösterim formatına dönüştürür.
 */
export function formatLevelTabLabel(level: number): string {
  const safeLevel = Number.isFinite(level) && level > 0 ? Math.floor(level) : 1;
  return safeLevel < 10 ? `0${safeLevel}` : `${safeLevel}`;
}

/**
 * Bölüm sekmesi için ekran okuyucu erişilebilirlik etiketini oluşturur.
 */
export function resolveLevelTabAriaLabel(level: number, isActive: boolean): string {
  const safeLevel = Number.isFinite(level) && level > 0 ? Math.floor(level) : 1;
  return `${safeLevel}. bölüm skorları${isActive ? ', seçili' : ''}`;
}

/**
 * Bölüm veya tümü sekmesinin aktif/pasif Tailwind stil sınıflarını çözümler.
 */
export function resolveTabActiveClasses(isActive: boolean): string {
  return isActive
    ? 'bg-brass text-brass-fg shadow-sm'
    : 'text-muted hover:text-fg';
}

/**
 * Önceki bölüm düğmesine tıklandığında hedef bölüm numarasını hesaplar (minimum 1).
 */
export function resolvePrevLevelTarget(activeLevelNumber: number): number {
  const current = Number.isFinite(activeLevelNumber) && activeLevelNumber > 0
    ? Math.floor(activeLevelNumber)
    : 1;
  return Math.max(1, current - 1);
}

/**
 * Sonraki bölüm düğmesine tıklandığında hedef bölüm numarasını hesaplar.
 */
export function resolveNextLevelTarget(activeLevelNumber: number): number {
  const current = Number.isFinite(activeLevelNumber) && activeLevelNumber > 0
    ? Math.floor(activeLevelNumber)
    : 1;
  return current + 1;
}

/**
 * Yenileme butonunun durumuna göre buton etiketini/başlığını döndürür.
 */
export function getLeaderboardRefreshLabel(isRefreshing: boolean): string {
  return isRefreshing ? 'Yenileniyor...' : 'Skorları yenile';
}

