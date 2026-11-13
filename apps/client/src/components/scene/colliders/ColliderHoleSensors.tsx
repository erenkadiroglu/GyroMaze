'use client';

import { MutableRefObject } from 'react';
import { CylinderCollider, RapierRigidBody } from '@react-three/rapier';
import { useGameStore } from '@/store/useGameStore';
import type { VoidHoleDefinition } from '../mazeLevels';
import {
  calculateHoleSensorRadius,
  resolveSensorSlot,
  shouldTriggerHoleFall,
  isAnyOverlayModalOpen,
  resolveTargetBallBody,
} from '../../../utils/sceneColliderUtils';

interface ColliderHoleSensorsProps {
  voidHoles: VoidHoleDefinition[];
  levelRevisionKey: string;
  lastHoleHitMsRef: MutableRefObject<{ 1: number; 2: number }>;
  isMultiplayer: boolean;
  ballBodyRef: MutableRefObject<RapierRigidBody | null>;
  ball2BodyRef: MutableRefObject<RapierRigidBody | null>;
  onFallIntoHole: (slot: 1 | 2) => void;
  resetSingleBall: (body: RapierRigidBody | null, slot: 1 | 2) => void;
  resetBallAndBoard: () => void;
}

/**
 * 3B Sahne tuzak delikleri düşme tetikleyici sensörleri
 */
export function ColliderHoleSensors({
  voidHoles,
  levelRevisionKey,
  lastHoleHitMsRef,
  isMultiplayer,
  ballBodyRef,
  ball2BodyRef,
  onFallIntoHole,
  resetSingleBall,
  resetBallAndBoard,
}: ColliderHoleSensorsProps) {
  return (
    <>
      {voidHoles.map((hole, idx) => (
        <CylinderCollider
          key={`phys-hole-${levelRevisionKey}-${idx}`}
          args={[0.4, calculateHoleSensorRadius(hole.radius)]}
          position={[hole.position[0], 0.25, hole.position[1]]}
          sensor
          onIntersectionEnter={(payload) => {
            const state = useGameStore.getState();
            const isPageHidden =
              typeof document !== 'undefined' && document.hidden;
            const isAnyModalOpen = isAnyOverlayModalOpen(state);

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
              const targetBall = resolveTargetBallBody(
                slot,
                ballBodyRef.current,
                ball2BodyRef.current,
              );
              resetSingleBall(targetBall, slot);
            } else {
              resetBallAndBoard();
            }
          }}
        />
      ))}
    </>
  );
}

