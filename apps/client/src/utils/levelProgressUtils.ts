export interface LevelProgressItem {
  levelId: number;
  completed: boolean;
  bestTime?: number;
  stars: number; // 0..3
}

export interface CampaignProgressSummary {
  totalStars: number;
  maxStars: number;
  completedCount: number;
  totalLevels: number;
  percentage: number;
  isMaster: boolean;
}

export const STANDARD_LEVEL_THRESHOLDS: Record<number, [number, number]> = {
  1: [11.0, 17.0],
  2: [15.5, 23.0],
  3: [19.5, 28.0],
  4: [18.0, 26.0],
  5: [22.0, 32.0],
};

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
 * Belirli bir bölümün rekor ve kazanılan yıldız durumunu döndürür.
 */
export function getLevelProgress(
  levelId: number,
  bestTimes: Record<number, number>,
  starThresholds?: [number, number],
): LevelProgressItem {
  const thresholds = starThresholds ?? STANDARD_LEVEL_THRESHOLDS[levelId] ?? [15, 24];
  const bestTime = bestTimes[levelId];
  if (bestTime !== undefined && Number.isFinite(bestTime) && bestTime > 0) {
    const stars = calculateEarnedStars(bestTime, thresholds);
    return {
      levelId,
      completed: true,
      bestTime,
      stars,
    };
  }
  return {
    levelId,
    completed: false,
    bestTime: undefined,
    stars: 0,
  };
}

/**
 * Tüm standart bölümler (1..totalLevels) üzerinden toplam kazanılan yıldız ve tamamlanma yüzdesini hesaplar.
 */
export function calculateCampaignProgress(
  bestTimes: Record<number, number>,
  levelThresholdsMap: Record<number, [number, number]> = STANDARD_LEVEL_THRESHOLDS,
  totalLevels = 5,
): CampaignProgressSummary {
  let totalStars = 0;
  let completedCount = 0;
  const maxStars = totalLevels * 3;

  for (let id = 1; id <= totalLevels; id++) {
    const thresholds = levelThresholdsMap[id] ?? [15, 24];
    const progress = getLevelProgress(id, bestTimes, thresholds);
    if (progress.completed) {
      completedCount += 1;
      totalStars += progress.stars;
    }
  }

  const percentage = maxStars > 0 ? Math.round((totalStars / maxStars) * 100) : 0;
  const isMaster = totalStars >= maxStars && totalLevels > 0;

  return {
    totalStars,
    maxStars,
    completedCount,
    totalLevels,
    percentage,
    isMaster,
  };
}

/**
 * 0..3 yıldız sayısını görsel metin sembollerine ('★★★', '★★☆', vb.) dönüştürür.
 */
export function formatLevelStarBadges(stars: number): string {
  const safeStars = Math.max(0, Math.min(3, Math.round(stars || 0)));
  return '★'.repeat(safeStars) + '☆'.repeat(3 - safeStars);
}
