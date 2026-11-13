'use client';

import type { WallDefinition } from './mazeLevels';
import { StageOuterWalls } from './walls/StageOuterWalls';
import { StageInnerWalls } from './walls/StageInnerWalls';
import { useMazeStageWalls } from '@/hooks/useMazeStageWalls';

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
  const {
    safeRevisionKey,
    outerWalls: safeOuterWalls,
    innerWalls: safeInnerWalls,
  } = useMazeStageWalls({
    levelRevisionKey,
    outerWalls,
    innerWalls,
  });

  return (
    <>
      <StageOuterWalls
        levelRevisionKey={safeRevisionKey}
        outerWalls={safeOuterWalls}
      />
      <StageInnerWalls
        levelRevisionKey={safeRevisionKey}
        innerWalls={safeInnerWalls}
      />
    </>
  );
}
