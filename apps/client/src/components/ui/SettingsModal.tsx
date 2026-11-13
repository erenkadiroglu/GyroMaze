'use client';

import { Drawer } from './primitives';
import { useSettingsDrawer } from '@/hooks/useSettingsDrawer';
import {
  getSettingsModalTitle,
  getSettingsContainerAriaLabel,
} from '@/utils/settingsModalViewUtils';
import {
  SettingsGameModeSection,
  SettingsAppearanceSection,
  SettingsPhysicsSection,
  SettingsAudioOverlaysSection,
  SettingsDrawerFooter,
} from './settings';

/**
 * Sağdan açılan modüler birleşik Ayarlar Paneli:
 * Oyun modu, görünüm/kamera/bilye stili, fizik ivmesi, ses ve katman tercihlerini
 * ayrık bölüm bileşenleri halinde sunan orkestratör bileşen.
 */
export function SettingsModal() {
  const {
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
  } = useSettingsDrawer();

  return (
    <Drawer
      open={isSettingsOpen}
      onClose={handleClose}
      title={getSettingsModalTitle()}
      footer={
        <SettingsDrawerFooter
          onOpenEditor={handleOpenEditor}
          onOpenLeaderboard={handleOpenLeaderboard}
          onResetDefaults={resetPreferencesToDefaults}
        />
      }
    >
      <div
        className="space-y-6"
        role="region"
        aria-label={getSettingsContainerAriaLabel()}
      >
        <SettingsGameModeSection
          isMultiplayer={isMultiplayer}
          onToggleMultiplayer={toggleMultiplayer}
          gameMode={gameMode}
          onSetGameMode={setGameMode}
        />

        <SettingsAppearanceSection
          colorScheme={colorScheme}
          onSetColorScheme={setColorScheme}
          boardTheme={boardTheme}
          onSetBoardTheme={setBoardTheme}
          cameraMode={cameraMode}
          onSetCameraMode={setCameraMode}
          ballSkin={ballSkin}
          onSetBallSkin={setBallSkin}
        />

        <SettingsPhysicsSection
          gravityScale={gravityScale}
          onSetGravityScale={(val) => updateSettings({ gravityScale: val })}
          tiltResponsiveness={tiltResponsiveness}
          onSetTiltResponsiveness={(val) =>
            updateSettings({ tiltResponsiveness: val })
          }
        />

        <SettingsAudioOverlaysSection
          soundVolume={soundVolume}
          isSoundMuted={isSoundMuted}
          onVolumeChange={handleVolumeChange}
          showTrail={showTrail}
          onSetShowTrail={(val) => updateSettings({ showTrail: val })}
          showGhost={showGhost}
          onSetShowGhost={(val) => updateSettings({ showGhost: val })}
          showMiniMap={showMiniMap}
          onSetShowMiniMap={(val) => updateSettings({ showMiniMap: val })}
          isHapticEnabled={isHapticEnabled}
          onSetHapticEnabled={(val) => updateSettings({ isHapticEnabled: val })}
        />
      </div>
    </Drawer>
  );
}
