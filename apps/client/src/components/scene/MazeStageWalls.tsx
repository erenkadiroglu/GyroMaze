'use client';

import type { WallDefinition } from './mazeLevels';
import { StageOuterWalls } from './walls/StageOuterWalls';
import { StageInnerWalls } from './walls/StageInnerWalls';

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
      <StageOuterWalls
        levelRevisionKey={levelRevisionKey}
        outerWalls={outerWalls}
      />
      <StageInnerWalls
        levelRevisionKey={levelRevisionKey}
        innerWalls={innerWalls}
      />
    </>
  );
}
