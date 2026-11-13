'use client';

import { MutableRefObject } from 'react';
import type * as THREE from 'three';
import { BALL_RADIUS, _ballMaterial, _ball2Material } from '../sceneMaterials';
import { calculateBallSpawnPosition } from '../../../utils/sceneActorUtils';

interface ActorPlayerBallsProps {
  startPosition: [number, number, number];
  p2SpawnOffsetX: number;
  p2SpawnOffsetZ: number;
  visualBallMeshRef: MutableRefObject<THREE.Mesh | null>;
  visualBall2MeshRef: MutableRefObject<THREE.Mesh | null>;
}

/**
 * 3B Sahne 1. ve 2. oyuncu görsel bilye aktörleri (Metalik / Altın küreler)
 */
export function ActorPlayerBalls({
  startPosition,
  p2SpawnOffsetX,
  p2SpawnOffsetZ,
  visualBallMeshRef,
  visualBall2MeshRef,
}: ActorPlayerBallsProps) {
  const p1Spawn = calculateBallSpawnPosition(startPosition, 1, 0, 0, BALL_RADIUS);
  const p2Spawn = calculateBallSpawnPosition(
    startPosition,
    2,
    p2SpawnOffsetX,
    p2SpawnOffsetZ,
    BALL_RADIUS,
  );

  return (
    <>
      {/* 1. Oyuncu Görsel Metal Bilye */}
      <mesh
        ref={visualBallMeshRef}
        position={p1Spawn}
        material={_ballMaterial}
        castShadow
      >
        <sphereGeometry args={[BALL_RADIUS, 32, 32]} />
      </mesh>

      {/* Çok Oyunculu 2. Oyuncu Görsel Altın Bilye */}
      <mesh
        ref={visualBall2MeshRef}
        visible={false}
        position={p2Spawn}
        material={_ball2Material}
        castShadow
      >
        <sphereGeometry args={[BALL_RADIUS, 32, 32]} />
      </mesh>
    </>
  );
}

