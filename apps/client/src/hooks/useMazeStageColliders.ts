'use client';

import { useMemo } from 'react';
import type { MazeLevelDefinition } from '@/components/scene/mazeLevels';
import {
  resolveStageCollidersOrchestrationBundle,
  type ColliderWallItem,
  type StageCollidersOrchestrationBundle,
} from '@/utils/mazeStageCollidersOrchestrationUtils';

export interface UseMazeStageCollidersProps {
  levelRevisionKey: string;
  levelData: MazeLevelDefinition;
  outerWalls: ColliderWallItem[];
  isMultiplayer: boolean;
}

/**
 * 3B Labirent sahnesi sabit fizik çarpıştırıcıları (duvarlar, hedef ve tuzak sensörleri) için orkestrasyon kancası.
 */
export function useMazeStageColliders({
  levelRevisionKey,
  levelData,
  outerWalls,
  isMultiplayer,
}: UseMazeStageCollidersProps): StageCollidersOrchestrationBundle {
  return useMemo<StageCollidersOrchestrationBundle>(
    () =>
      resolveStageCollidersOrchestrationBundle({
        levelRevisionKey,
        levelData,
        outerWalls,
        isMultiplayer,
      }),
    [levelRevisionKey, levelData, outerWalls, isMultiplayer],
  );
}

