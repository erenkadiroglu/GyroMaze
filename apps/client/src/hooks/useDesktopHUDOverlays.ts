'use client';

import { useMemo, useCallback } from 'react';
import { useGameStore } from '@/store/useGameStore';
import {
  resolveDesktopOverlaysState,
  ResolvedDesktopOverlaysState,
} from '@/utils/desktopOverlaysOrchestrationUtils';

export interface UseDesktopHUDOverlaysOptions {
  isAnyOverlayOpen: boolean;
}

export interface UseDesktopHUDOverlaysResult {
  showRecoveryBar: boolean;
  handlePairClick: () => void;
  handleResumeClick: () => void;
  hudNotification: ReturnType<typeof useGameStore.getState>['hudNotification'];
  containerProps: ResolvedDesktopOverlaysState['containerProps'];
  state: ResolvedDesktopOverlaysState;
}

/**
 * Masaüstü HUD sahne üzeri duraklatma/bağlantı kurtarma çubuğu ve
 * bildirim toast kartlarının durumunu koordine eden kanca.
 */
export function useDesktopHUDOverlays({
  isAnyOverlayOpen,
}: UseDesktopHUDOverlaysOptions): UseDesktopHUDOverlaysResult {
  const gameStatus = useGameStore((s) => s.gameStatus);
  const setGameStatus = useGameStore((s) => s.setGameStatus);
  const setPairingModalOpen = useGameStore((s) => s.setPairingModalOpen);
  const hudNotification = useGameStore((s) => s.hudNotification);

  const handlePairClick = useCallback(() => {
    setPairingModalOpen(true);
  }, [setPairingModalOpen]);

  const handleResumeClick = useCallback(() => {
    setGameStatus('playing');
  }, [setGameStatus]);

  const state = useMemo(
    () =>
      resolveDesktopOverlaysState({
        gameStatus,
        isAnyOverlayOpen,
        hudNotification,
      }),
    [gameStatus, isAnyOverlayOpen, hudNotification],
  );

  return {
    showRecoveryBar: state.showRecoveryBar,
    handlePairClick,
    handleResumeClick,
    hudNotification,
    containerProps: state.containerProps,
    state,
  };
}
