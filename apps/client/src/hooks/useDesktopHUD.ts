'use client';

import { useMemo } from 'react';
import { useGameStore } from '@/store/useGameStore';
import { useGameTimer } from '@/hooks/useGameTimer';
import { useDesktopKeyboardShortcuts } from '@/hooks/useDesktopKeyboardShortcuts';
import { resolveDesktopHudState } from '@/utils/desktopHudOrchestrationUtils';

export function useDesktopHUD() {
  const isPairingModalOpen = useGameStore((s) => s.isPairingModalOpen);
  const isLeaderboardOpen = useGameStore((s) => s.isLeaderboardOpen);
  const setLeaderboardOpen = useGameStore((s) => s.setLeaderboardOpen);
  const isEditorOpen = useGameStore((s) => s.isEditorOpen);
  const isSettingsOpen = useGameStore((s) => s.isSettingsOpen);
  const isHelpOpen = useGameStore((s) => s.isHelpOpen);
  const level = useGameStore((s) => s.level);
  const customLevel = useGameStore((s) => s.customLevel);
  const collectedCrystals = useGameStore((s) => s.collectedCrystals);

  const resolved = useMemo(
    () =>
      resolveDesktopHudState({
        level,
        customLevel,
        collectedCrystals,
        overlayFlags: {
          isPairingModalOpen,
          isSettingsOpen,
          isEditorOpen,
          isLeaderboardOpen,
          isHelpOpen,
        },
      }),
    [
      level,
      customLevel,
      collectedCrystals,
      isPairingModalOpen,
      isSettingsOpen,
      isEditorOpen,
      isLeaderboardOpen,
      isHelpOpen,
    ],
  );

  // Oyun saati ve Süreye Karşı modu kancası
  const { handleResetClick } = useGameTimer({
    starThresholds: resolved.starThresholds,
    isAnyOverlayOpen: resolved.isAnyOverlayOpen,
  });

  // Global masaüstü klavye kısayolları kancası
  useDesktopKeyboardShortcuts({
    isAnyOverlayOpen: resolved.isAnyOverlayOpen,
    isHelpOpen,
  });

  return {
    currentLevelInfo: resolved.currentLevelInfo,
    remainingCrystals: resolved.remainingCrystals,
    isPortalUnlocked: resolved.isPortalUnlocked,
    isAnyOverlayOpen: resolved.isAnyOverlayOpen,
    handleResetClick,
    isLeaderboardOpen,
    setLeaderboardOpen,
    leaderboardInitialLevel: resolved.leaderboardInitialLevel,
    crystalProgressText: resolved.crystalProgressText,
    crystalProgressPercentage: resolved.crystalProgressPercentage,
    levelBadgeText: resolved.levelBadgeText,
  };
}
