import type { CameraMode } from '@gyromaze/shared';

/**
 * Kare hızından bağımsız (frame-rate independent) üssel sönümleme (lerp) katsayısı hesaplar.
 * Formül: 1 - exp(-damping * delta)
 * Sonuç her zaman [0, 1] aralığına sınırlandırılır.
 */
export function calculateCameraLerpAlpha(
  damping: number,
  delta: number,
): number {
  if (damping <= 0 || delta <= 0) return 0;
  const alpha = 1 - Math.exp(-damping * delta);
  return Math.min(1, Math.max(0, alpha));
}

/**
 * Bilye hızına göre dinamik FOV (görüş açısı) hesaplar.
 * Yüksek hızlarda (özellikle hızlandırma rampası sonrası) sinematik derinlik ve hız hissi kazandırır.
 */
export function calculateDynamicFov(
  speed: number,
  baseFov: number = 42,
  maxExtraFov: number = 6,
  speedThreshold: number = 10,
): number {
  if (speed <= 0) return baseFov;
  const ratio = Math.min(1, speed / Math.max(0.1, speedThreshold));
  return Number((baseFov + ratio * maxExtraFov).toFixed(2));
}

export interface CameraTransformTarget {
  targetPos: [number, number, number];
  lookAt: [number, number, number];
}

/**
 * Seçili kamera moduna göre 3B kameranın hedef konumunu ve odak (lookAt) noktasını hesaplar.
 */
export function calculateCameraTargetTransform(
  cameraMode: CameraMode,
  ballPos: { x: number; z: number },
  clampedRoll: number,
  clampedPitch: number,
): CameraTransformTarget {
  if (cameraMode === 'topdown') {
    return {
      targetPos: [-clampedRoll * 1.2, 18.2, 0.6 + clampedPitch * 1.2],
      lookAt: [0, 0, 0],
    };
  }

  if (cameraMode === 'follow') {
    return {
      targetPos: [
        ballPos.x * 0.62 - clampedRoll * 1.8,
        10.8,
        ballPos.z * 0.62 + 6.8 + clampedPitch * 1.5,
      ],
      lookAt: [ballPos.x * 0.52, 0, ballPos.z * 0.52],
    };
  }

  // Varsayılan: İzometrik (isometric)
  return {
    targetPos: [-clampedRoll * 2.4, 14.5, 10.2 + clampedPitch * 2.0],
    lookAt: [0, 0, 0],
  };
}

/**
 * Doğrusal hıza ve bilye yarıçapına bağlı olarak görsel bilyenin yuvarlanma açılarını günceller.
 */
export function calculateBallRollingRotation(
  currentRotation: { x: number; z: number },
  linvel: { x: number; z: number },
  radius: number,
  delta: number,
): { x: number; z: number } {
  const safeRadius = Math.max(0.01, radius);
  return {
    x: currentRotation.x + (linvel.z / safeRadius) * delta,
    z: currentRotation.z - (linvel.x / safeRadius) * delta,
  };
}

/**
 * Neon hareket izi noktalarının tarihçesini GC üretmeden pürüzsüzce kaydırır.
 */
export function stepTrailHistory(
  history: Array<{ x: number; z: number }>,
  newPos: { x: number; z: number },
  smoothFactor: number = 0.42,
): void {
  const len = history.length;
  if (len === 0) return;

  for (let i = len - 1; i > 0; i--) {
    history[i].x += (history[i - 1].x - history[i].x) * smoothFactor;
    history[i].z += (history[i - 1].z - history[i].z) * smoothFactor;
  }
  history[0].x = newPos.x;
  history[0].z = newPos.z;
}

/**
 * Hayalet yarışçı örnekleme zaman kontrolünü deterministik olarak hesaplar.
 */
export function shouldUpdateGhostSample(
  runElapsed: number,
  lastSampleTime: number,
  sampleInterval: number = 0.1,
): { shouldSample: boolean; nextSampleTime: number } {
  const elapsedSinceSample = runElapsed - lastSampleTime;
  if (elapsedSinceSample >= sampleInterval) {
    const nextSampleTime =
      elapsedSinceSample > sampleInterval * 2.5
        ? runElapsed
        : lastSampleTime + sampleInterval;
    return { shouldSample: true, nextSampleTime };
  }
  return { shouldSample: false, nextSampleTime: lastSampleTime };
}

/**
 * Jiroskop açılarını derece cinsinden radyana çevirip kamera eğim sınırlarına kenetler.
 */
export function calculateCameraClampedTilt(
  beta: number,
  gamma: number,
  isInteractive: boolean,
  maxTiltRadians: number = 0.418879,
): { clampedPitch: number; clampedRoll: number } {
  if (!isInteractive) {
    return { clampedPitch: 0, clampedRoll: 0 };
  }
  const degToRad = Math.PI / 180;
  const rawPitchRad = (Number.isFinite(beta) ? beta : 0) * degToRad;
  const rawRollRad = -(Number.isFinite(gamma) ? gamma : 0) * degToRad;

  const clampedPitch = Math.max(-maxTiltRadians, Math.min(maxTiltRadians, rawPitchRad));
  const clampedRoll = Math.max(-maxTiltRadians, Math.min(maxTiltRadians, rawRollRad));

  return { clampedPitch, clampedRoll };
}

/**
 * Mevcut FOV ile hedef FOV arasındaki fark eşikten büyükse yeni sönümlenmiş FOV değerini döner.
 */
export function calculateNextCameraFov(
  currentFov: number,
  targetFov: number,
  lerpAlpha: number,
  threshold: number = 0.04,
): { shouldUpdate: boolean; nextFov: number } {
  const diff = Math.abs(currentFov - targetFov);
  if (diff > threshold) {
    return {
      shouldUpdate: true,
      nextFov: currentFov + (targetFov - currentFov) * lerpAlpha,
    };
  }
  return {
    shouldUpdate: false,
    nextFov: currentFov,
  };
}


