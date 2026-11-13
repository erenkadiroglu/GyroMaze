'use client';

import { MutableRefObject } from 'react';
import * as THREE from 'three';
import type { LaserGateDefinition } from '../mazeLevels';
import { _laserPillarMaterial, _laserBeamMaterial } from '../sceneMaterials';
import { resolveLaserGatePillars } from '../../../utils/hazardUtils';

interface HazardLaserGatesProps {
  laserGates: LaserGateDefinition[];
  levelRevisionKey: string;
  laserBeamMeshesRef: MutableRefObject<Array<THREE.Mesh | null>>;
}

/**
 * 3B Sahne periyodik lazer kapıları ve dinamik ışın kafesleri
 */
export function HazardLaserGates({
  laserGates,
  levelRevisionKey,
  laserBeamMeshesRef,
}: HazardLaserGatesProps) {
  return (
    <>
      {laserGates.map((gate, idx) => {
        const { p1, p2, beamSize, beamPosition } = resolveLaserGatePillars(gate);

        return (
          <group key={`laser-${levelRevisionKey}-${idx}`}>
            <mesh position={p1} material={_laserPillarMaterial}>
              <cylinderGeometry args={[0.1, 0.12, 0.7, 12]} />
            </mesh>
            <mesh position={p2} material={_laserPillarMaterial}>
              <cylinderGeometry args={[0.1, 0.12, 0.7, 12]} />
            </mesh>
            <mesh
              ref={(el) => {
                laserBeamMeshesRef.current[idx] = el;
              }}
              position={beamPosition}
              material={_laserBeamMaterial}
            >
              <boxGeometry args={beamSize} />
            </mesh>
          </group>
        );
      })}
    </>
  );
}
