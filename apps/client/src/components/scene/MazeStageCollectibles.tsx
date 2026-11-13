'use client';

import { MutableRefObject } from 'react';
import * as THREE from 'three';
import { CollectibleStartRing } from './collectibles/CollectibleStartRing';
import { CollectibleCrystals } from './collectibles/CollectibleCrystals';
import { CollectibleGoalPortal } from './collectibles/CollectibleGoalPortal';

interface MazeStageCollectiblesProps {
  levelRevisionKey: string;
  startPosition: [number, number, number];
  goalPosition: [number, number, number];
  crystals: Array<[number, number]>;
  collectedCrystals: number[];
  isGoalUnlocked: boolean;
  crystalMeshesRef: MutableRefObject<Array<THREE.Mesh | null>>;
  goalRingRef: MutableRefObject<THREE.Mesh | null>;
}

/**
 * 3B Labirent sahnesi toplanabilirleri ve geçitleri:
 * Başlangıç halkası, toplanabilir enerji kristalleri ve kilitli/açık hedef portalı.
 */
export function MazeStageCollectibles({
  levelRevisionKey,
  startPosition,
  goalPosition,
  crystals,
  collectedCrystals,
  isGoalUnlocked,
  crystalMeshesRef,
  goalRingRef,
}: MazeStageCollectiblesProps) {
  return (
    <>
      <CollectibleStartRing startPosition={startPosition} />
      <CollectibleCrystals
        levelRevisionKey={levelRevisionKey}
        crystals={crystals}
        collectedCrystals={collectedCrystals}
        crystalMeshesRef={crystalMeshesRef}
      />
      <CollectibleGoalPortal
        goalPosition={goalPosition}
        isGoalUnlocked={isGoalUnlocked}
        goalRingRef={goalRingRef}
      />
    </>
  );
}
