'use client';

import { useMemo } from 'react';
import type {
  VoidHoleDefinition,
  BoostPadDefinition,
  TeleporterPairDefinition,
  LaserGateDefinition,
  MovingObstacleDefinition,
} from '@/components/scene/mazeLevels';
import {
  resolveStageHazardsOrchestrationBundle,
  type StageHazardsOrchestrationBundle,
} from '@/utils/mazeStageHazardsOrchestrationUtils';

export interface UseMazeStageHazardsProps {
  levelRevisionKey: string;
  voidHoles: VoidHoleDefinition[];
  boostPads?: BoostPadDefinition[];
  teleporters?: TeleporterPairDefinition[];
  laserGates: LaserGateDefinition[];
  movingObstacles?: MovingObstacleDefinition[];
}

/**
 * 3B Labirent sahnesi tehlikeleri ve dinamik alanları için orkestrasyon kancası.
 */
export function useMazeStageHazards({
  levelRevisionKey,
  voidHoles,
  boostPads,
  teleporters,
  laserGates,
  movingObstacles,
}: UseMazeStageHazardsProps): StageHazardsOrchestrationBundle {
  return useMemo<StageHazardsOrchestrationBundle>(() => {
    return resolveStageHazardsOrchestrationBundle({
      levelRevisionKey,
      voidHoles,
      boostPads,
      teleporters,
      laserGates,
      movingObstacles,
    });
  }, [
    levelRevisionKey,
    voidHoles,
    boostPads,
    teleporters,
    laserGates,
    movingObstacles,
  ]);
}
