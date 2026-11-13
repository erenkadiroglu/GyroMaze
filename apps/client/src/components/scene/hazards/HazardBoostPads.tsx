'use client';

import type { BoostPadDefinition } from '../mazeLevels';
import { _boostBaseMaterial, _boostArrowMaterial } from '../sceneMaterials';
import { resolveBoostPadTransform } from '../../../utils/hazardUtils';

interface HazardBoostPadsProps {
  boostPads?: BoostPadDefinition[];
  levelRevisionKey: string;
}

/**
 * 3B Sahne kinetik hızlandırma rampaları (Boost Pads)
 */
export function HazardBoostPads({ boostPads, levelRevisionKey }: HazardBoostPadsProps) {
  return (
    <>
      {(boostPads ?? []).map((pad, idx) => {
        const { position, rotation } = resolveBoostPadTransform(pad);
        return (
          <group
            key={`boost-${levelRevisionKey}-${idx}`}
            position={position}
            rotation={rotation}
          >
            <mesh
              rotation={[-Math.PI / 2, 0, 0]}
              material={_boostBaseMaterial}
            >
              <planeGeometry args={[0.85, 1.1]} />
            </mesh>
            <mesh
              position={[0, 0.02, 0.12]}
              rotation={[Math.PI / 2, 0, 0]}
              material={_boostArrowMaterial}
            >
              <coneGeometry args={[0.24, 0.48, 3]} />
            </mesh>
          </group>
        );
      })}
    </>
  );
}

