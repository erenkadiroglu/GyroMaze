import type { GameMode } from '@gyromaze/shared';
import type { MazeLevelDefinition } from '../components/scene/levels/types.ts';
import { getMazeLevel } from '../components/scene/levels/levelUtils.ts';
import {
  calculateTimeAttackLimit,
  calculateTimeRemaining,
  resolveTimerColorClass,
  resolveConnectionStatus,
  formatPortalStatus,
  resolveMultiplayerTooltip,
  resolvePairingButtonBadge,
  formatVisibleTimerText,
} from './hudUtils.ts';
import {
  calculateCampaignProgress,
  getLevelProgress,
  formatShortLevelTag,
  cleanLevelTitle,
  calculateNextProceduralLevel,
  STANDARD_LEVEL_THRESHOLDS,
  type LevelProgressItem,
  type CampaignProgressSummary,
} from './levelProgressUtils.ts';

export interface DesktopHeaderTelemetryOptions {
  level: number;
  customLevel: MazeLevelDefinition | null;
  collectedCrystalsCount: number;
  gameMode: GameMode;
  elapsedSeconds: number;
  bestTimes: Record<number, number>;
  isSocketConnected: boolean;
  isControllerPaired: boolean;
  isSecondControllerPaired: boolean;
  latencyMs: number;
}

export interface DesktopHeaderTelemetryResult {
  currentLevelInfo: MazeLevelDefinition;
  currentBestTime: number | undefined;
  totalCrystals: number;
  isPortalUnlocked: boolean;
  portalTooltip: string;
  ratioText: string;
  isTimeAttack: boolean;
  timeRemaining: number;
  visibleTimerText: string;
  timerColorClass: string;
  isAnyPaired: boolean;
  dotColor: string;
  multiplayerTooltip: string;
  pairingBadge: { text: string; isLatency: boolean };
}

/**
 * Masaüstü HUD üst çubuğunun ihtiyaç duyduğu telemetri, portal, süre ve bağlantı
 * verilerini tek bir saf fonksiyonda hesaplar.
 */
export function resolveDesktopHeaderTelemetry(
  options: DesktopHeaderTelemetryOptions,
): DesktopHeaderTelemetryResult {
  const {
    level,
    customLevel,
    collectedCrystalsCount,
    gameMode,
    elapsedSeconds,
    bestTimes,
    isSocketConnected,
    isControllerPaired,
    isSecondControllerPaired,
    latencyMs,
  } = options;

  const currentLevelInfo = getMazeLevel(level, customLevel);
  const currentBestTime = bestTimes[currentLevelInfo.id];
  const totalCrystals = currentLevelInfo.crystals.length;

  const { isUnlocked: isPortalUnlocked, tooltip: portalTooltip, ratioText } =
    formatPortalStatus(totalCrystals, collectedCrystalsCount);

  const isTimeAttack = gameMode === 'time_attack';
  const timeAttackLimit = calculateTimeAttackLimit(
    currentLevelInfo.starThresholds,
  );
  const timeRemaining = calculateTimeRemaining(timeAttackLimit, elapsedSeconds);

  const { isAnyPaired, dotColor } = resolveConnectionStatus(
    isSocketConnected,
    isControllerPaired,
    isSecondControllerPaired,
  );

  const visibleTimerValue = isTimeAttack ? timeRemaining : elapsedSeconds;
  const timerColorClass = resolveTimerColorClass(isTimeAttack, timeRemaining);
  const visibleTimerText = formatVisibleTimerText(visibleTimerValue);
  const multiplayerTooltip = resolveMultiplayerTooltip(isSecondControllerPaired);
  const pairingBadge = resolvePairingButtonBadge(isAnyPaired, latencyMs);

  return {
    currentLevelInfo,
    currentBestTime,
    totalCrystals,
    isPortalUnlocked,
    portalTooltip,
    ratioText,
    isTimeAttack,
    timeRemaining,
    visibleTimerText,
    timerColorClass,
    isAnyPaired,
    dotColor,
    multiplayerTooltip,
    pairingBadge,
  };
}

export interface LevelSelectStateResult {
  currentLevelInfo: MazeLevelDefinition;
  activeNumericLevel: number;
  shortLevelTag: string;
  cleanTitle: string;
  currentProgress: LevelProgressItem;
  campaignProgress: CampaignProgressSummary;
  nextProceduralLevel: number;
  proceduralNotificationText: string;
}

/**
 * Bölüm seçici popover ve kampanya ilerleme panelinin verilerini hesaplar.
 */
export function resolveLevelSelectState(options: {
  level: number;
  customLevel: MazeLevelDefinition | null;
  bestTimes: Record<number, number>;
}): LevelSelectStateResult {
  const { level, customLevel, bestTimes } = options;

  const currentLevelInfo = getMazeLevel(level, customLevel);
  const activeNumericLevel = level === 99 ? 1 : Math.max(1, level);

  const shortLevelTag = formatShortLevelTag(level, currentLevelInfo.id);
  const cleanTitle = cleanLevelTitle(currentLevelInfo.title);

  const currentProgress = getLevelProgress(
    currentLevelInfo.id,
    bestTimes,
    currentLevelInfo.starThresholds,
  );

  const campaignProgress = calculateCampaignProgress(
    bestTimes,
    STANDARD_LEVEL_THRESHOLDS,
    5,
  );

  const nextProceduralLevel = calculateNextProceduralLevel(level);
  const proceduralNotificationText = formatProceduralNotification(nextProceduralLevel);

  return {
    currentLevelInfo,
    activeNumericLevel,
    shortLevelTag,
    cleanTitle,
    currentProgress,
    campaignProgress,
    nextProceduralLevel,
    proceduralNotificationText,
  };
}

/**
 * Prosedürel bölüm bildirim metnini iki haneli standart formatta üretir.
 */
export function formatProceduralNotification(levelNumber: number): string {
  const padded = levelNumber < 10 ? `0${levelNumber}` : String(levelNumber);
  return `Prosedürel Bölüm ${padded} oluşturuldu`;
}

/**
 * Klavyeden Esc tuşuna basılıp basılmadığını denetler.
 */
export function shouldClosePopoverOnKeyDown(key: string): boolean {
  return key === 'Escape';
}

/**
 * Fare tıklamasının popover dışına yapılıp yapılmadığını denetler.
 */
export function shouldClosePopoverOnMouseDown(
  popoverElement: { contains: (node: Node | null) => boolean } | null,
  targetNode: EventTarget | null,
): boolean {
  if (!popoverElement) return false;
  return !popoverElement.contains(targetNode as Node | null);
}
