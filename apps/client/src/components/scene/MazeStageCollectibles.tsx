'use client';

import { MutableRefObject } from 'react';
import * as THREE from 'three';
import {
  _startRingMaterial,
  _crystalMaterial,
  _goalUnlockedRingMaterial,
  _goalLockedRingMaterial,
  _goalUnlockedCoreMaterial,
  _goalLockedCoreMaterial,
} from './sceneMaterials';

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
      {/* Başlangıç Noktası İşaretçisi */}
      <mesh
        position={[startPosition[0], 0.02, startPosition[2]]}
        rotation={[-Math.PI / 2, 0, 0]}
        material={_startRingMaterial}
      >
        <ringGeometry args={[0.35, 0.52, 24]} />
      </mesh>

      {/* Toplanabilir Enerji Kristalleri */}
      {crystals.map(([cx, cz], idx) => {
        const isCollected = collectedCrystals.includes(idx);
        return (
          <mesh
            key={`crystal-${levelRevisionKey}-${idx}`}
            ref={(el) => {
              crystalMeshesRef.current[idx] = el;
            }}
            position={[cx, 0.42, cz]}
            visible={!isCollected}
            material={_crystalMaterial}
            castShadow
          >
            <octahedronGeometry args={[0.28, 0]} />
          </mesh>
        );
      })}

      {/* Hedef Portalı (Kristaller Toplandığında Kehribardan Zümrüt Yeşiline Dönüşür) */}
      <group position={goalPosition}>
        <mesh
          ref={goalRingRef}
          position={[0, -0.32, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          material={
            isGoalUnlocked
              ? _goalUnlockedRingMaterial
              : _goalLockedRingMaterial
          }
        >
          <ringGeometry args={[0.35, 0.68, 6]} />
        </mesh>
        <mesh
          position={[0, -0.33, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          material={
            isGoalUnlocked
              ? _goalUnlockedCoreMaterial
              : _goalLockedCoreMaterial
          }
        >
          <circleGeometry args={[0.35, 24]} />
        </mesh>
        <pointLight
          color={isGoalUnlocked ? '#10b981' : '#f59e0b'}
          intensity={3.0}
          distance={4.2}
          position={[0, 0.5, 0]}
        />
      </group>
    </>
  );
}

