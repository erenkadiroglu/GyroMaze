import type { MazeLevelDefinition } from '../components/scene/levels/types.ts';
import { getMazeLevel } from '../components/scene/levels/levelUtils.ts';
import {
  type OverlayFlags,
  calculateRemainingCrystals,
  resolveIsPortalUnlocked,
  resolveAnyOverlayOpen,
  resolveLeaderboardInitialLevel,
  isCustomLevel,
  formatHudLevelBadge,
} from './desktopHudUtils.ts';

export interface DesktopHudResolvedState {
  currentLevelInfo: MazeLevelDefinition;
  totalCrystals: number;
  collectedCount: number;
  remainingCrystals: MazeLevelDefinition['crystals'];
  isPortalUnlocked: boolean;
  isAnyOverlayOpen: boolean;
  leaderboardInitialLevel: number;
  isCustomLevel: boolean;
  levelBadgeText: string;
  starThresholds?: MazeLevelDefinition['starThresholds'];
  crystalProgressText: string;
  crystalProgressPercentage: number;
}

/**
 * Kristal toplama ilerleme metnini (örn: "2 / 3" veya "Tümü Toplandı") formatlar.
 */
export function resolveCrystalProgressText(
  collectedCount: number,
  totalCrystals: number,
): string {
  if (totalCrystals <= 0) {
    return 'Gereksinim Yok';
  }
  const safeCollected = Math.min(Math.max(0, collectedCount), totalCrystals);
  if (safeCollected >= totalCrystals) {
    return `${safeCollected} / ${totalCrystals} (Tamamlandı)`;
  }
  return `${safeCollected} / ${totalCrystals}`;
}

/**
 * Kristal toplama ilerlemesini %0 - %100 aralığında yuvarlanmış yüzdeye dönüştürür.
 */
export function resolveCrystalProgressPercentage(
  collectedCount: number,
  totalCrystals: number,
): number {
  if (totalCrystals <= 0) {
    return 100;
  }
  const safeCollected = Math.min(Math.max(0, collectedCount), totalCrystals);
  return Number(((safeCollected / totalCrystals) * 100).toFixed(1));
}

/**
 * Portal durumuna ve kalan kristal sayısına göre HUD durum metnini çözer.
 */
export function resolvePortalStatusMessage(
  isUnlocked: boolean,
  remainingCount: number,
): string {
  if (isUnlocked || remainingCount <= 0) {
    return 'Portal Açık! Hedefe Ulaş';
  }
  return `${remainingCount} kristal daha topla`;
}

/**
 * Masaüstü HUD arayüzünün ihtiyaç duyduğu tüm seviye, kristal, portal ve modal
 * durumlarını tek bir saf fonksiyonda orkestre eder.
 */
export function resolveDesktopHudState(options: {
  level: number;
  customLevel: MazeLevelDefinition | null;
  collectedCrystals: number[];
  overlayFlags: OverlayFlags;
}): DesktopHudResolvedState {
  const { level, customLevel, collectedCrystals, overlayFlags } = options;

  const currentLevelInfo = getMazeLevel(level, customLevel);
  const totalCrystals = currentLevelInfo.crystals.length;
  const collectedCount = collectedCrystals.length;

  const remainingCrystals = calculateRemainingCrystals(
    currentLevelInfo.crystals,
    collectedCrystals,
  );

  const isPortalUnlocked = resolveIsPortalUnlocked(
    totalCrystals,
    collectedCount,
  );

  const isAnyOverlayOpen = resolveAnyOverlayOpen(overlayFlags);
  const leaderboardInitialLevel = resolveLeaderboardInitialLevel(currentLevelInfo.id);
  const isCustom = isCustomLevel(currentLevelInfo.id);
  const levelBadgeText = formatHudLevelBadge(currentLevelInfo.id, currentLevelInfo.title);

  const crystalProgressText = resolveCrystalProgressText(collectedCount, totalCrystals);
  const crystalProgressPercentage = resolveCrystalProgressPercentage(collectedCount, totalCrystals);

  return {
    currentLevelInfo,
    totalCrystals,
    collectedCount,
    remainingCrystals,
    isPortalUnlocked,
    isAnyOverlayOpen,
    leaderboardInitialLevel,
    isCustomLevel: isCustom,
    levelBadgeText,
    starThresholds: currentLevelInfo.starThresholds,
    crystalProgressText,
    crystalProgressPercentage,
  };
}
