'use client';

import type { VoidHoleDefinition } from '../mazeLevels';
import { _holeCoreMaterial, _holeRingMaterial } from '../sceneMaterials';
import { resolveVoidHoleRadii } from '../../../utils/hazardUtils';

interface HazardVoidHolesProps {
  voidHoles: VoidHoleDefinition[];
  levelRevisionKey: string;
}

/**
 * 3B Sahne tuzak delikleri (çekirdek ve çevreleyen halka görseli)
 */
export function HazardVoidHoles({ voidHoles, levelRevisionKey }: HazardVoidHolesProps) {
  return (
    <>
      {voidHoles.map((hole, idx) => {
        const { r, innerRing, outerRing } = resolveVoidHoleRadii(hole);
        return (
          <group
            key={`vis-hole-${levelRevisionKey}-${idx}`}
            position={[hole.position[0], 0.02, hole.position[1]]}
          >
            <mesh rotation={[-Math.PI / 2, 0, 0]} material={_holeCoreMaterial}>
              <circleGeometry args={[r, 24]} />
            </mesh>
            <mesh
              rotation={[-Math.PI / 2, 0, 0]}
              position={[0, 0.005, 0]}
              material={_holeRingMaterial}
            >
              <ringGeometry args={[innerRing, outerRing, 24]} />
            </mesh>
          </group>
        );
      })}
    </>
  );
}

