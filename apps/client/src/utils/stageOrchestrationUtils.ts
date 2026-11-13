import {
  shouldThrottleWallHit,
  isBallSpeedSufficientForWallHit,
} from './sceneEventUtils.ts';

/**
 * Renk şeması ve tahta temasına göre açık tema zemin modunu denetler.
 */
export function isLightBoardTheme(
  colorScheme: string,
  boardTheme: string,
): boolean {
  return colorScheme === 'light' || boardTheme === 'daylight';
}

/**
 * Bilyenin 3B/2B doğrusal hız vektörünün yatay düzlem (XZ) büyüklüğünü hesaplar.
 */
export function calculateBallVelocitySpeed(vel: {
  x: number;
  z: number;
}): number {
  return Math.hypot(vel.x, vel.z);
}

/**
 * Duvara çarpma ses efektinin tetiklenip tetiklenmeyeceğini denetler:
 * - Hız eşiğini aşmalı (yeterince hızlı çarpmış olmalı)
 * - Son çalınan ses üzerinden zaman aşımı (throttle) geçmiş olmalı
 */
export function shouldTriggerWallSound(
  now: number,
  lastSoundTime: number,
  speed: number,
  throttleMs: number = 80,
  minSpeed: number = 0.45,
): boolean {
  if (shouldThrottleWallHit(now, lastSoundTime, throttleMs)) {
    return false;
  }
  return isBallSpeedSufficientForWallHit(speed, minSpeed);
}

