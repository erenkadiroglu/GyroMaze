'use client';

import { useEffect } from 'react';
import { useGameStore } from '@/store/useGameStore';
import { soundEngine } from '@/utils/soundEngine';
import { resolveKeyboardShortcut } from '@/utils/keyboardShortcuts';

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

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName;
      const isInputFocused =
        tag === 'INPUT' ||
        tag === 'TEXTAREA' ||
        tag === 'SELECT' ||
        Boolean(target?.isContentEditable);

      const action = resolveKeyboardShortcut({
        key: e.key,
        code: e.code,
        ctrlKey: e.ctrlKey,
        metaKey: e.metaKey,
        altKey: e.altKey,
        repeat: e.repeat,
        isInputFocused,
        isGameOver: gameStatus === 'won' || gameStatus === 'lost',
        isAnyOverlayOpen,
        isHelpOpen,
      });

      if (!action) return;

      if (action === 'help') {
        e.preventDefault();
        setHelpOpen(!isHelpOpen);
      } else if (action === 'reset') {
        triggerBallReset();
      } else if (action === 'camera') {
        cycleCameraMode();
      } else if (action === 'mute') {
        toggleSoundMuted();
      } else if (action === 'theme') {
        toggleColorScheme();
      } else if (action === 'editor') {
        e.preventDefault();
        setEditorOpen(true);
      } else if (action === 'leaderboard') {
        e.preventDefault();
        setLeaderboardOpen(true);
      } else if (action === 'pairing') {
        e.preventDefault();
        setPairingModalOpen(true);
      } else if (action === 'calibrate') {
        e.preventDefault();
        if (!isSoundMuted) soundEngine.playCalibrate();
        showHudNotification('Merkez kalibre edildi.');
      } else if (typeof action === 'object' && action.type === 'level') {
        e.preventDefault();
        setLevel(action.level);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [
    isAnyOverlayOpen,
    isHelpOpen,
    gameStatus,
    isSoundMuted,
    triggerBallReset,
    cycleCameraMode,
    toggleSoundMuted,
    toggleColorScheme,
    setHelpOpen,
    setEditorOpen,
    setLeaderboardOpen,
    setPairingModalOpen,
    setLevel,
    showHudNotification,
  ]);
}

