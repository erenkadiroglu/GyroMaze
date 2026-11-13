'use client';

import { _startRingMaterial } from '../sceneMaterials';
import { resolveStartRingPosition } from '../../../utils/collectiblesUtils';

interface CollectibleStartRingProps {
  startPosition: [number, number, number];
}

/**
 * 3B Sahne başlangıç noktası halka işaretçisi
 */
export function CollectibleStartRing({ startPosition }: CollectibleStartRingProps) {
  const pos = resolveStartRingPosition(startPosition);

  return (
    <mesh
      position={pos}
      rotation={[-Math.PI / 2, 0, 0]}
      material={_startRingMaterial}
    >
      <ringGeometry args={[0.35, 0.52, 24]} />
    </mesh>
  );
}

