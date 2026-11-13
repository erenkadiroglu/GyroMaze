'use client';

import { MutableRefObject } from 'react';
import type * as THREE from 'three';
import { BALL_RADIUS, _ghostBallMaterial } from '../sceneMaterials';

interface ActorGhostBallProps {
  startPosition: [number, number, number];
  ghostBallMeshRef: MutableRefObject<THREE.Mesh | null>;
}

/**
 * 3B Sahne hayalet yarışçı küresi (Kendi en iyi rekorunun canlı hologramı)
 */
export function ActorGhostBall({
  startPosition,
  ghostBallMeshRef,
}: ActorGhostBallProps) {
  return (
    <mesh
      ref={ghostBallMeshRef}
      visible={false}
      position={[startPosition[0], BALL_RADIUS, startPosition[2]]}
      material={_ghostBallMaterial}
    >
      <sphereGeometry args={[BALL_RADIUS * 0.92, 20, 20]} />
    </mesh>
  );
}

