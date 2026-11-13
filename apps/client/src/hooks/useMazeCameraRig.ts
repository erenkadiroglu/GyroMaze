'use client';

import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore, transientGyro } from '@/store/useGameStore';
import {
  evaluateCameraRigStep,
  applyCameraRigTransform,
  isAnyCameraRigModalOpen,
} from '@/utils/mazeCameraRigUtils';
import {
  _cameraTargetPos,
  _cameraLookAt,
} from '@/components/scene/sceneMaterials';

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
    const isAnyModalOpen = isAnyCameraRigModalOpen({
      isPairingModalOpen,
      isSettingsOpen,
      isEditorOpen,
      isLeaderboardOpen,
    });

    const isPerspective = state.camera instanceof THREE.PerspectiveCamera;
    const currentFov = isPerspective
      ? (state.camera as THREE.PerspectiveCamera).fov
      : undefined;

    const stepResult = evaluateCameraRigStep({
      cameraMode,
      gameStatus,
      isPageHidden,
      isAnyModalOpen,
      delta,
      gyroBeta: transientGyro.beta,
      gyroGamma: transientGyro.gamma,
      ballX: transientGyro.ballX,
      ballZ: transientGyro.ballZ,
      ballSpeed: transientGyro.ballSpeed,
      currentFov,
      isPerspective,
    });

    applyCameraRigTransform(
      state.camera,
      stepResult,
      _cameraTargetPos,
      _cameraLookAt,
    );
  });
}
