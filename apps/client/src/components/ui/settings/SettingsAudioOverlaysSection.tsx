'use client';

import { SettingsSection, FieldLabel, Segmented, SwitchRow } from '../primitives';
import {
  VOLUME_SEGMENTED_OPTIONS,
  formatVolumeLabel,
  resolveActiveVolumeValue,
} from '@/utils/settingsUtils';

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
  const activeVolumeKey = resolveActiveVolumeValue(soundVolume, isSoundMuted);
  const volumeLabel = formatVolumeLabel(soundVolume, isSoundMuted);

  return (
    <SettingsSection title="Ses ve ekran katmanları">
      <div>
        <FieldLabel value={volumeLabel}>Ses şiddeti</FieldLabel>
        <Segmented<number>
          label="Ses şiddeti"
          value={activeVolumeKey}
          options={VOLUME_SEGMENTED_OPTIONS}
          onChange={onVolumeChange}
        />
      </div>

      <div className="divide-y divide-line pt-1">
        <SwitchRow
          label="Neon hareket izi"
          description="Bilyenin arkasındaki parlak iz halkaları"
          checked={showTrail}
          onChange={onSetShowTrail}
        />
        <SwitchRow
          label="3B hayalet yarışçı"
          description="Bölümdeki en iyi turunun canlı hologramı"
          checked={showGhost}
          onChange={onSetShowGhost}
        />
        <SwitchRow
          label="2B canlı radar"
          description="Sol alt göstergede üstten harita konumu"
          checked={showMiniMap}
          onChange={onSetShowMiniMap}
        />
        <SwitchRow
          label="Mobil titreşim (Haptik)"
          description="Çarpma, lazer ve portallarda telefon titreşimi"
          checked={isHapticEnabled}
          onChange={onSetHapticEnabled}
        />
      </div>
    </SettingsSection>
  );
}

