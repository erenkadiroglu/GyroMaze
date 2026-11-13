'use client';

import { useMemo } from 'react';
import {
  resolveStageActorsOrchestrationBundle,
  type StageActorsOrchestrationBundle,
} from '@/utils/mazeStageActorsOrchestrationUtils';

export interface UseMazeStageActorsProps {
  startPosition: [number, number, number];
  p2SpawnOffsetX?: number;
  p2SpawnOffsetZ?: number;
}

/**
 * 3B Labirent sahnesi dinamik aktörleri (bilyeler, hayalet ve hareket izi) için orkestrasyon kancası.
 */
export function useMazeStageActors({
  startPosition,
  p2SpawnOffsetX,
  p2SpawnOffsetZ,
}: UseMazeStageActorsProps): StageActorsOrchestrationBundle {
  return useMemo<StageActorsOrchestrationBundle>(() => {
    return resolveStageActorsOrchestrationBundle({
      startPosition,
      p2SpawnOffsetX,
      p2SpawnOffsetZ,
    });
  }, [startPosition, p2SpawnOffsetX, p2SpawnOffsetZ]);
}

