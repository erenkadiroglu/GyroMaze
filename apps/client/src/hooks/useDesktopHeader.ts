'use client';

import { useCallback, useMemo } from 'react';
import { useGameStore } from '@/store/useGameStore';
import { resolveDesktopHeaderTelemetry } from '@/utils/desktopHeaderOrchestrationUtils';

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

  const telemetry = useMemo(
    () =>
      resolveDesktopHeaderTelemetry({
        level,
        customLevel,
        collectedCrystalsCount: collectedCrystals.length,
        gameMode,
        elapsedSeconds,
        bestTimes,
        isSocketConnected,
        isControllerPaired,
        isSecondControllerPaired,
        latencyMs,
      }),
    [
      level,
      customLevel,
      collectedCrystals.length,
      gameMode,
      elapsedSeconds,
      bestTimes,
      isSocketConnected,
      isControllerPaired,
      isSecondControllerPaired,
      latencyMs,
    ],
  );

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
    dotColor: telemetry.dotColor,
    isPortalUnlocked: telemetry.isPortalUnlocked,
    portalTooltip: telemetry.portalTooltip,
    ratioText: telemetry.ratioText,
    isTimeAttack: telemetry.isTimeAttack,
    timerColorClass: telemetry.timerColorClass,
    visibleTimerText: telemetry.visibleTimerText,
    currentBestTime: telemetry.currentBestTime,
    isMultiplayer,
    multiplayerTooltip: telemetry.multiplayerTooltip,
    isAnyPaired: telemetry.isAnyPaired,
    roomId,
    pairingBadge: telemetry.pairingBadge,
    handleOpenPairing,
    handleOpenSettings,
    handleToggleHelp,
  };
}

