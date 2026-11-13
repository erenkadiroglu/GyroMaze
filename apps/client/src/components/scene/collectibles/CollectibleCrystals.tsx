'use client';

import { MutableRefObject } from 'react';
import * as THREE from 'three';
import { _crystalMaterial } from '../sceneMaterials';
import { isCrystalVisible } from '../../../utils/collectiblesUtils';

interface CollectibleCrystalsProps {
  levelRevisionKey: string;
  crystals: Array<[number, number]>;
  collectedCrystals: number[];
  crystalMeshesRef: MutableRefObject<Array<THREE.Mesh | null>>;
}

/**
 * 3B Sahne toplanabilir enerji kristalleri
 */
export function CollectibleCrystals({
  levelRevisionKey,
  crystals,
  collectedCrystals,
  crystalMeshesRef,
}: CollectibleCrystalsProps) {
  return (
    <>
      {crystals.map(([cx, cz], idx) => {
        const visible = isCrystalVisible(idx, collectedCrystals);
        return (
          <mesh
            key={`crystal-${levelRevisionKey}-${idx}`}
            ref={(el) => {
              crystalMeshesRef.current[idx] = el;
            }}
            position={[cx, 0.42, cz]}
            visible={visible}
            material={_crystalMaterial}
            castShadow
          >
            <octahedronGeometry args={[0.28, 0]} />
          </mesh>
        );
      })}
    </>
  );
}

