'use client';

import { useCallback, useEffect } from 'react';
import type { RapierRigidBody } from '@react-three/rapier';
import type * as THREE from 'three';
import {
  transientGyro,
  transientGyroP2,
} from '@/store/useGameStore';
import { BALL_RADIUS, _currentQuat } from '@/components/scene/sceneMaterials';
import { calculateBallSpawnPosition } from '@/utils/sceneActorUtils';

export interface UseMazeStageResetOptions {
  startPosition: [number, number, number];
  p2SpawnOffsetX: number;
  p2SpawnOffsetZ: number;
  resetCount: number;
  levelRevisionKey: string;
  ballBodyRef: React.RefObject<RapierRigidBody | null>;
  ball2BodyRef: React.RefObject<RapierRigidBody | null>;
  visualTiltGroupRef: React.RefObject<THREE.Group | null>;
  hazardElapsedRef: React.MutableRefObject<number>;
  resetInteractionCooldowns: (slot: 1 | 2) => void;
  resetMotionTrail: (startPos: [number, number, number]) => void;
  resetRunPaths: () => void;
}

/**
 * 3B Sahne ve Bilye Sıfırlama Kancası.
 * 1. ve 2. oyuncu bilye konumlarını, doğrusal ve açısal hızlarını, tabla yönelimini,
 * tehlike saatini ve hareket izlerini sıfırlar; bölüm geçişlerinde ve buton tıklamalarında otomatik tetikler.
 */
export function useMazeStageReset({
  startPosition,
  p2SpawnOffsetX,
  p2SpawnOffsetZ,
  resetCount,
  levelRevisionKey,
  ballBodyRef,
  ball2BodyRef,
  visualTiltGroupRef,
  hazardElapsedRef,
  resetInteractionCooldowns,
  resetMotionTrail,
  resetRunPaths,
}: UseMazeStageResetOptions) {
  const resetSingleBall = useCallback(
    (body: RapierRigidBody | null, slot: 1 | 2) => {
      const [spawnX, spawnY, spawnZ] = calculateBallSpawnPosition(
        startPosition,
        slot,
        p2SpawnOffsetX,
        p2SpawnOffsetZ,
        BALL_RADIUS,
      );

      resetInteractionCooldowns(slot);

      if (slot === 2) {
        transientGyroP2.ballX = spawnX;
        transientGyroP2.ballZ = spawnZ;
        transientGyroP2.ballSpeed = 0;
      } else {
        transientGyro.ballX = spawnX;
        transientGyro.ballZ = spawnZ;
        transientGyro.ballSpeed = 0;
      }

      if (!body) return;
      body.setTranslation({ x: spawnX, y: spawnY, z: spawnZ }, true);
      body.setLinvel({ x: 0, y: 0, z: 0 }, true);
      body.setAngvel({ x: 0, y: 0, z: 0 }, true);
      if (slot === 1) {
        resetMotionTrail([startPosition[0], 0, startPosition[2]]);
      }
    },
    [
      startPosition,
      p2SpawnOffsetX,
      p2SpawnOffsetZ,
      resetInteractionCooldowns,
      resetMotionTrail,
    ],
  );

  const resetBallAndBoard = useCallback(() => {
    _currentQuat.identity();
    if (visualTiltGroupRef.current) {
      visualTiltGroupRef.current.quaternion.identity();
    }
    resetRunPaths();
    hazardElapsedRef.current = 0;
    resetSingleBall(ballBodyRef.current, 1);
    resetSingleBall(ball2BodyRef.current, 2);
  }, [
    ballBodyRef,
    ball2BodyRef,
    visualTiltGroupRef,
    hazardElapsedRef,
    resetRunPaths,
    resetSingleBall,
  ]);

  useEffect(() => {
    resetBallAndBoard();
  }, [resetCount, levelRevisionKey, resetBallAndBoard]);

  return {
    resetSingleBall,
    resetBallAndBoard,
  };
}
