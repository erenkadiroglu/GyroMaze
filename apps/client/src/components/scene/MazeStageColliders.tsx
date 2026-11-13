'use client';

import { MutableRefObject } from 'react';
import { RigidBody, RapierRigidBody } from '@react-three/rapier';
import type { MazeLevelDefinition } from './mazeLevels';
import { ColliderWalls } from './colliders/ColliderWalls';
import { ColliderGoalSensor } from './colliders/ColliderGoalSensor';
import { ColliderHoleSensors } from './colliders/ColliderHoleSensors';

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
  return (
    <RigidBody type="fixed" colliders={false} friction={0.12} restitution={0.18}>
      <ColliderWalls
        outerWalls={outerWalls}
        innerWalls={levelData.innerWalls}
        levelRevisionKey={levelRevisionKey}
      />
      <ColliderGoalSensor
        goalPosition={levelData.goalPosition}
        runPathRef={runPathRef}
        runPathP2Ref={runPathP2Ref}
        onReachGoal={onReachGoal}
      />
      <ColliderHoleSensors
        voidHoles={levelData.voidHoles}
        levelRevisionKey={levelRevisionKey}
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
