'use client';

import { type RefObject } from 'react';
import { useFrame } from '@react-three/fiber';
import type * as THREE from 'three';
import { type RapierRigidBody } from '@react-three/rapier';
import {
  useGameStore,
  transientGyro,
  transientGyroP2,
} from '@/store/useGameStore';
import { type MazeLevelDefinition } from '@/components/scene/mazeLevels';
import { canTriggerGoalReach } from '@/utils/sceneCollisions';
import {
  calculateGoalRingRotation,
  updateTransientTelemetry,
  updateBallActorTransform,
  updateCrystalsAnimation,
  updateLaserBeamsVisibility,
  updateMovingObstaclesTransform,
} from '@/utils/sceneActorUtils';
import {
  _targetEuler,
  _targetQuat,
  _currentQuat,
  _currentEuler,
  BALL_RADIUS,
} from '@/components/scene/sceneMaterials';
import { calculateSlerpAlpha } from '@/utils/sceneColliderUtils';
import {
  calculateClampedTiltAngles,
  calculateBallLinvelStep,
} from '@/utils/sceneTiltUtils';
import {
  resolveIsInteractive,
  stepHazardElapsed,
  resolveP2BallVisibility,
} from '@/utils/stageLoopUtils';

interface UseMazeStageFrameLoopParams {
  levelData: MazeLevelDefinition;
  isGoalUnlocked: boolean;
  isMultiplayer: boolean;
  ghostPath?: Array<[number, number]>;
  onReachGoal: (runPath: Array<[number, number]>, winnerSlot?: 1 | 2) => void;
  // Refler
  ballBodyRef: RefObject<RapierRigidBody | null>;
  ball2BodyRef: RefObject<RapierRigidBody | null>;
  visualTiltGroupRef: RefObject<THREE.Group | null>;
  visualBallMeshRef: RefObject<THREE.Mesh | null>;
  visualBall2MeshRef: RefObject<THREE.Mesh | null>;
  ghostBallMeshRef: RefObject<THREE.Mesh | null>;
  goalRingRef: RefObject<THREE.Mesh | null>;
  crystalMeshesRef: RefObject<Array<THREE.Mesh | null>>;
  laserBeamMeshesRef: RefObject<Array<THREE.Mesh | null>>;
  movingObstacleMeshesRef: RefObject<Array<THREE.Mesh | null>>;
  hazardElapsedRef: RefObject<number>;
  runPathRef: RefObject<Array<[number, number]>>;
  runPathP2Ref: RefObject<Array<[number, number]>>;
  // Etkileşim ve Oynatma Fonksiyonları
  stepGhostReplay: (
    delta: number,
    isRecording: boolean,
    p1Translation: { x: number; y: number; z: number },
    p2Translation: { x: number; y: number; z: number } | null,
    ghostPath: Array<[number, number]> | undefined,
    showGhost: boolean,
    ghostMesh: THREE.Mesh | null,
  ) => void;
  stepMotionTrail: (
    pos: { x: number; y: number; z: number },
    enabled: boolean,
  ) => void;
  processBallInteractions: (
    ballBody: RapierRigidBody,
    pos: { x: number; y: number; z: number },
    slot: 1 | 2,
    hazardElapsed: number,
    isInteractive: boolean,
  ) => void;
}

/**
 * 3B Sahne ana `useFrame` animasyon, fizik adımı ve etkileşim döngüsü kancası.
 */
