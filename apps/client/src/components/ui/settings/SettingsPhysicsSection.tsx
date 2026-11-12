'use client';

import { SettingsSection, FieldLabel, Segmented } from '../primitives';
import {
  GRAVITY_SCALE_OPTIONS,
  TILT_RESPONSIVENESS_OPTIONS,
} from '@/utils/settingsUtils';

interface SettingsPhysicsSectionProps {
  gravityScale: number;
  onSetGravityScale: (scale: number) => void;
  tiltResponsiveness: number;
  onSetTiltResponsiveness: (resp: number) => void;
}

export function SettingsPhysicsSection({
  gravityScale,
  onSetGravityScale,
  tiltResponsiveness,
  onSetTiltResponsiveness,
}: SettingsPhysicsSectionProps) {
  return (
    <SettingsSection title="Fizik ve kontrol">
      <div>
        <FieldLabel>Bilye ivmesi</FieldLabel>
        <Segmented<number>
          label="Bilye ivmesi"
          value={gravityScale}
          options={GRAVITY_SCALE_OPTIONS}
          onChange={onSetGravityScale}
        />
      </div>

      <div>
        <FieldLabel>Eğim tepki hızı</FieldLabel>
        <Segmented<number>
          label="Eğim tepki hızı"
          value={tiltResponsiveness}
          options={TILT_RESPONSIVENESS_OPTIONS}
          onChange={onSetTiltResponsiveness}
        />
      </div>
    </SettingsSection>
  );
}

