'use client';

import { useMemo } from 'react';
import type { WallDefinition } from '@/components/scene/mazeLevels';
import {
  resolveStageWallsOrchestrationBundle,
  type StageWallsOrchestrationBundle,
} from '@/utils/mazeStageWallsOrchestrationUtils';
import type { WallItem } from '@/utils/wallUtils';

export interface UseMazeStageWallsProps {
  levelRevisionKey: string;
  outerWalls: Array<{
    position: [number, number, number];
    size: [number, number, number];
  }>;
  innerWalls: WallDefinition[];
}

/**
 * 3B Labirent sahnesi dış ve iç duvarları için orkestrasyon kancası.
 */
export function useMazeStageWalls({
  levelRevisionKey,
  outerWalls,
  innerWalls,
}: UseMazeStageWallsProps): StageWallsOrchestrationBundle {
  return useMemo<StageWallsOrchestrationBundle>(() => {
    return resolveStageWallsOrchestrationBundle({
      levelRevisionKey,
      outerWalls: outerWalls as WallItem[],
      innerWalls: innerWalls as WallItem[],
    });
  }, [levelRevisionKey, outerWalls, innerWalls]);
}
