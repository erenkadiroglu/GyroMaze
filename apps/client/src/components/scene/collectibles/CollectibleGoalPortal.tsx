'use client';

import { MutableRefObject } from 'react';
import * as THREE from 'three';
import { resolveGoalPortalVisuals } from '../../../utils/collectiblesUtils';

interface CollectibleGoalPortalProps {
  goalPosition: [number, number, number];
  isGoalUnlocked: boolean;
  goalRingRef: MutableRefObject<THREE.Mesh | null>;
}

/**
 * 3B Sahne hedef portalı (halka, çekirdek ve dinamik ışık)
 */
export function CollectibleGoalPortal({
  goalPosition,
  isGoalUnlocked,
  goalRingRef,
}: CollectibleGoalPortalProps) {
  const visuals = resolveGoalPortalVisuals(isGoalUnlocked);

  return (
    <group position={goalPosition}>
      <mesh
        ref={goalRingRef}
        position={[0, -0.32, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        material={visuals.ringMaterial}
      >
        <ringGeometry args={[0.35, 0.68, 6]} />
      </mesh>
      <mesh
        position={[0, -0.33, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        material={visuals.coreMaterial}
      >
        <circleGeometry args={[0.35, 24]} />
      </mesh>
      <pointLight
        color={visuals.lightColor}
        intensity={visuals.lightIntensity}
        distance={visuals.lightDistance}
        position={[0, 0.5, 0]}
      />
    </group>
  );
}

