'use client';

import { useGameStore } from '@/store/useGameStore';
import { getMazeLevel } from '@/components/scene/mazeLevels';
import { useGameTimer } from '@/hooks/useGameTimer';
import { useDesktopKeyboardShortcuts } from '@/hooks/useDesktopKeyboardShortcuts';
import {
  calculateRemainingCrystals,
  resolveIsPortalUnlocked,
  resolveAnyOverlayOpen,
  resolveLeaderboardInitialLevel,
} from '@/utils/desktopHudUtils';

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

  const currentLevelInfo = getMazeLevel(level, customLevel);
  const totalCrystals = currentLevelInfo.crystals.length;
  const remainingCrystals = calculateRemainingCrystals(
    currentLevelInfo.crystals,
    collectedCrystals,
  );
  const isPortalUnlocked = resolveIsPortalUnlocked(
    totalCrystals,
    collectedCrystals.length,
  );

  const isAnyOverlayOpen = resolveAnyOverlayOpen({
    isPairingModalOpen,
    isSettingsOpen,
    isEditorOpen,
    isLeaderboardOpen,
    isHelpOpen,
  });

  // Oyun saati ve Süreye Karşı modu kancası
  const { handleResetClick } = useGameTimer({
    starThresholds: currentLevelInfo.starThresholds,
    isAnyOverlayOpen,
  });

  // Global masaüstü klavye kısayolları kancası
  useDesktopKeyboardShortcuts({
    isAnyOverlayOpen,
    isHelpOpen,
  });

  const leaderboardInitialLevel = resolveLeaderboardInitialLevel(currentLevelInfo.id);

  return {
    currentLevelInfo,
    remainingCrystals,
    isPortalUnlocked,
    isAnyOverlayOpen,
    handleResetClick,
    isLeaderboardOpen,
    setLeaderboardOpen,
    leaderboardInitialLevel,
  };
}
