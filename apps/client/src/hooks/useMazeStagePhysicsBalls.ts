'use client';

import { useMemo } from 'react';
import {
  resolvePhysicsBallsOrchestrationBundle,
  createSafeBallCollisionHandler,
  type PhysicsBallsOrchestrationBundle,
} from '@/utils/mazeStagePhysicsBallsOrchestrationUtils';

export interface UseMazeStagePhysicsBallsProps {
  startPosition: [number, number, number];
  p2SpawnOffsetX: number;
  p2SpawnOffsetZ: number;
  isMultiplayer: boolean;
  onBallCollision: (slot: 1 | 2) => void;
}

export interface UseMazeStagePhysicsBallsReturn
  extends PhysicsBallsOrchestrationBundle {
  handleP1Collision: () => void;
  handleP2Collision: () => void;
}

/**
 * 3B Labirent sahnesi 1P ve 2P dinamik fizik küreleri için orkestrasyon kancası.
 */
export function useMazeStagePhysicsBalls({
  startPosition,
  p2SpawnOffsetX,
  p2SpawnOffsetZ,
  isMultiplayer,
  onBallCollision,
}: UseMazeStagePhysicsBallsProps): UseMazeStagePhysicsBallsReturn {
  const bundle = useMemo<PhysicsBallsOrchestrationBundle>(() => {
    return resolvePhysicsBallsOrchestrationBundle({
      startPosition,
      p2SpawnOffsetX,
      p2SpawnOffsetZ,
      isMultiplayer,
    });
  }, [startPosition, p2SpawnOffsetX, p2SpawnOffsetZ, isMultiplayer]);

  const handleP1Collision = useMemo(
    () => createSafeBallCollisionHandler(1, onBallCollision),
    [onBallCollision],
  );

  const handleP2Collision = useMemo(
    () => createSafeBallCollisionHandler(2, onBallCollision),
    [onBallCollision],
  );

  return {
    ...bundle,
    handleP1Collision,
    handleP2Collision,
  };
}
