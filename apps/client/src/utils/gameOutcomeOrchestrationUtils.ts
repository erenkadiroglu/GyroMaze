import type { MazeLevelDefinition } from '../components/scene/levels/types.ts';
import { getMazeLevel } from '../components/scene/levels/levelUtils.ts';
import {
  calculateEarnedStars,
  formatStarGoalMessage,
  isPersonalBest,
  calculateTimeAttackLimit,
  cleanPlayerName,
  resolveMultiplayerWinnerText,
  formatDefeatCrystalSummary,
} from './gameOutcomeUtils.ts';
import { isCelebrationWorthy } from './celebrationParticles.ts';

export const PLAYER_NAME_STORAGE_KEY = 'gyromaze_player_name_v1';
export const DEFAULT_STAR_THRESHOLDS: [number, number] = [15, 24];

/**
 * Tarayıcı yerel depolamasından (localStorage) kayıtlı oyuncu adını güvenle okur.
 */
export function loadStoredPlayerName(storage?: {
  getItem: (key: string) => string | null;
} | null): string {
  if (!storage) return 'Oyuncu';
  try {
    const raw = storage.getItem(PLAYER_NAME_STORAGE_KEY);
    return cleanPlayerName(raw);
  } catch {
    return 'Oyuncu';
  }
}

/**
 * Oyuncu adını yerel depolamaya güvenle yazar.
 */
export function saveStoredPlayerName(
  storage: { setItem: (key: string, value: string) => void } | null | undefined,
  name: string,
): void {
  if (!storage) return;
  try {
    storage.setItem(PLAYER_NAME_STORAGE_KEY, cleanPlayerName(name));
  } catch {
    // Depolama erişim kısıtlamalarını sessizce yoksay
  }
}

/**
 * Liderlik tablosuna gönderilecek skor veri yükünü hazırlar ve doğrular.
 */
export function prepareLeaderboardScorePayload(
  rawName: string,
  levelId: number,
  elapsedSeconds: number,
): { playerName: string; levelId: number; timeSeconds: number } {
  const playerName = cleanPlayerName(rawName);
  const safeTime = Number(
    Math.max(0.1, Number.isFinite(elapsedSeconds) ? elapsedSeconds : 0.1).toFixed(1),
  );
  return {
    playerName,
    levelId,
    timeSeconds: safeTime,
  };
}

export interface GameOutcomeResolvedMetrics {
  currentLevelInfo: MazeLevelDefinition;
  timeAttackLimit: number;
  totalCrystals: number;
  isPB: boolean;
  earnedStars: 1 | 2 | 3;
  goalMessage: string;
  isCelebration: boolean;
  winnerText: string;
  crystalSummary: string;
}

/**
 * Oyun sonucu ekranının (zafer veya yenilgi modalları) ihtiyaç duyduğu tüm
 * istatistik, yıldız, rekor ve kutlama metriklerini saf fonksiyon olarak hesaplar.
 */
export function resolveGameOutcomeMetrics(options: {
  level: number;
  customLevel: MazeLevelDefinition | null;
  elapsedSeconds: number;
  bestTimes: Record<number, number>;
  collectedCrystalsCount: number;
  gameStatus: string;
  winnerPlayer?: 1 | 2 | null;
}): GameOutcomeResolvedMetrics {
  const {
    level,
    customLevel,
    elapsedSeconds,
    bestTimes,
    collectedCrystalsCount,
    gameStatus,
    winnerPlayer,
  } = options;

  const currentLevelInfo = getMazeLevel(level, customLevel);
  const [, twoStarLimit] = currentLevelInfo.starThresholds ?? DEFAULT_STAR_THRESHOLDS;
  const timeAttackLimit = calculateTimeAttackLimit(twoStarLimit);
  const totalCrystals = currentLevelInfo.crystals.length;

  const currentBest = bestTimes[currentLevelInfo.id];
  const isPB = isPersonalBest(elapsedSeconds, currentBest);
  const earnedStars = calculateEarnedStars(
    elapsedSeconds,
    currentLevelInfo.starThresholds,
  );
  const goalMessage = formatStarGoalMessage(
    elapsedSeconds,
    currentLevelInfo.starThresholds,
  );

  const isCelebration =
    gameStatus === 'won' && isCelebrationWorthy(earnedStars, isPB);

  const winnerText = resolveMultiplayerWinnerText(winnerPlayer);
  const crystalSummary = formatDefeatCrystalSummary(
    collectedCrystalsCount,
    totalCrystals,
  );

  return {
    currentLevelInfo,
    timeAttackLimit,
    totalCrystals,
    isPB,
    earnedStars,
    goalMessage,
    isCelebration,
    winnerText,
    crystalSummary,
  };
}
