/**
 * Bölüm tamamlama süresine göre kazanılan yıldız sayısını (1, 2 veya 3) hesaplar.
 */
export function calculateEarnedStars(
  elapsedSeconds: number,
  starThresholds?: [number, number],
): 1 | 2 | 3 {
  const [threeStarLimit, twoStarLimit] = starThresholds ?? [15, 24];
  const safeTime = Math.max(
    0.1,
    Number.isFinite(elapsedSeconds) ? elapsedSeconds : 999,
  );

  if (safeTime <= threeStarLimit) {
    return 3;
  }
  if (safeTime <= twoStarLimit) {
    return 2;
  }
  return 1;
}

/**
 * Oyuncunun elde ettiği dereceye göre motive edici hedef durum metni üretir.
 */
export function formatStarGoalMessage(
  elapsedSeconds: number,
  starThresholds?: [number, number],
): string {
  const [threeStarLimit, twoStarLimit] = starThresholds ?? [15, 24];
  const safeTime = Math.max(
    0.1,
    Number.isFinite(elapsedSeconds) ? elapsedSeconds : 999,
  );
  const stars = calculateEarnedStars(safeTime, starThresholds);

  if (stars === 3) {
    return `Mükemmel! 3 yıldız hedefini (${threeStarLimit.toFixed(1)} sn) aştın.`;
  }
  if (stars === 2) {
    const diff = (safeTime - threeStarLimit).toFixed(1);
    return `3 yıldız hedefine yalnızca ${diff} sn kaldı (Hedef: ≤ ${threeStarLimit.toFixed(1)} sn).`;
  }
  const diff = (safeTime - twoStarLimit).toFixed(1);
  return `2 yıldız hedefine ${diff} sn kaldı (Hedef: ≤ ${twoStarLimit.toFixed(1)} sn).`;
}

/**
 * Tamamlanan sürenin oyuncunun bu bölümdeki kişisel rekoru (Personal Best) olup olmadığını kontrol eder.
 */
export function isPersonalBest(
  elapsedSeconds: number,
  currentBestTime?: number,
): boolean {
  if (!Number.isFinite(elapsedSeconds) || elapsedSeconds <= 0) {
    return false;
  }
  if (
    !currentBestTime ||
    !Number.isFinite(currentBestTime) ||
    currentBestTime <= 0
  ) {
    return true; // İlk kez tamamlandı
  }
  return elapsedSeconds < currentBestTime;
}

