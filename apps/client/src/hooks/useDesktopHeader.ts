'use client';

import { useCallback } from 'react';
import { useGameStore } from '@/store/useGameStore';
import { getMazeLevel } from '@/components/scene/mazeLevels';
import {
  calculateTimeAttackLimit,
  calculateTimeRemaining,
  resolveTimerColorClass,
  resolveConnectionStatus,
  formatPortalStatus,
  resolveMultiplayerTooltip,
  resolvePairingButtonBadge,
  formatVisibleTimerText,
} from '@/utils/hudUtils';

/**
 * Masaüstü HUD üst çubuğu (DesktopHeader) için durum çözümleme,
 * portal/kristal telemetrisi, sayaç biçimlendirme ve modal tetikleyici kancası.
 */
export function useDesktopHeader() {
  const isSocketConnected = useGameStore((s) => s.isSocketConnected);
  const isControllerPaired = useGameStore((s) => s.isControllerPaired);
  const isSecondControllerPaired = useGameStore(
    (s) => s.isSecondControllerPaired,
  );
  const level = useGameStore((s) => s.level);
  const customLevel = useGameStore((s) => s.customLevel);
  const collectedCrystals = useGameStore((s) => s.collectedCrystals);
  const gameMode = useGameStore((s) => s.gameMode);
  const elapsedSeconds = useGameStore((s) => s.elapsedSeconds);
  const bestTimes = useGameStore((s) => s.bestTimes);
  const isMultiplayer = useGameStore((s) => s.isMultiplayer);
  const roomId = useGameStore((s) => s.roomId);
  const latencyMs = useGameStore((s) => s.latencyMs);
  const setPairingModalOpen = useGameStore((s) => s.setPairingModalOpen);
  const setSettingsOpen = useGameStore((s) => s.setSettingsOpen);
  const isHelpOpen = useGameStore((s) => s.isHelpOpen);
  const setHelpOpen = useGameStore((s) => s.setHelpOpen);

  const currentLevelInfo = getMazeLevel(level, customLevel);
  const currentBestTime = bestTimes[currentLevelInfo.id];
  const totalCrystals = currentLevelInfo.crystals.length;
  const { isUnlocked: isPortalUnlocked, tooltip: portalTooltip, ratioText } =
    formatPortalStatus(totalCrystals, collectedCrystals.length);

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

  const handleOpenPairing = useCallback(() => {
    setPairingModalOpen(true);
  }, [setPairingModalOpen]);

  const handleOpenSettings = useCallback(() => {
    setSettingsOpen(true);
  }, [setSettingsOpen]);

  const handleToggleHelp = useCallback(() => {
    setHelpOpen(!isHelpOpen);
  }, [setHelpOpen, isHelpOpen]);

  return {
    dotColor,
    isPortalUnlocked,
    portalTooltip,
    ratioText,
    isTimeAttack,
    timerColorClass,
    visibleTimerText,
    currentBestTime,
    isMultiplayer,
    multiplayerTooltip,
    isAnyPaired,
    roomId,
    pairingBadge,
    handleOpenPairing,
    handleOpenSettings,
    handleToggleHelp,
  };
}

