'use client';

import { SettingsSection } from '../primitives';
import { AudioVolumeControl } from './audio/AudioVolumeControl';
import { OverlaysSwitchGroup } from './audio/OverlaysSwitchGroup';

interface SettingsAudioOverlaysSectionProps {
  soundVolume: number;
  isSoundMuted: boolean;
  onVolumeChange: (vol: number) => void;
  showTrail: boolean;
  onSetShowTrail: (show: boolean) => void;
  showGhost: boolean;
  onSetShowGhost: (show: boolean) => void;
  showMiniMap: boolean;
  onSetShowMiniMap: (show: boolean) => void;
  isHapticEnabled: boolean;
  onSetHapticEnabled: (enabled: boolean) => void;
}

/**
 * Ayarlar çekmecesi ses düzeyi ve ekran katmanları (iz, hayalet, radar, titreşim) bölümü.
 */
export function SettingsAudioOverlaysSection({
  soundVolume,
  isSoundMuted,
  onVolumeChange,
  showTrail,
  onSetShowTrail,
  showGhost,
  onSetShowGhost,
  showMiniMap,
  onSetShowMiniMap,
  isHapticEnabled,
  onSetHapticEnabled,
}: SettingsAudioOverlaysSectionProps) {
  return (
    <SettingsSection title="Ses ve ekran katmanları">
      <AudioVolumeControl
        soundVolume={soundVolume}
        isSoundMuted={isSoundMuted}
        onVolumeChange={onVolumeChange}
      />

      <OverlaysSwitchGroup
        showTrail={showTrail}
        onSetShowTrail={onSetShowTrail}
        showGhost={showGhost}
        onSetShowGhost={onSetShowGhost}
        showMiniMap={showMiniMap}
        onSetShowMiniMap={onSetShowMiniMap}
        isHapticEnabled={isHapticEnabled}
        onSetHapticEnabled={onSetHapticEnabled}
      />
    </SettingsSection>
  );
}
