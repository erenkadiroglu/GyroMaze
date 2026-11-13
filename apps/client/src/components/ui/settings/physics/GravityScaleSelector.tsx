'use client';

import { FieldLabel, Segmented } from '../../primitives';
import { GRAVITY_SCALE_OPTIONS } from '@/utils/settingsUtils';

interface GravityScaleSelectorProps {
  gravityScale: number;
  onSetGravityScale: (scale: number) => void;
}

/**
 * Ayarlar modalı bilye ivmesi (Yavaş / Standart / Turbo) seçici bileşeni.
 */
export function GravityScaleSelector({
  gravityScale,
  onSetGravityScale,
}: GravityScaleSelectorProps) {
  return (
    <div>
      <FieldLabel>Bilye ivmesi</FieldLabel>
      <Segmented<number>
        label="Bilye ivmesi"
        value={gravityScale}
        options={GRAVITY_SCALE_OPTIONS}
        onChange={onSetGravityScale}
      />
    </div>
  );
}
