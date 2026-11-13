'use client';

import { MutableRefObject } from 'react';
import * as THREE from 'three';
import type { MovingObstacleDefinition } from '../mazeLevels';
import { _movingObstacleMaterial } from '../sceneMaterials';

interface HazardMovingObstaclesProps {
  movingObstacles?: MovingObstacleDefinition[];
  levelRevisionKey: string;
  movingObstacleMeshesRef: MutableRefObject<Array<THREE.Mesh | null>>;
}

/**
 * 3B Sahne kinetik hareketli devriye engelleri
 */
export function HazardMovingObstacles({
  movingObstacles,
  levelRevisionKey,
  movingObstacleMeshesRef,
}: HazardMovingObstaclesProps) {
  return (
    <>
      {(movingObstacles ?? []).map((obs, idx) => (
        <mesh
          key={`moving-obs-${levelRevisionKey}-${idx}`}
          ref={(el) => {
            movingObstacleMeshesRef.current[idx] = el;
          }}
          position={[obs.center[0], 0.36, obs.center[1]]}
          material={_movingObstacleMaterial}
          castShadow
        >
          <cylinderGeometry args={[0.36, 0.38, 0.72, 16]} />
        </mesh>
      ))}
    </>
  );
}

