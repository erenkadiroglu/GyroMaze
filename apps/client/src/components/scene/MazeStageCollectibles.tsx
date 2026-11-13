'use client';

import { MutableRefObject } from 'react';
import * as THREE from 'three';
import { CollectibleStartRing } from './collectibles/CollectibleStartRing';
import { CollectibleCrystals } from './collectibles/CollectibleCrystals';
import { CollectibleGoalPortal } from './collectibles/CollectibleGoalPortal';
import { useMazeStageCollectibles } from '@/hooks/useMazeStageCollectibles';

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
  const {
    safeRevisionKey,
    startPosition: safeStartPosition,
    goalPosition: safeGoalPosition,
    crystals: safeCrystals,
    collectedCrystals: safeCollectedCrystals,
  } = useMazeStageCollectibles({
    levelRevisionKey,
    startPosition,
    goalPosition,
    crystals,
    collectedCrystals,
    isGoalUnlocked,
  });

  return (
    <>
      <CollectibleStartRing startPosition={safeStartPosition} />
      <CollectibleCrystals
        levelRevisionKey={safeRevisionKey}
        crystals={safeCrystals}
        collectedCrystals={safeCollectedCrystals}
        crystalMeshesRef={crystalMeshesRef}
      />
      <CollectibleGoalPortal
        goalPosition={safeGoalPosition}
        isGoalUnlocked={isGoalUnlocked}
        goalRingRef={goalRingRef}
      />
    </>
  );
}
