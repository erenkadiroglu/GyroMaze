'use client';

import { _outerWallMaterial } from '../sceneMaterials';
import { resolveWallKey, formatWallGeometryArgs } from '../../../utils/wallUtils';

interface StageOuterWallsProps {
  levelRevisionKey: string;
  outerWalls: Array<{
    position: [number, number, number];
    size: [number, number, number];
  }>;
}

/**
 * 3B Sahne çevreleyen dış sınır duvarları
 */
export function StageOuterWalls({
  levelRevisionKey,
  outerWalls,
}: StageOuterWallsProps) {
  return (
    <>
      {outerWalls.map((wall, idx) => (
        <mesh
          key={resolveWallKey('outer', levelRevisionKey, idx)}
          position={wall.position}
          material={_outerWallMaterial}
          castShadow
          receiveShadow
        >
          <boxGeometry args={formatWallGeometryArgs(wall.size)} />
        </mesh>
      ))}
    </>
  );
}
