'use client';

import { MutableRefObject } from 'react';
import * as THREE from 'three';
import {
  BALL_RADIUS,
  TRAIL_COUNT,
  _trailMaterial,
  _ghostBallMaterial,
  _ballMaterial,
  _ball2Material,
} from './sceneMaterials';

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
      {/* Bilye Neon Hareket İzi (Motion Trail) */}
      {Array.from({ length: TRAIL_COUNT }).map((_, idx) => (
        <mesh
          key={`trail-${idx}`}
          ref={(el) => {
            trailMeshesRef.current[idx] = el;
          }}
          position={[startPosition[0], 0.025, startPosition[2]]}
          rotation={[-Math.PI / 2, 0, 0]}
          material={_trailMaterial}
        >
          <circleGeometry args={[BALL_RADIUS * 0.68, 16]} />
        </mesh>
      ))}

      {/* Hayalet Yarışçı Küresi (Kendi En İyi Rekorunun Canlı Hologramı) */}
      <mesh
        ref={ghostBallMeshRef}
        visible={false}
        position={[startPosition[0], BALL_RADIUS, startPosition[2]]}
        material={_ghostBallMaterial}
      >
        <sphereGeometry args={[BALL_RADIUS * 0.92, 20, 20]} />
      </mesh>

      {/* 1. Oyuncu Görsel Metal Bilye */}
      <mesh
        ref={visualBallMeshRef}
        position={[startPosition[0], BALL_RADIUS, startPosition[2]]}
        material={_ballMaterial}
        castShadow
      >
        <sphereGeometry args={[BALL_RADIUS, 32, 32]} />
      </mesh>

      {/* Çok Oyunculu 2. Oyuncu Görsel Altın Bilye */}
      <mesh
        ref={visualBall2MeshRef}
        visible={false}
        position={[
          startPosition[0] + p2SpawnOffsetX,
          BALL_RADIUS,
          startPosition[2] + p2SpawnOffsetZ,
        ]}
        material={_ball2Material}
        castShadow
      >
        <sphereGeometry args={[BALL_RADIUS, 32, 32]} />
      </mesh>
    </>
  );
}

