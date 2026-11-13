'use client';

import { useGameStore } from '@/store/useGameStore';
import {
  resolveThemeToggleLabel,
  resolveSoundToggleLabel,
  formatCameraControlAriaLabel,
} from '@/utils/quickControlsUtils';

export function useQuickControls() {
  const cameraMode = useGameStore((s) => s.cameraMode);
  const cycleCameraMode = useGameStore((s) => s.cycleCameraMode);
  const colorScheme = useGameStore((s) => s.colorScheme);
  const toggleColorScheme = useGameStore((s) => s.toggleColorScheme);
  const isSoundMuted = useGameStore((s) => s.isSoundMuted);
  const toggleSoundMuted = useGameStore((s) => s.toggleSoundMuted);
  const setEditorOpen = useGameStore((s) => s.setEditorOpen);
  const setLeaderboardOpen = useGameStore((s) => s.setLeaderboardOpen);

  const themeLabel = resolveThemeToggleLabel(colorScheme);
  const soundLabel = resolveSoundToggleLabel(isSoundMuted);
  const cameraLabel = formatCameraControlAriaLabel(cameraMode);

  return {
    cameraMode,
    cycleCameraMode,
    cameraLabel,
    colorScheme,
    toggleColorScheme,
    themeLabel,
    isSoundMuted,
    toggleSoundMuted,
    soundLabel,
    openEditor: () => setEditorOpen(true),
    openLeaderboard: () => setLeaderboardOpen(true),
  };
}
