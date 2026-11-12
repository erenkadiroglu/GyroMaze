'use client';

import { MutableRefObject } from 'react';
import {
  RigidBody,
  CuboidCollider,
  CylinderCollider,
  RapierRigidBody,
} from '@react-three/rapier';
import { useGameStore } from '@/store/useGameStore';
import type { MazeLevelDefinition } from './mazeLevels';
import {
  calculateCuboidHalfExtents,
  calculateHoleSensorRadius,
  resolveSensorSlot,
  shouldTriggerHoleFall,
} from '../../utils/sceneColliderUtils.ts';

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
      {/* Çevreleyen Dış Duvar Çarpıştırıcıları */}
      {outerWalls.map((wall, idx) => (
        <CuboidCollider
          key={`phys-outer-${idx}`}
          args={calculateCuboidHalfExtents(wall.size)}
          position={wall.position}
        />
      ))}

      {/* İç Labirent Duvar Çarpıştırıcıları */}
      {levelData.innerWalls.map((wall, idx) => (
        <CuboidCollider
          key={`phys-inner-${levelRevisionKey}-${idx}`}
          args={calculateCuboidHalfExtents(wall.size)}
          position={wall.position}
        />
      ))}

      {/* Hedef Portalı Sensörü */}
      <CylinderCollider
        args={[0.4, 0.46]}
        position={levelData.goalPosition}
        sensor
        onIntersectionEnter={(payload) => {
          const slot = resolveSensorSlot(payload.other.rigidBodyObject?.name);
          onReachGoal(
            slot === 2 ? runPathP2Ref.current : runPathRef.current,
            slot,
          );
        }}
      />

      {/* Tuzak Delikleri (Void Holes) Sensörleri */}
      {levelData.voidHoles.map((hole, idx) => (
        <CylinderCollider
          key={`phys-hole-${levelRevisionKey}-${idx}`}
          args={[0.4, calculateHoleSensorRadius(hole.radius)]}
          position={[hole.position[0], 0.25, hole.position[1]]}
          sensor
          onIntersectionEnter={(payload) => {
            const state = useGameStore.getState();
            const isPageHidden =
              typeof document !== 'undefined' && document.hidden;
            const isAnyModalOpen =
              state.isPairingModalOpen ||
              state.isSettingsOpen ||
              state.isEditorOpen ||
              state.isLeaderboardOpen;

            const slot = resolveSensorSlot(payload.other.rigidBodyObject?.name);
            const nowMs = performance.now();

            if (
              !shouldTriggerHoleFall(
                state.gameStatus,
                isPageHidden,
                isAnyModalOpen,
                nowMs,
                lastHoleHitMsRef.current[slot],
              )
            ) {
              return;
            }

            lastHoleHitMsRef.current[slot] = nowMs;
            onFallIntoHole(slot);

            if (isMultiplayer) {
              resetSingleBall(
                slot === 2 ? ball2BodyRef.current : ballBodyRef.current,
                slot,
              );
            } else {
              resetBallAndBoard();
            }
          }}
        />
      ))}
    </RigidBody>
  );
}

