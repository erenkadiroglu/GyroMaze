'use client';

import { useRef, useCallback } from 'react';
import type * as THREE from 'three';
import {
  createInitialGhostPaths,
  evaluateGhostRecordingStep,
  resolveGhostMeshTransform,
  applyGhostMeshTransform,
} from '@/utils/ghostReplayUtils';

export interface UseGhostReplayOptions {
  startPosition: [number, number, number];
  p2SpawnOffsetX: number;
  p2SpawnOffsetZ: number;
}

/**
 * 3B Labirent 10Hz Hayalet Yarışçı (Ghost Replay) kaydı, canlı oynatımı ve yol tamponu yöneticisi.
 */
export function useGhostReplay({
  startPosition,
  p2SpawnOffsetX,
  p2SpawnOffsetZ,
}: UseGhostReplayOptions) {
  const initial = createInitialGhostPaths(
    startPosition,
    p2SpawnOffsetX,
    p2SpawnOffsetZ,
  );
  const runPathRef = useRef<Array<[number, number]>>(initial.runPath1);
  const runPathP2Ref = useRef<Array<[number, number]>>(initial.runPath2);
  const runElapsedRef = useRef<number>(0);
  const lastSampleTimeRef = useRef<number>(0);

  const resetRunPaths = useCallback(() => {
    const paths = createInitialGhostPaths(
      startPosition,
      p2SpawnOffsetX,
      p2SpawnOffsetZ,
    );
    runPathRef.current = paths.runPath1;
    runPathP2Ref.current = paths.runPath2;
    runElapsedRef.current = 0;
    lastSampleTimeRef.current = 0;
  }, [startPosition, p2SpawnOffsetX, p2SpawnOffsetZ]);

  const stepGhostReplay = useCallback(
    (
      safeDelta: number,
      isInteractive: boolean,
      pos1: { x: number; z: number },
      pos2: { x: number; z: number } | null,
      ghostPath: Array<[number, number]> | undefined,
      showGhost: boolean,
      ghostMesh: THREE.Mesh | null,
    ) => {
      const step = evaluateGhostRecordingStep({
        safeDelta,
        isInteractive,
        currentElapsed: runElapsedRef.current,
        lastSampleTime: lastSampleTimeRef.current,
        pos1,
        pos2,
        path1Length: runPathRef.current.length,
        path2Length: runPathP2Ref.current.length,
      });

      runElapsedRef.current = step.nextElapsed;
      lastSampleTimeRef.current = step.nextSampleTime;

      if (step.newPoint1) {
        runPathRef.current.push(step.newPoint1);
      }
      if (step.newPoint2) {
        runPathP2Ref.current.push(step.newPoint2);
      }

      const transform = resolveGhostMeshTransform({
        showGhost,
        isInteractive,
        ghostPath,
        runElapsed: runElapsedRef.current,
      });

      applyGhostMeshTransform(ghostMesh, transform);
    },
    [],
  );

  return {
    runPathRef,
    runPathP2Ref,
    runElapsedRef,
    resetRunPaths,
    stepGhostReplay,
  };
}
