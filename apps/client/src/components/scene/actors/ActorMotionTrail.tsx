'use client';

import { MutableRefObject } from 'react';
import type * as THREE from 'three';
import { BALL_RADIUS, TRAIL_COUNT, _trailMaterial } from '../sceneMaterials';
import { resolveTrailInitialTransform } from '../../../utils/sceneActorUtils';

interface ActorMotionTrailProps {
  startPosition: [number, number, number];
  trailMeshesRef: MutableRefObject<Array<THREE.Mesh | null>>;
}

/**
 * 3B Sahne bilye neon hareket izi (Motion Trail) halkaları
 */
export function ActorMotionTrail({
  startPosition,
  trailMeshesRef,
}: ActorMotionTrailProps) {
  const { position, rotation } = resolveTrailInitialTransform(startPosition);

  return (
    <>
      {Array.from({ length: TRAIL_COUNT }).map((_, idx) => (
        <mesh
          key={`trail-${idx}`}
          ref={(el) => {
            trailMeshesRef.current[idx] = el;
          }}
          position={position}
          rotation={rotation}
          material={_trailMaterial}
        >
          <circleGeometry args={[BALL_RADIUS * 0.68, 16]} />
        </mesh>
      ))}
    </>
  );
}
