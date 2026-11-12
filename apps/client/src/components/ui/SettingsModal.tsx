'use client';

import { Wrench, Medal, RotateCcw } from 'lucide-react';
import { useGameStore } from '@/store/useGameStore';
import { soundEngine } from '@/utils/soundEngine';
import { Drawer, Button } from './primitives';
import { SettingsGameModeSection } from './settings/SettingsGameModeSection';
import { SettingsAppearanceSection } from './settings/SettingsAppearanceSection';
import { SettingsPhysicsSection } from './settings/SettingsPhysicsSection';
import { SettingsAudioOverlaysSection } from './settings/SettingsAudioOverlaysSection';

/**
 * Sağdan açılan modüler birleşik Ayarlar Paneli.
 * Oyun modu, görünüm/kamera/bilye stili, fizik ivmesi, ses ve katman tercihlerini
 * ayrık bölüm bileşenleri halinde sunar.
 */
export function SettingsModal() {
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

  const handleVolumeChange = (nextVol: number) => {
    if (nextVol === 0) {
      if (!isSoundMuted) toggleSoundMuted();
      return;
    }
    soundEngine.setVolume(nextVol);
    updateSettings({ soundVolume: nextVol });
    if (isSoundMuted) toggleSoundMuted();
    soundEngine.playCalibrate();
  };

  return (
    <Drawer
      open={isSettingsOpen}
      onClose={() => setSettingsOpen(false)}
      title="Ayarlar"
      footer={
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="secondary"
              size="sm"
              icon={<Wrench className="h-3.5 w-3.5" aria-hidden="true" />}
              onClick={() => {
                setSettingsOpen(false);
                setEditorOpen(true);
              }}
            >
              Harita editörü
            </Button>
            <Button
              variant="secondary"
              size="sm"
              icon={<Medal className="h-3.5 w-3.5" aria-hidden="true" />}
              onClick={() => {
                setSettingsOpen(false);
                setLeaderboardOpen(true);
              }}
            >
              Skor tablosu
            </Button>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-muted hover:text-fg"
            icon={<RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />}
            onClick={() => {
              resetPreferencesToDefaults();
            }}
          >
            Varsayılanlara dön
          </Button>
        </div>
      }
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
    </Drawer>
  );
}
