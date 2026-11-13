'use client';

import { useMemo } from 'react';
import { useGameStore } from '@/store/useGameStore';
import {
  resolveDesktopModalsLayerState,
  ResolvedDesktopModalsLayerState,
} from '@/utils/desktopModalsOrchestrationUtils';

export interface UseDesktopModalsOptions {
  isLeaderboardOpen: boolean;
  onCloseLeaderboard: () => void;
  leaderboardInitialLevel: number;
}

export interface UseDesktopModalsResult {
  state: ResolvedDesktopModalsLayerState;
  isLeaderboardOpen: boolean;
  onCloseLeaderboard: () => void;
  leaderboardInitialLevel: number;
}

/**
 * Masaüstü HUD sahnesi üzerindeki tüm modalların, çekmecelerin ve oyun sonu
 * bildirimlerinin öncelik, görünürlük ve erişilebilirlik durumunu koordine eden kanca.
 */
export function useDesktopModals({
  isLeaderboardOpen,
  onCloseLeaderboard,
  leaderboardInitialLevel,
}: UseDesktopModalsOptions): UseDesktopModalsResult {
  const isEditorOpen = useGameStore((s) => s.isEditorOpen);
  const isSettingsOpen = useGameStore((s) => s.isSettingsOpen);
  const isHelpOpen = useGameStore((s) => s.isHelpOpen);
  const isPairingModalOpen = useGameStore((s) => s.isPairingModalOpen);
  const gameStatus = useGameStore((s) => s.gameStatus);

  const state = useMemo(
    () =>
      resolveDesktopModalsLayerState({
        isEditorOpen,
        isSettingsOpen,
        isHelpOpen,
        isPairingModalOpen,
        isLeaderboardOpen,
        gameStatus,
      }),
    [
      isEditorOpen,
      isSettingsOpen,
      isHelpOpen,
      isPairingModalOpen,
      isLeaderboardOpen,
      gameStatus,
    ],
  );

  return {
    state,
    isLeaderboardOpen,
    onCloseLeaderboard,
    leaderboardInitialLevel,
  };
}