export function useMazeStageFrameLoop({
  levelData,
  isGoalUnlocked,
  isMultiplayer,
  ghostPath,
  onReachGoal,
  ballBodyRef,
  ball2BodyRef,
  visualTiltGroupRef,
  visualBallMeshRef,
  visualBall2MeshRef,
  ghostBallMeshRef,
  goalRingRef,
  crystalMeshesRef,
  laserBeamMeshesRef,
  movingObstacleMeshesRef,
  hazardElapsedRef,
  runPathRef,
  runPathP2Ref,
  stepGhostReplay,
  stepMotionTrail,
  processBallInteractions,
}: UseMazeStageFrameLoopParams) {
  const gameStatus = useGameStore((s) => s.gameStatus);
  const isPairingModalOpen = useGameStore((s) => s.isPairingModalOpen);
  const isSettingsOpen = useGameStore((s) => s.isSettingsOpen);
  const isEditorOpen = useGameStore((s) => s.isEditorOpen);
  const isLeaderboardOpen = useGameStore((s) => s.isLeaderboardOpen);
  const gravityScale = useGameStore((s) => s.gravityScale);
  const tiltResponsiveness = useGameStore((s) => s.tiltResponsiveness);
  const showTrail = useGameStore((s) => s.showTrail);
  const showGhost = useGameStore((s) => s.showGhost);

  useFrame((state, delta) => {
    const safeDelta = Math.min(delta, 0.05);
    const elapsed = state.clock.elapsedTime;

    if (goalRingRef.current) {
      goalRingRef.current.rotation.z = calculateGoalRingRotation(
        goalRingRef.current.rotation.z,
        isGoalUnlocked,
        safeDelta,
      );
    }

    // Kristallerin havada süzülme ve dönme animasyonu
    updateCrystalsAnimation(
      crystalMeshesRef.current,
      levelData.crystals.length,
      elapsed,
      safeDelta,
    );

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

    hazardElapsedRef.current = stepHazardElapsed(
      hazardElapsedRef.current,
      safeDelta,
      isInteractive,
    );
    const hazardElapsed = hazardElapsedRef.current;

    // Lazer ışınlarının görünürlüğünü duraklatma duyarlı saatle güncelle
    updateLaserBeamsVisibility(
      laserBeamMeshesRef.current,
      levelData.laserGates,
      hazardElapsed,
    );

    // Hareketli devriye engellerinin görsel konumunu güncelle
    updateMovingObstaclesTransform(
      movingObstacleMeshesRef.current,
      levelData.movingObstacles ?? [],
      hazardElapsed,
      isInteractive,
      safeDelta,
    );

    const { pitchRad, rollRad } = calculateClampedTiltAngles(
      transientGyro.beta,
      transientGyro.gamma,
      isInteractive,
    );

    _targetEuler.set(pitchRad, 0, rollRad, 'XYZ');
    _targetQuat.setFromEuler(_targetEuler);

    // Tepkisellik katsayısı (tiltResponsiveness) ile anında eğim tepkisi
    const slerpAlpha = calculateSlerpAlpha(tiltResponsiveness, safeDelta);
    _currentQuat.slerp(_targetQuat, slerpAlpha);
    _currentEuler.setFromQuaternion(_currentQuat, 'XYZ');

    if (visualTiltGroupRef.current) {
      visualTiltGroupRef.current.quaternion.copy(_currentQuat);
    }

    // 1. Oyuncu Fizik Küresi ve Etkileşim Adımı
    if (ballBodyRef.current) {
      const nextVel = calculateBallLinvelStep(
        ballBodyRef.current.linvel(),
        { x: _currentEuler.x, z: _currentEuler.z },
        gravityScale,
        safeDelta,
        isInteractive,
      );
      ballBodyRef.current.setLinvel(nextVel, true);

      const pos = ballBodyRef.current.translation();
      const vel = ballBodyRef.current.linvel();
      updateTransientTelemetry(transientGyro, pos, vel);
      updateBallActorTransform(
        visualBallMeshRef.current,
        pos,
        vel,
        BALL_RADIUS,
        safeDelta,
      );

      // 10Hz Hayalet Yarışçı (Ghost Replay) Canlı Oynatımı ve Yol Kaydı
      const pos2 =
        isMultiplayer && ball2BodyRef.current
          ? ball2BodyRef.current.translation()
          : null;

      stepGhostReplay(
        safeDelta,
        isInteractive && gameStatus === 'playing',
        pos,
        pos2,
        ghostPath,
        showGhost,
        ghostBallMeshRef.current,
      );

      // Neon Hareket İzi (Motion Trail) halkalarını güncelle
      stepMotionTrail(pos, showTrail);

      // 1. Oyuncu kristal, rampa, portal, lazer ve hareketli engel etkileşimleri
      processBallInteractions(
        ballBodyRef.current,
        pos,
        1,
        hazardElapsed,
        isInteractive,
      );

      if (canTriggerGoalReach(isInteractive, isGoalUnlocked, pos, levelData.goalPosition)) {
        onReachGoal(runPathRef.current, 1);
      }

      // Çok Oyunculu (2. Oyuncu - Altın Bilye) Fizik ve Etkileşim Paritesi
      if (resolveP2BallVisibility(isMultiplayer, Boolean(ball2BodyRef.current))) {
        const ball2Body = ball2BodyRef.current!;
        const p2Angles = calculateClampedTiltAngles(
          transientGyroP2.beta,
          transientGyroP2.gamma,
          isInteractive,
        );

        const nextV2 = calculateBallLinvelStep(
          ball2Body.linvel(),
          { x: p2Angles.pitchRad, z: p2Angles.rollRad },
          gravityScale,
          safeDelta,
          isInteractive,
        );
        ball2Body.setLinvel(nextV2, true);

        const pos2Val = ball2Body.translation();
        const vel2 = ball2Body.linvel();
        updateTransientTelemetry(transientGyroP2, pos2Val, vel2);
        updateBallActorTransform(
          visualBall2MeshRef.current,
          pos2Val,
          vel2,
          BALL_RADIUS,
          safeDelta,
          true,
        );

        // 2. Oyuncu için tüm kristal, rampa, portal, lazer ve hareketli engel kontrolleri
        processBallInteractions(
          ball2Body,
          pos2Val,
          2,
          hazardElapsed,
          isInteractive,
        );

        // 2. Oyuncu ile 1. Oyuncu için birebir simetrik hedef portalı
        if (canTriggerGoalReach(isInteractive, isGoalUnlocked, pos2Val, levelData.goalPosition)) {
          onReachGoal(runPathP2Ref.current, 2);
        }
      } else if (visualBall2MeshRef.current) {
        visualBall2MeshRef.current.visible = false;
      }
    }
  });
}
