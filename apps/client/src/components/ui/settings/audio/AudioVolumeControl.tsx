'use client';

import { FieldLabel, Segmented } from '../../primitives';
import {
  VOLUME_SEGMENTED_OPTIONS,
  formatVolumeLabel,
  resolveActiveVolumeValue,
} from '@/utils/settingsUtils';

interface AudioVolumeControlProps {
  soundVolume: number;
  isSoundMuted: boolean;
  onVolumeChange: (vol: number) => void;
}

/**
 * Ayarlar modalı ses şiddeti etiket ve Segmented seçici kontrolü.
 */
export function AudioVolumeControl({
  soundVolume,
  isSoundMuted,
  onVolumeChange,
}: AudioVolumeControlProps) {
  const activeVolumeKey = resolveActiveVolumeValue(soundVolume, isSoundMuted);
  const volumeLabel = formatVolumeLabel(soundVolume, isSoundMuted);

  return (
    <div>
      <FieldLabel value={volumeLabel}>Ses şiddeti</FieldLabel>
      <Segmented<number>
        label="Ses şiddeti"
        value={activeVolumeKey}
        options={VOLUME_SEGMENTED_OPTIONS}
        onChange={onVolumeChange}
      />
    </div>
  );
}
