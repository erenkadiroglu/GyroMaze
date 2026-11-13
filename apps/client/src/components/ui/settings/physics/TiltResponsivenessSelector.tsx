'use client';

import { FieldLabel, Segmented } from '../../primitives';
import { TILT_RESPONSIVENESS_OPTIONS } from '@/utils/settingsUtils';

interface TiltResponsivenessSelectorProps {
  tiltResponsiveness: number;
  onSetTiltResponsiveness: (resp: number) => void;
}

/**
 * Ayarlar modalı eğim tepki hızı (Yumuşak / Standart / Anında) seçici bileşeni.
 */
export function TiltResponsivenessSelector({
  tiltResponsiveness,
  onSetTiltResponsiveness,
}: TiltResponsivenessSelectorProps) {
  return (
    <div>
      <FieldLabel>Eğim tepki hızı</FieldLabel>
      <Segmented<number>
        label="Eğim tepki hızı"
        value={tiltResponsiveness}
        options={TILT_RESPONSIVENESS_OPTIONS}
        onChange={onSetTiltResponsiveness}
      />
    </div>
  );
}
