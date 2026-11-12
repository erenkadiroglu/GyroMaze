'use client';

import type { WallDefinition } from './mazeLevels';
import { _outerWallMaterial, _innerWallMaterial } from './sceneMaterials';

interface MazeStageWallsProps {
  levelRevisionKey: string;
  outerWalls: Array<{
    position: [number, number, number];
    size: [number, number, number];
  }>;
  innerWalls: WallDefinition[];
}

/**
 * 3B Labirent sahnesi dış sınır duvarları ve iç labirent duvarları.
 */
export function MazeStageWalls({
  levelRevisionKey,
  outerWalls,
  innerWalls,
}: MazeStageWallsProps) {
  return (
    <>
      {/* Çevreleyen Dış Duvarlar */}
      {outerWalls.map((wall, idx) => (
        <mesh
          key={`vis-outer-${levelRevisionKey}-${idx}`}
          position={wall.position}
          material={_outerWallMaterial}
          castShadow
          receiveShadow
        >
          <boxGeometry args={wall.size} />
        </mesh>
      ))}

      {/* İç Labirent Duvarları */}
      {innerWalls.map((wall, idx) => (
        <mesh
          key={`vis-inner-${levelRevisionKey}-${idx}`}
          position={wall.position}
          material={_innerWallMaterial}
          castShadow
          receiveShadow
        >
          <boxGeometry args={wall.size} />
        </mesh>
      ))}
    </>
  );
}

