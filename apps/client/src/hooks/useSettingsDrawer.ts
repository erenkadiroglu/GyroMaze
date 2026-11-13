'use client';

import { useCallback } from 'react';
import { useGameStore } from '@/store/useGameStore';
import { soundEngine } from '@/utils/soundEngine';
import { resolveVolumeTransition } from '@/utils/settingsUtils';

/**
 * Ayarlar çekmecesi (SettingsDrawer) için durum yönetimi,
 * ses geçişleri, harita editörü / skor tablosu kısayolları ve sıfırlama kancası.
 */
export function useSettingsDrawer() {
  const isSettingsOpen = useGameStore((s) => s.isSettingsOpen);
  const setSettingsOpen = useGameStore((s) => s.setSettingsOpen);
  const isMultiplayer = useGameStore((s) => s.isMultiplayer);
  const toggleMultiplayer = useGameStore((s) => s.toggleMultiplayer);
  const gameMode = useGameStore((s) => s.gameMode);
  const setGameMode = useGameStore((s) => s.setGameMode);
  const colorScheme = useGameStore((s) => s.colorScheme);
  const setColorScheme = useGameStore((s) => s.setColorScheme);
  const boardTheme = useGameStore((s) => s.boardTheme);
  const setBoardTheme = useGameStore((s) => s.setBoardTheme);
  const cameraMode = useGameStore((s) => s.cameraMode);
  const setCameraMode = useGameStore((s) => s.setCameraMode);
  const ballSkin = useGameStore((s) => s.ballSkin);
  const setBallSkin = useGameStore((s) => s.setBallSkin);
  const gravityScale = useGameStore((s) => s.gravityScale);
  const tiltResponsiveness = useGameStore((s) => s.tiltResponsiveness);
  const soundVolume = useGameStore((s) => s.soundVolume);
  const isSoundMuted = useGameStore((s) => s.isSoundMuted);
  const toggleSoundMuted = useGameStore((s) => s.toggleSoundMuted);
  const showTrail = useGameStore((s) => s.showTrail);
  const showGhost = useGameStore((s) => s.showGhost);
  const showMiniMap = useGameStore((s) => s.showMiniMap);
  const isHapticEnabled = useGameStore((s) => s.isHapticEnabled);
  const updateSettings = useGameStore((s) => s.updateSettings);
  const setEditorOpen = useGameStore((s) => s.setEditorOpen);
  const setLeaderboardOpen = useGameStore((s) => s.setLeaderboardOpen);
  const resetPreferencesToDefaults = useGameStore(
    (s) => s.resetPreferencesToDefaults,
  );

  const handleVolumeChange = useCallback(
    (nextVol: number) => {
      const { shouldToggleMute, safeVolume, shouldPlayTone } =
        resolveVolumeTransition(nextVol, isSoundMuted);

      if (safeVolume === 0) {
        if (shouldToggleMute) toggleSoundMuted();
        return;
      }

      soundEngine.setVolume(safeVolume);
      updateSettings({ soundVolume: safeVolume });
      if (shouldToggleMute) toggleSoundMuted();
      if (shouldPlayTone) soundEngine.playCalibrate();
    },
    [isSoundMuted, toggleSoundMuted, updateSettings],
  );

  const handleOpenEditor = useCallback(() => {
    setSettingsOpen(false);
    setEditorOpen(true);
  }, [setSettingsOpen, setEditorOpen]);

  const handleOpenLeaderboard = useCallback(() => {
    setSettingsOpen(false);
    setLeaderboardOpen(true);
  }, [setSettingsOpen, setLeaderboardOpen]);

  const handleClose = useCallback(() => {
    setSettingsOpen(false);
  }, [setSettingsOpen]);

  return {
    isSettingsOpen,
    handleClose,
    isMultiplayer,
    toggleMultiplayer,
    gameMode,
    setGameMode,
    colorScheme,
    setColorScheme,
    boardTheme,
    setBoardTheme,
    cameraMode,
    setCameraMode,
    ballSkin,
    setBallSkin,
    gravityScale,
    tiltResponsiveness,
    soundVolume,
    isSoundMuted,
    showTrail,
    showGhost,
    showMiniMap,
    isHapticEnabled,
    updateSettings,
    handleVolumeChange,
    handleOpenEditor,
    handleOpenLeaderboard,
    resetPreferencesToDefaults,
  };
}

