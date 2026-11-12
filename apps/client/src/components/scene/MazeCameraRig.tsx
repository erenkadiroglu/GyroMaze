'use client';

import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore, transientGyro } from '@/store/useGameStore';
import {
  calculateCameraLerpAlpha,
  calculateDynamicFov,
  calculateCameraTargetTransform,
} from '@/utils/sceneCameraUtils';
import {
  _cameraTargetPos,
  _cameraLookAt,
  MAX_TILT_RADIANS,
} from './sceneMaterials';

/**
 * 3B Sahne Bağımsız Dinamik Kamera Teçhizatı (Rig).
 * Canvas seviyesinde bağımsız çalışır.
 * Seçili kamera moduna (izometrik, takip, kuş bakışı) göre kamera konumunu pürüzsüzce takip ettirir,
 * bilye hızına duyarlı dinamik FOV uygular ve kare hızından bağımsız sönümleme sağlar.
 */
export function MazeCameraRig() {
  const cameraMode = useGameStore((s) => s.cameraMode);
  const gameStatus = useGameStore((s) => s.gameStatus);
  const isPairingModalOpen = useGameStore((s) => s.isPairingModalOpen);
  const isSettingsOpen = useGameStore((s) => s.isSettingsOpen);
  const isEditorOpen = useGameStore((s) => s.isEditorOpen);
  const isLeaderboardOpen = useGameStore((s) => s.isLeaderboardOpen);

  useFrame((state, delta) => {
    const isPageHidden = typeof document !== 'undefined' && document.hidden;
    const isInteractive =
      gameStatus === 'playing' &&
      !isPageHidden &&
      !isPairingModalOpen &&
      !isSettingsOpen &&
      !isEditorOpen &&
      !isLeaderboardOpen;

    const safeDelta = Math.min(delta, 0.05);

    const rawPitchRad = isInteractive
      ? THREE.MathUtils.degToRad(transientGyro.beta)
      : 0;
    const rawRollRad = isInteractive
      ? -THREE.MathUtils.degToRad(transientGyro.gamma)
      : 0;

    const clampedPitch = THREE.MathUtils.clamp(
      rawPitchRad,
      -MAX_TILT_RADIANS,
      MAX_TILT_RADIANS,
    );
    const clampedRoll = THREE.MathUtils.clamp(
      rawRollRad,
      -MAX_TILT_RADIANS,
      MAX_TILT_RADIANS,
    );

    const ballPos = { x: transientGyro.ballX, z: transientGyro.ballZ };
    const { targetPos, lookAt } = calculateCameraTargetTransform(
      cameraMode,
      ballPos,
      clampedRoll,
      clampedPitch,
    );

    _cameraTargetPos.set(...targetPos);
    _cameraLookAt.set(...lookAt);

    const lerpAlpha = calculateCameraLerpAlpha(10, safeDelta);
    state.camera.position.lerp(_cameraTargetPos, lerpAlpha);
    state.camera.lookAt(_cameraLookAt);

    // Dinamik FOV: Bilye hızlandığında (özellikle rampa fırlatmasında) sinematik hız hissi
    if (state.camera instanceof THREE.PerspectiveCamera) {
      const targetFov = calculateDynamicFov(transientGyro.ballSpeed);
      if (Math.abs(state.camera.fov - targetFov) > 0.04) {
        state.camera.fov += (targetFov - state.camera.fov) * lerpAlpha;
        state.camera.updateProjectionMatrix();
      }
    }
  });

  return null;
}
