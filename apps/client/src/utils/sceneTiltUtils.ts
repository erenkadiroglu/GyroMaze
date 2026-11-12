import { MAX_TILT_RADIANS } from '../components/scene/sceneMaterials.ts';
import { stepBallVelocity } from './sceneCollisions.ts';

export interface TiltAnglesRad {
  pitchRad: number;
  rollRad: number;
}

/**
 * Jiroskop beta ve gamma açılarından güvenli ve sınırlanmış radyan eğim açılarını hesaplar.
 */
export function calculateClampedTiltAngles(
  betaDeg: number,
  gammaDeg: number,
  isInteractive: boolean,
  maxTiltRad: number = MAX_TILT_RADIANS,
): TiltAnglesRad {
  if (!isInteractive) {
    return { pitchRad: 0, rollRad: 0 };
  }

  // Dereceyi radyana çevir (beta: pitch X ekseni, gamma: roll Z ekseni)
  const degToRad = Math.PI / 180;
  const rawPitch = betaDeg * degToRad;
  const rawRoll = -gammaDeg * degToRad;

  const clampedPitch = Math.min(maxTiltRad, Math.max(-maxTiltRad, rawPitch));
  const clampedRoll = Math.min(maxTiltRad, Math.max(-maxTiltRad, rawRoll));

  return {
    pitchRad: Number(clampedPitch.toFixed(6)),
    rollRad: Number(clampedRoll.toFixed(6)),
  };
}

/**
 * Yol kaydı koordinatını 2 ondalık basamağa yuvarlayarak sıkıştırır.
 */
export function formatPathPoint(x: number, z: number): [number, number] {
  return [Math.round(x * 100) / 100, Math.round(z * 100) / 100];
}

/**
 * Maksimum yol uzunluğu aşılmadığında yeni nokta eklenebilir mi denetler.
 */
export function canRecordPathPoint(
  currentLength: number,
  maxLength: number = 600,
): boolean {
  return currentLength < maxLength;
}

/**
 * Oyun etkileşim durumuna göre bilyenin yeni kare hız vektörünü adım adım hesaplar.
 */
export function calculateBallLinvelStep(
  currentVel: { x: number; y: number; z: number },
  tiltAngles: { x: number; z: number },
  gravityScale: number,
  safeDelta: number,
  isInteractive: boolean,
): { x: number; y: number; z: number } {
  if (!isInteractive) {
    return { x: 0, y: 0, z: 0 };
  }

  const next2D = stepBallVelocity(
    currentVel,
    tiltAngles,
    gravityScale,
    safeDelta,
  );
  return { x: next2D.x, y: 0, z: next2D.z };
}
