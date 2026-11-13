'use client';

import { CuboidCollider } from '@react-three/rapier';
import { calculateCuboidHalfExtents } from '../../../utils/sceneColliderUtils';

interface ColliderWallsProps {
  outerWalls: Array<{
    position: [number, number, number];
    size: [number, number, number];
  }>;
  innerWalls: Array<{
    position: [number, number, number];
    size: [number, number, number];
  }>;
  levelRevisionKey: string;
}

/**
 * 3B Sahne dış çevre ve iç labirent katı duvar çarpıştırıcıları
 */
export function ColliderWalls({
  outerWalls,
  innerWalls,
  levelRevisionKey,
}: ColliderWallsProps) {
  return (
    <>
      {/* Çevreleyen Dış Duvar Çarpıştırıcıları */}
      {outerWalls.map((wall, idx) => (
        <CuboidCollider
          key={`phys-outer-${idx}`}
          args={calculateCuboidHalfExtents(wall.size)}
          position={wall.position}
        />
      ))}

      {/* İç Labirent Duvar Çarpıştırıcıları */}
      {innerWalls.map((wall, idx) => (
        <CuboidCollider
          key={`phys-inner-${levelRevisionKey}-${idx}`}
          args={calculateCuboidHalfExtents(wall.size)}
          position={wall.position}
        />
      ))}
    </>
  );
}

