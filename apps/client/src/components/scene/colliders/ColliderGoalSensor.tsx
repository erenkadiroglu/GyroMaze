'use client';

import { MutableRefObject } from 'react';
import { CylinderCollider } from '@react-three/rapier';
import { resolveSensorSlot, resolveGoalRunPath } from '../../../utils/sceneColliderUtils';

interface ColliderGoalSensorProps {
  goalPosition: [number, number, number];
  runPathRef: MutableRefObject<Array<[number, number]>>;
  runPathP2Ref: MutableRefObject<Array<[number, number]>>;
  onReachGoal: (runPath: Array<[number, number]>, winnerSlot?: 1 | 2) => void;
}

/**
 * 3B Sahne bitiş / hedef portalı fiziksel temas sensörü
 */
export function ColliderGoalSensor({
  goalPosition,
  runPathRef,
  runPathP2Ref,
  onReachGoal,
}: ColliderGoalSensorProps) {
  return (
    <CylinderCollider
      args={[0.4, 0.46]}
      position={goalPosition}
      sensor
      onIntersectionEnter={(payload) => {
        const slot = resolveSensorSlot(payload.other.rigidBodyObject?.name);
        const targetPath = resolveGoalRunPath(slot, runPathRef.current, runPathP2Ref.current);
        onReachGoal(targetPath, slot);
      }}
    />
  );
}

