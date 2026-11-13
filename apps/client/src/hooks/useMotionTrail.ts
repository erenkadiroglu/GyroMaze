'use client';

import { useRef, useCallback } from 'react';
import type * as THREE from 'three';
import { stepTrailHistory } from '@/utils/sceneCameraUtils';
import { calculateTrailScale } from '@/utils/sceneUtils';
import { TRAIL_COUNT } from '../components/scene/sceneMaterials';

export interface UseMotionTrailOptions {
  startPosition: [number, number, number];
}

/**
 * 3B Labirent Neon Hareket İzi (Motion Trail) yöneticisi ve mesh yaşam döngüsü kancası.
 * Sıfır bellek tahsisiyle (Zero GC) geriye doğru enterpolasyon ve halka ölçekleme sağlar.
 */
export function useMotionTrail({ startPosition }: UseMotionTrailOptions) {
  const trailMeshesRef = useRef<Array<THREE.Mesh | null>>([]);
  const trailHistoryRef = useRef<Array<{ x: number; z: number }>>(
    Array.from({ length: TRAIL_COUNT }, () => ({
      x: startPosition[0],
      z: startPosition[2],
    })),
  );

  const resetMotionTrail = useCallback(
    (newStartPosition?: [number, number, number]) => {
      const [sx, , sz] = newStartPosition ?? startPosition;
      for (let i = 0; i < TRAIL_COUNT; i++) {
        trailHistoryRef.current[i].x = sx;
        trailHistoryRef.current[i].z = sz;
      }
    },
    [startPosition],
  );

  const stepMotionTrail = useCallback(
    (pos: { x: number; z: number }, showTrail: boolean) => {
      stepTrailHistory(trailHistoryRef.current, pos);

      for (let i = 0; i < TRAIL_COUNT; i++) {
        const trailMesh = trailMeshesRef.current[i];
        if (trailMesh) {
          trailMesh.visible = showTrail;
          trailMesh.position.set(
            trailHistoryRef.current[i].x,
            0.025,
            trailHistoryRef.current[i].z,
          );
          const scale = calculateTrailScale(i, TRAIL_COUNT);
          trailMesh.scale.set(scale, scale, 1);
        }
      }
    },
    [],
  );

  return {
    trailMeshesRef,
    trailHistoryRef,
    stepMotionTrail,
    resetMotionTrail,
  };
}
