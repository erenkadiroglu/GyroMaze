'use client';

import { useMemo } from 'react';
import { useGameStore } from '@/store/useGameStore';
import { resolveQuickControlsToolbarState } from '@/utils/quickControlsOrchestrationUtils';

export function useQuickControls() {
  const cameraMode = useGameStore((s) => s.cameraMode);
  const cycleCameraMode = useGameStore((s) => s.cycleCameraMode);
  const colorScheme = useGameStore((s) => s.colorScheme);
  const toggleColorScheme = useGameStore((s) => s.toggleColorScheme);
  const isSoundMuted = useGameStore((s) => s.isSoundMuted);
  const toggleSoundMuted = useGameStore((s) => s.toggleSoundMuted);
  const setEditorOpen = useGameStore((s) => s.setEditorOpen);
  const setLeaderboardOpen = useGameStore((s) => s.setLeaderboardOpen);

  const state = useMemo(
    () =>
      resolveQuickControlsToolbarState({
        cameraMode,
        colorScheme,
        isSoundMuted,
      }),
    [cameraMode, colorScheme, isSoundMuted],
  );

  return {
    cameraMode,
    cycleCameraMode,
    cameraLabel: state.cameraLabel,
    colorScheme,
    toggleColorScheme,
    themeLabel: state.themeLabel,
    isSoundMuted,
    toggleSoundMuted,
    soundLabel: state.soundLabel,
    toolbarAriaLabel: state.toolbarAriaLabel,
    toolbarClass: state.toolbarClass,
    separatorClass: state.separatorClass,
    openEditor: () => setEditorOpen(true),
    openLeaderboard: () => setLeaderboardOpen(true),
  };
}
