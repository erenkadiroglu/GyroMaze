export interface DefeatActionsConfig {
  switchModeLabel: string;
  retryLabel: string;
}

/**
 * Süre doldu (yenilgi) modalı için standart başlık metnini döner.
 */
export function getDefeatModalTitle(): string {
  return 'Süre doldu';
}

/**
 * Süre doldu modalı için dinamik süre sınırı açıklamasını formatlar.
 */
export function formatDefeatModalDescription(timeAttackLimit: number): string {
  const safeLimit = Math.max(1, Math.round(Number.isFinite(timeAttackLimit) ? timeAttackLimit : 24));
  return `${safeLimit} saniyelik süre içinde portala ulaşılamadı.`;
}

/**
 * Toplanan kristal özetiyle birlikte yönlendirici ipucu metnini formatlar.
 */
export function formatDefeatCrystalMessage(crystalSummary: string): string {
  const safeSummary = crystalSummary || '0/0';
  return `Toplanan kristal: ${safeSummary}. Daha hızlı bir başlangıç için bilyeyi sıfırlayıp yeniden dene.`;
}

/**
 * Süre doldu modalının aksiyon butonları etiketlerini döner.
 */
export function getDefeatActionsConfig(): DefeatActionsConfig {
  return {
    switchModeLabel: 'Modu değiştir',
    retryLabel: 'Tekrar dene',
  };
}

