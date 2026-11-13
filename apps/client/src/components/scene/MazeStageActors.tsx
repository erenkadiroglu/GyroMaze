'use client';

import { MutableRefObject } from 'react';
import type * as THREE from 'three';
import { ActorMotionTrail } from './actors/ActorMotionTrail';
import { ActorGhostBall } from './actors/ActorGhostBall';
import { ActorPlayerBalls } from './actors/ActorPlayerBalls';

interface MazeStageActorsProps {
  startPosition: [number, number, number];
  p2SpawnOffsetX: number;
  p2SpawnOffsetZ: number;
  trailMeshesRef: MutableRefObject<Array<THREE.Mesh | null>>;
  ghostBallMeshRef: MutableRefObject<THREE.Mesh | null>;
  visualBallMeshRef: MutableRefObject<THREE.Mesh | null>;
  visualBall2MeshRef: MutableRefObject<THREE.Mesh | null>;
}

/**
 * 3B Labirent sahnesi dinamik aktörleri:
 * 1. Oyuncu metal bilyesi, 2. Oyuncu altın bilyesi, hayalet yarışçı hologramı ve neon hareket izi halkaları.
 */
export function MazeStageActors({
  startPosition,
  p2SpawnOffsetX,
  p2SpawnOffsetZ,
  trailMeshesRef,
  ghostBallMeshRef,
  visualBallMeshRef,
  visualBall2MeshRef,
}: MazeStageActorsProps) {
  return (
    <>
      <ActorMotionTrail
        startPosition={startPosition}
        trailMeshesRef={trailMeshesRef}
      />
      <ActorGhostBall
        startPosition={startPosition}
        ghostBallMeshRef={ghostBallMeshRef}
      />
      <ActorPlayerBalls
        startPosition={startPosition}
        p2SpawnOffsetX={p2SpawnOffsetX}
        p2SpawnOffsetZ={p2SpawnOffsetZ}
        visualBallMeshRef={visualBallMeshRef}
        visualBall2MeshRef={visualBall2MeshRef}
      />
    </>
  );
}
