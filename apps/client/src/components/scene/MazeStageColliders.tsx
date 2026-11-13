'use client';

import { MutableRefObject } from 'react';
import { RigidBody, RapierRigidBody } from '@react-three/rapier';
import type { MazeLevelDefinition } from './mazeLevels';
import { ColliderWalls } from './colliders/ColliderWalls';
import { ColliderGoalSensor } from './colliders/ColliderGoalSensor';
import { ColliderHoleSensors } from './colliders/ColliderHoleSensors';
import { useMazeStageColliders } from '@/hooks/useMazeStageColliders';

interface MazeStageCollidersProps {
  levelRevisionKey: string;
  levelData: MazeLevelDefinition;
  outerWalls: Array<{
    position: [number, number, number];
    size: [number, number, number];
  }>;
  runPathRef: MutableRefObject<Array<[number, number]>>;
  runPathP2Ref: MutableRefObject<Array<[number, number]>>;
  lastHoleHitMsRef: MutableRefObject<{ 1: number; 2: number }>;
  isMultiplayer: boolean;
  ballBodyRef: MutableRefObject<RapierRigidBody | null>;
  ball2BodyRef: MutableRefObject<RapierRigidBody | null>;
  onReachGoal: (runPath: Array<[number, number]>, winnerSlot?: 1 | 2) => void;
  onFallIntoHole: (slot: 1 | 2) => void;
  resetSingleBall: (body: RapierRigidBody | null, slot: 1 | 2) => void;
  resetBallAndBoard: () => void;
}

/**
 * 3B Sabit Fizik Çarpıştırıcıları (Rapier Fixed RigidBody):
 * Dış çevre duvarları, iç labirent duvarları, hedef portalı sensörü ve tuzak deliği sensörleri.
 */
export function MazeStageColliders({
  levelRevisionKey,
  levelData,
  outerWalls,
  runPathRef,
  runPathP2Ref,
  lastHoleHitMsRef,
  isMultiplayer,
  ballBodyRef,
  ball2BodyRef,
  onReachGoal,
  onFallIntoHole,
  resetSingleBall,
  resetBallAndBoard,
}: MazeStageCollidersProps) {
  const {
    safeRevisionKey,
    rigidBodyConfig,
    outerWalls: safeOuterWalls,
    innerWalls: safeInnerWalls,
    goalPosition: safeGoalPosition,
    voidHoles: safeVoidHoles,
  } = useMazeStageColliders({
    levelRevisionKey,
    levelData,
    outerWalls,
    isMultiplayer,
  });

  return (
    <RigidBody
      type={rigidBodyConfig.type}
      colliders={rigidBodyConfig.colliders}
      friction={rigidBodyConfig.friction}
      restitution={rigidBodyConfig.restitution}
    >
      <ColliderWalls
        outerWalls={safeOuterWalls}
        innerWalls={safeInnerWalls}
        levelRevisionKey={safeRevisionKey}
      />
      <ColliderGoalSensor
        goalPosition={safeGoalPosition}
        runPathRef={runPathRef}
        runPathP2Ref={runPathP2Ref}
        onReachGoal={onReachGoal}
      />
      <ColliderHoleSensors
        voidHoles={safeVoidHoles}
        levelRevisionKey={safeRevisionKey}
        lastHoleHitMsRef={lastHoleHitMsRef}
        isMultiplayer={isMultiplayer}
        ballBodyRef={ballBodyRef}
        ball2BodyRef={ball2BodyRef}
        onFallIntoHole={onFallIntoHole}
        resetSingleBall={resetSingleBall}
        resetBallAndBoard={resetBallAndBoard}
      />
    </RigidBody>
  );
}
