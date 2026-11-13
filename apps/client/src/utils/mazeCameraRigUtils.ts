import type * as THREE from 'three';
import type { CameraMode, GameStatus } from '@gyromaze/shared';
import {
  calculateCameraLerpAlpha,
  calculateDynamicFov,
  calculateCameraTargetTransform,
  calculateCameraClampedTilt,
  calculateNextCameraFov,
} from './sceneCameraUtils.ts';
import { resolveIsInteractive } from './stageLoopUtils.ts';

export const CAMERA_MAX_SAFE_DELTA = 0.05;
export const CAMERA_LERP_SPEED = 10;
export const DEFAULT_MAX_TILT_RADIANS = (14 * Math.PI) / 180;

export interface CameraRigModalState {
  isPairingModalOpen: boolean;
  isSettingsOpen: boolean;
  isEditorOpen: boolean;
  isLeaderboardOpen: boolean;
}

export interface CameraRigStepParams {
  cameraMode: CameraMode;
  gameStatus: GameStatus;
  isPageHidden: boolean;
  isAnyModalOpen: boolean;
  delta: number;
  gyroBeta: number;
  gyroGamma: number;
  ballX: number;
  ballZ: number;
  ballSpeed: number;
  currentFov?: number;
  isPerspective?: boolean;
  maxTiltRadians?: number;
  lerpSpeed?: number;
}

export interface CameraRigStepResult {
  isInteractive: boolean;
  safeDelta: number;
  lerpAlpha: number;
  targetPos: [number, number, number];
  lookAt: [number, number, number];
  fovUpdate: { shouldUpdate: boolean; nextFov: number } | null;
}

/**
 * Kamera rig hareketini durduracak herhangi bir arayüz modalının açık olup olmadığını denetler.
 */
export function isAnyCameraRigModalOpen({
  isPairingModalOpen,
  isSettingsOpen,
  isEditorOpen,
  isLeaderboardOpen,
}: CameraRigModalState): boolean {
  return (
    isPairingModalOpen ||
    isSettingsOpen ||
    isEditorOpen ||
    isLeaderboardOpen
  );
}

/**
 * Sekme arka plandan döndüğünde veya kare atlamalarında kamera fırlamasını önlemek
 * için kare zaman farkını güvenli üst sınıra kenetler.
 */
export function clampCameraFrameDelta(
  delta: number,
  maxSafeDelta: number = CAMERA_MAX_SAFE_DELTA,
): number {
  if (typeof delta !== 'number' || !Number.isFinite(delta) || delta < 0) {
    return 0;
  }
  return Math.min(delta, maxSafeDelta);
}

/**
 * 3B kamera rig adımını hesaplar: interaktiflik, eğim kenetleme, hedef pozisyon/lookAt,
 * lerp sönümleme katsayısı ve dinamik FOV güncellemesi.
 */
export function evaluateCameraRigStep({
  cameraMode,
  gameStatus,
  isPageHidden,
  isAnyModalOpen,
  delta,
  gyroBeta,
  gyroGamma,
  ballX,
  ballZ,
  ballSpeed,
  currentFov,
  isPerspective = true,
  maxTiltRadians = DEFAULT_MAX_TILT_RADIANS,
  lerpSpeed = CAMERA_LERP_SPEED,
}: CameraRigStepParams): CameraRigStepResult {
  const isInteractive = resolveIsInteractive(
    gameStatus,
    isPageHidden,
    isAnyModalOpen,
  );

  const safeDelta = clampCameraFrameDelta(delta);

  const { clampedPitch, clampedRoll } = calculateCameraClampedTilt(
    gyroBeta,
    gyroGamma,
    isInteractive,
    maxTiltRadians,
  );

  const ballPos = { x: ballX, z: ballZ };
  const { targetPos, lookAt } = calculateCameraTargetTransform(
    cameraMode,
    ballPos,
    clampedRoll,
    clampedPitch,
  );

  const lerpAlpha = calculateCameraLerpAlpha(lerpSpeed, safeDelta);

  let fovUpdate: { shouldUpdate: boolean; nextFov: number } | null = null;
  if (isPerspective && typeof currentFov === 'number') {
    const targetFov = calculateDynamicFov(ballSpeed);
    fovUpdate = calculateNextCameraFov(currentFov, targetFov, lerpAlpha);
  }

  return {
    isInteractive,
    safeDelta,
    lerpAlpha,
    targetPos,
    lookAt,
    fovUpdate,
  };
}

/**
 * Hesaplanan kamera hedeflerini Three.js kamerasına uygular.
 */
export function applyCameraRigTransform(
  camera: THREE.Camera | null | undefined,
  stepResult: CameraRigStepResult,
  targetPosVec?: { set: (x: number, y: number, z: number) => unknown },
  lookAtVec?: { set: (x: number, y: number, z: number) => unknown },
): void {
  if (!camera) return;

  if (targetPosVec && typeof targetPosVec.set === 'function') {
    targetPosVec.set(...stepResult.targetPos);
    camera.position.lerp(targetPosVec as unknown as THREE.Vector3, stepResult.lerpAlpha);
  } else {
    camera.position.set(...stepResult.targetPos);
  }

  if (lookAtVec && typeof lookAtVec.set === 'function') {
    lookAtVec.set(...stepResult.lookAt);
    camera.lookAt(lookAtVec as unknown as THREE.Vector3);
  } else {
    camera.lookAt(...stepResult.lookAt);
  }

  if (
    stepResult.fovUpdate?.shouldUpdate &&
    'fov' in camera &&
    typeof (camera as THREE.PerspectiveCamera).updateProjectionMatrix === 'function'
  ) {
    const perspCamera = camera as THREE.PerspectiveCamera;
    perspCamera.fov = stepResult.fovUpdate.nextFov;
    perspCamera.updateProjectionMatrix();
  }
}

