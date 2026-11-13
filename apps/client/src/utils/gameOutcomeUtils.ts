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

/**
 * Süreye Karşı modu için 2 yıldız sınırından türetilen dinamik süre sınırını hesaplar.
 */
export function calculateTimeAttackLimit(twoStarLimit: number): number {
  const safeLimit =
    Number.isFinite(twoStarLimit) && twoStarLimit > 0 ? twoStarLimit : 24;
  return Math.max(14, Math.round(safeLimit * 1.15));
}

/**
 * Kullanıcı girdisi olan oyuncu adını güvenle temizler ve 24 karakterle sınırlar.
 */
export function cleanPlayerName(rawName?: string | null): string {
  if (!rawName) return 'Oyuncu';
  const trimmed = rawName.trim().slice(0, 24);
  return trimmed || 'Oyuncu';
}

/**
 * 2P çok oyunculu yarışta kazanan oyuncunun rozet açıklama metnini üretir.
 */
export function resolveMultiplayerWinnerText(
  winnerPlayer?: 1 | 2 | null,
): string {
  if (winnerPlayer === 1) {
    return '1. Oyuncu (Ana bilye) kazandı';
  }
  if (winnerPlayer === 2) {
    return '2. Oyuncu (Altın bilye) kazandı';
  }
  return 'Kazanan belirlenemedi';
}

/**
 * Yıldız performansı için ekran okuyucu aria-label metnini formatlar.
 */
export function formatOutcomeStarAriaLabel(earnedStars: number): string {
  const safeStars = Math.max(1, Math.min(3, Math.round(earnedStars)));
  return `Performans: 3 üzerinden ${safeStars} yıldız`;
}

/**
 * Süre doldu (yenilgi) durumunda toplanan kristal oranını formatlar.
 */
export function formatDefeatCrystalSummary(
  collectedCount: number,
  totalCount: number,
): string {
  const safeCollected = Math.max(
    0,
    Number.isFinite(collectedCount) ? collectedCount : 0,
  );
  const safeTotal = Math.max(0, Number.isFinite(totalCount) ? totalCount : 0);
  return `${safeCollected}/${safeTotal}`;
}


