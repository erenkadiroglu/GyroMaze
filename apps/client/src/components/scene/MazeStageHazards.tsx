'use client';

import { MutableRefObject } from 'react';
import * as THREE from 'three';
import type {
  VoidHoleDefinition,
  BoostPadDefinition,
  TeleporterPairDefinition,
  LaserGateDefinition,
  MovingObstacleDefinition,
} from './mazeLevels';
import { HazardVoidHoles } from './hazards/HazardVoidHoles';
import { HazardBoostPads } from './hazards/HazardBoostPads';
import { HazardTeleporters } from './hazards/HazardTeleporters';
import { HazardLaserGates } from './hazards/HazardLaserGates';
import { HazardMovingObstacles } from './hazards/HazardMovingObstacles';

interface MazeStageHazardsProps {
  levelRevisionKey: string;
  voidHoles: VoidHoleDefinition[];
  boostPads?: BoostPadDefinition[];
  teleporters?: TeleporterPairDefinition[];
  laserGates: LaserGateDefinition[];
  movingObstacles?: MovingObstacleDefinition[];
  laserBeamMeshesRef: MutableRefObject<Array<THREE.Mesh | null>>;
  movingObstacleMeshesRef: MutableRefObject<Array<THREE.Mesh | null>>;
}

/**
 * 3B Labirent sahnesi tehlikeleri ve dinamik alanları:
 * Tuzak delikleri, hızlandırma rampaları, kuantum portalları, lazer kapıları ve kinetik hareketli engeller.
 */
export function MazeStageHazards({
  levelRevisionKey,
  voidHoles,
  boostPads,
  teleporters,
  laserGates,
  movingObstacles,
  laserBeamMeshesRef,
  movingObstacleMeshesRef,
}: MazeStageHazardsProps) {
  return (
    <>
      <HazardVoidHoles voidHoles={voidHoles} levelRevisionKey={levelRevisionKey} />
      <HazardBoostPads boostPads={boostPads} levelRevisionKey={levelRevisionKey} />
      <HazardTeleporters teleporters={teleporters} levelRevisionKey={levelRevisionKey} />
      <HazardLaserGates
        laserGates={laserGates}
        levelRevisionKey={levelRevisionKey}
        laserBeamMeshesRef={laserBeamMeshesRef}
      />
      <HazardMovingObstacles
        movingObstacles={movingObstacles}
        levelRevisionKey={levelRevisionKey}
        movingObstacleMeshesRef={movingObstacleMeshesRef}
      />
    </>
  );
}
