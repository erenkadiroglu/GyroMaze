'use client';

import { useRef, useCallback } from 'react';
import type * as THREE from 'three';
import {
  DEFAULT_TRAIL_COUNT,
  createInitialTrailHistory,
  resetTrailHistoryBuffer,
  stepAndResolveTrail,
  applyTrailMeshTransforms,
} from '@/utils/motionTrailUtils';
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
    createInitialTrailHistory(startPosition, TRAIL_COUNT || DEFAULT_TRAIL_COUNT),
  );

  const resetMotionTrail = useCallback(
    (newStartPosition?: [number, number, number]) => {
      resetTrailHistoryBuffer(
        trailHistoryRef.current,
        newStartPosition ?? startPosition,
      );
    },
    [startPosition],
  );

  const stepMotionTrail = useCallback(
    (pos: { x: number; z: number }, showTrail: boolean) => {
      const transforms = stepAndResolveTrail(
        trailHistoryRef.current,
        pos,
        showTrail,
      );
      applyTrailMeshTransforms(trailMeshesRef.current, transforms);
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
