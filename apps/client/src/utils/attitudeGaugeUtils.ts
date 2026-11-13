/**
 * Havacılık yapay ufuk göstergesi ve kokpit telemetri paneli yardımcı fonksiyonları.
 */

/**
 * Labirent tahtası boyutunu güvenli bir pozitif sayıya sınırlar (varsayılan 12).
 */
export function resolveAttitudeBoardSize(boardSize?: number): number {
  if (typeof boardSize === 'number' && Number.isFinite(boardSize) && boardSize > 0) {
    return Math.floor(boardSize);
  }
  return 12;
}

/**
 * Uçuş gösterge paneli için erişilebilir ana konteyner etiketini döner.
 */
export function getAttitudeContainerAriaLabel(): string {
  return 'Canlı uçuş ve hız göstergesi';
}

/**
 * Yapay ufuk kadranı için tooltip / title açıklama metnini döner.
 */
export function getAttitudeHorizonDialTitle(): string {
  return 'Yapay Ufuk — Tabla eğim açısı';
}

/**
 * 2B Labirent radarı için tooltip / title açıklama metnini döner.
 */
export function getMiniMapRadarTitle(): string {
  return 'Canlı 2B Labirent Radarı';
}

/**
 * Çok oyunculu modun aktif olup olmadığını boolean olarak doğrular.
 */
export function isAttitudeMultiplayerActive(isMultiplayer?: boolean | null): boolean {
  return Boolean(isMultiplayer);
}

/**
 * Eğim ve hız değerlerini okunabilir tek satırlık kokpit telemetri özetine dönüştürür.
 */
export function formatAttitudeGaugeSummary(
  pitchDeg: number,
  rollDeg: number,
  speedVal: number,
): string {
  const safePitch = Number.isFinite(pitchDeg) ? pitchDeg.toFixed(1) : '0.0';
  const safeRoll = Number.isFinite(rollDeg) ? rollDeg.toFixed(1) : '0.0';
  const safeSpeed = Number.isFinite(speedVal) && speedVal >= 0 ? speedVal.toFixed(1) : '0.0';

  return `Eğim: ${safePitch}° / ${safeRoll}°, Hız: ${safeSpeed} m/s`;
}

