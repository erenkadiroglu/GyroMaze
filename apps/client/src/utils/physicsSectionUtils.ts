import {
  GRAVITY_SCALE_OPTIONS,
  TILT_RESPONSIVENESS_OPTIONS,
} from './settingsUtils.ts';

/**
 * Bilye ivmesi sayısal değerini insan okunabilir etikete dönüştürür.
 */
export function formatPhysicsScaleLabel(scale: number): string {
  const match = GRAVITY_SCALE_OPTIONS.find((opt) => opt.value === scale);
  return match ? `${match.label} (${scale})` : `${scale}`;
}

/**
 * Eğim tepki hızı değerini insan okunabilir etikete dönüştürür.
 */
export function formatTiltResponsivenessLabel(resp: number): string {
  const match = TILT_RESPONSIVENESS_OPTIONS.find((opt) => opt.value === resp);
  return match ? `${match.label} (${resp})` : `${resp}`;
}

/**
 * Bilye ivmesinin turbo modda (>=46) olup olmadığını doğrular.
 */
export function isTurboPhysics(scale: number): boolean {
  return scale >= 46;
}

/**
 * Eğim tepki hızının anında (>=48) olup olmadığını doğrular.
 */
export function isInstantTilt(resp: number): boolean {
  return resp >= 48;
}
