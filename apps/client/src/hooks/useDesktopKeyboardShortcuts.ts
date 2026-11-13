'use client';

import { useEffect, useMemo } from 'react';
import { useGameStore } from '@/store/useGameStore';
import { soundEngine } from '@/utils/soundEngine';
import {
  handleDesktopKeyDown,
  type DesktopShortcutHandlers,
} from '@/utils/keyboardShortcutsListenerUtils';

export interface UseDesktopKeyboardShortcutsOptions {
  isAnyOverlayOpen: boolean;
  isHelpOpen: boolean;
}

/**
 * Masaüstü HUD genel klavye kısayollarını (R, C, M, L, H/?, E, K, P, 1..5, Space)
 * form odakları ve modal durumlarıyla koordine eden kanca.
 */
export function useDesktopKeyboardShortcuts({
  isAnyOverlayOpen,
  isHelpOpen,
}: UseDesktopKeyboardShortcutsOptions) {
  const gameStatus = useGameStore((s) => s.gameStatus);
  const cycleCameraMode = useGameStore((s) => s.cycleCameraMode);
  const toggleColorScheme = useGameStore((s) => s.toggleColorScheme);
  const isSoundMuted = useGameStore((s) => s.isSoundMuted);
  const toggleSoundMuted = useGameStore((s) => s.toggleSoundMuted);
  const triggerBallReset = useGameStore((s) => s.triggerBallReset);
  const setHelpOpen = useGameStore((s) => s.setHelpOpen);
  const setEditorOpen = useGameStore((s) => s.setEditorOpen);
  const setLeaderboardOpen = useGameStore((s) => s.setLeaderboardOpen);
  const setPairingModalOpen = useGameStore((s) => s.setPairingModalOpen);
  const setLevel = useGameStore((s) => s.setLevel);
  const showHudNotification = useGameStore((s) => s.showHudNotification);

  const handlers: DesktopShortcutHandlers = useMemo(
    () => ({
      onHelpToggle: (nextState) => setHelpOpen(nextState),
      onBallReset: () => triggerBallReset(),
      onCycleCamera: () => cycleCameraMode(),
      onToggleMute: () => toggleSoundMuted(),
      onToggleTheme: () => toggleColorScheme(),
      onOpenEditor: () => setEditorOpen(true),
      onOpenLeaderboard: () => setLeaderboardOpen(true),
      onOpenPairing: () => setPairingModalOpen(true),
      onCalibrate: () => {
        if (!isSoundMuted) soundEngine.playCalibrate();
        showHudNotification('Merkez kalibre edildi.');
      },
      onSetLevel: (lvl) => setLevel(lvl),
    }),
    [
      setHelpOpen,
      triggerBallReset,
      cycleCameraMode,
      toggleSoundMuted,
      toggleColorScheme,
      setEditorOpen,
      setLeaderboardOpen,
      setPairingModalOpen,
      isSoundMuted,
      showHudNotification,
      setLevel,
    ],
  );

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      handleDesktopKeyDown(
        e,
        {
          isAnyOverlayOpen,
          isHelpOpen,
          gameStatus,
        },
        handlers,
      );
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isAnyOverlayOpen, isHelpOpen, gameStatus, handlers]);
}

