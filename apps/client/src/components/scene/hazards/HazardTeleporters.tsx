'use client';

import type { TeleporterPairDefinition } from '../mazeLevels';
import { _teleporterRingMaterial, _teleporterCoreMaterial } from '../sceneMaterials';
import { flattenTeleporterPortals } from '../../../utils/hazardUtils';

interface HazardTeleportersProps {
  teleporters?: TeleporterPairDefinition[];
  levelRevisionKey: string;
}

/**
 * 3B Sahne çift yönlü kuantum ışınlanma portalları (Teleporters)
 */
export function HazardTeleporters({ teleporters, levelRevisionKey }: HazardTeleportersProps) {
  const portalItems = flattenTeleporterPortals(teleporters, levelRevisionKey);

  return (
    <>
      {portalItems.map(({ key, position }) => (
        <group key={key} position={position}>
          <mesh
            rotation={[-Math.PI / 2, 0, 0]}
            material={_teleporterRingMaterial}
          >
            <ringGeometry args={[0.28, 0.44, 24]} />
          </mesh>
          <mesh
            rotation={[-Math.PI / 2, 0, 0]}
            position={[0, -0.005, 0]}
            material={_teleporterCoreMaterial}
          >
            <circleGeometry args={[0.28, 20]} />
          </mesh>
        </group>
      ))}
    </>
  );
}

