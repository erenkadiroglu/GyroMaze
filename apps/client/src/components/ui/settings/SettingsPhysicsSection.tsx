'use client';

import { SettingsSection } from '../primitives';
import { GravityScaleSelector } from './physics/GravityScaleSelector';
import { TiltResponsivenessSelector } from './physics/TiltResponsivenessSelector';

interface SettingsPhysicsSectionProps {
  gravityScale: number;
  onSetGravityScale: (scale: number) => void;
  tiltResponsiveness: number;
  onSetTiltResponsiveness: (resp: number) => void;
}

/**
 * Ayarlar çekmecesi fizik ve kontrol (bilye ivmesi ve eğim tepki hızı) bölümü.
 */
export function SettingsPhysicsSection({
  gravityScale,
  onSetGravityScale,
  tiltResponsiveness,
  onSetTiltResponsiveness,
}: SettingsPhysicsSectionProps) {
  return (
    <SettingsSection title="Fizik ve kontrol">
      <GravityScaleSelector
        gravityScale={gravityScale}
        onSetGravityScale={onSetGravityScale}
      />

      <TiltResponsivenessSelector
        tiltResponsiveness={tiltResponsiveness}
        onSetTiltResponsiveness={onSetTiltResponsiveness}
      />
    </SettingsSection>
  );
}
