'use client';

import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore, transientGyro } from '@/store/useGameStore';
import {
  calculateCameraLerpAlpha,
  calculateDynamicFov,
  calculateCameraTargetTransform,
  calculateCameraClampedTilt,
  calculateNextCameraFov,
} from '@/utils/sceneCameraUtils';
import {
  _cameraTargetPos,
  _cameraLookAt,
  MAX_TILT_RADIANS,
} from '@/components/scene/sceneMaterials';
import { resolveIsInteractive } from '@/utils/stageLoopUtils';

/**
 * 3B Sahne bağımsız kamera teçhizatı (rig) kancası.
 * Kamera konumunu yumuşatarak takip ettirir ve hıza duyarlı dinamik FOV uygular.
 */
export function useMazeCameraRig() {
  const cameraMode = useGameStore((s) => s.cameraMode);
  const gameStatus = useGameStore((s) => s.gameStatus);
  const isPairingModalOpen = useGameStore((s) => s.isPairingModalOpen);
  const isSettingsOpen = useGameStore((s) => s.isSettingsOpen);
  const isEditorOpen = useGameStore((s) => s.isEditorOpen);
  const isLeaderboardOpen = useGameStore((s) => s.isLeaderboardOpen);

  useFrame((state, delta) => {
    const isPageHidden = typeof document !== 'undefined' && document.hidden;
    const isAnyModalOpen =
      isPairingModalOpen ||
      isSettingsOpen ||
      isEditorOpen ||
      isLeaderboardOpen;
    const isInteractive = resolveIsInteractive(
      gameStatus,
      isPageHidden,
      isAnyModalOpen,
    );

    const safeDelta = Math.min(delta, 0.05);

    const { clampedPitch, clampedRoll } = calculateCameraClampedTilt(
      transientGyro.beta,
      transientGyro.gamma,
      isInteractive,
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
      const { shouldUpdate, nextFov } = calculateNextCameraFov(
        state.camera.fov,
        targetFov,
        lerpAlpha,
      );
      if (shouldUpdate) {
        state.camera.fov = nextFov;
        state.camera.updateProjectionMatrix();
      }
    }
  });
}

