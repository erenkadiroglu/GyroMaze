'use client';

import type { WallDefinition } from '../mazeLevels';
import { _innerWallMaterial } from '../sceneMaterials';
import { resolveWallKey, formatWallGeometryArgs } from '../../../utils/wallUtils';

interface StageInnerWallsProps {
  levelRevisionKey: string;
  innerWalls: WallDefinition[];
}

/**
 * 3B Sahne iç labirent duvarları
 */
export function StageInnerWalls({
  levelRevisionKey,
  innerWalls,
}: StageInnerWallsProps) {
  return (
    <>
      {innerWalls.map((wall, idx) => (
        <mesh
          key={resolveWallKey('inner', levelRevisionKey, idx)}
          position={wall.position}
          material={_innerWallMaterial}
          castShadow
          receiveShadow
        >
          <boxGeometry args={formatWallGeometryArgs(wall.size)} />
        </mesh>
      ))}
    </>
  );
}
