'use client';

import { useMemo } from 'react';
import {
  resolveStageCollectiblesOrchestrationBundle,
  type StageCollectiblesOrchestrationBundle,
} from '@/utils/mazeStageCollectiblesOrchestrationUtils';

export interface UseMazeStageCollectiblesProps {
  levelRevisionKey: string;
  startPosition: [number, number, number];
  goalPosition: [number, number, number];
  crystals: Array<[number, number]>;
  collectedCrystals: number[];
  isGoalUnlocked: boolean;
}

/**
 * 3B Labirent sahnesi toplanabilirleri (kristaller, başlangıç halkası ve hedef portalı) için orkestrasyon kancası.
 */
export function useMazeStageCollectibles({
  levelRevisionKey,
  startPosition,
  goalPosition,
  crystals,
  collectedCrystals,
  isGoalUnlocked,
}: UseMazeStageCollectiblesProps): StageCollectiblesOrchestrationBundle {
  return useMemo<StageCollectiblesOrchestrationBundle>(() => {
    return resolveStageCollectiblesOrchestrationBundle({
      levelRevisionKey,
      startPosition,
      goalPosition,
      crystals,
      collectedCrystals,
      isGoalUnlocked,
    });
  }, [
    levelRevisionKey,
    startPosition,
    goalPosition,
    crystals,
    collectedCrystals,
    isGoalUnlocked,
  ]);
}

