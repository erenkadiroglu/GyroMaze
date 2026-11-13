/**
 * Standart bölüm kartının aktif seçili olup olmadığını denetler.
 */
export function isStandardLevelActive(
  currentLevelId: number,
  cardLevelId: number,
  globalLevel: number,
): boolean {
  return currentLevelId === cardLevelId && globalLevel !== 99;
}

/**
 * Bölümün en iyi süre metnini saniye cinsinden formatlar.
 */
export function formatLevelBestTimeText(
  completed: boolean,
  bestTime?: number,
): string {
  if (completed && typeof bestTime === 'number' && !Number.isNaN(bestTime)) {
    return `${bestTime.toFixed(0)}s`;
  }
  return '--';
}

/**
 * Bölümde kazanılan yıldızları metinsel glif olarak formatlar.
 */
export function formatLevelStarsText(
  completed: boolean,
  stars: number,
): string {
  if (completed && stars > 0) {
    return '★'.repeat(Math.min(3, Math.max(1, stars)));
  }
  return '···';
}

/**
 * Prosedürel harita modunun aktif olup olmadığını denetler (Seviye 6 ve üzeri, özel harita hariç).
 */
export function isProceduralActive(level: number): boolean {
  return level >= 6 && level !== 99;
}

/**
 * Prosedürel bölüm sağ rozet metnini üretir.
 */
export function formatProceduralBadgeText(
  level: number,
  shortLevelTag: string,
): string {
  if (isProceduralActive(level)) {
    return `${shortLevelTag} +1`;
  }
  return '06+';
}
