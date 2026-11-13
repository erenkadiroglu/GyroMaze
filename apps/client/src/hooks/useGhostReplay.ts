'use client';

import { useRef, useCallback } from 'react';
import type * as THREE from 'three';
import { calculateGhostPlaybackCoord } from '@/utils/sceneUtils';
import { shouldUpdateGhostSample } from '@/utils/sceneCameraUtils';
import { formatPathPoint, canRecordPathPoint } from '@/utils/sceneTiltUtils';
import { BALL_RADIUS } from '../components/scene/sceneMaterials';

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
  const runPathRef = useRef<Array<[number, number]>>([
    formatPathPoint(startPosition[0], startPosition[2]),
  ]);
  const runPathP2Ref = useRef<Array<[number, number]>>([
    formatPathPoint(
      startPosition[0] + p2SpawnOffsetX,
      startPosition[2] + p2SpawnOffsetZ,
    ),
  ]);
  const runElapsedRef = useRef<number>(0);
  const lastSampleTimeRef = useRef<number>(0);

  const resetRunPaths = useCallback(() => {
    const [sx, , sz] = startPosition;
    runPathRef.current = [formatPathPoint(sx, sz)];
    runPathP2Ref.current = [
      formatPathPoint(sx + p2SpawnOffsetX, sz + p2SpawnOffsetZ),
    ];
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
      if (!isInteractive) {
        if (ghostMesh) {
          ghostMesh.visible = false;
        }
        return;
      }

      runElapsedRef.current += safeDelta;
      const { shouldSample, nextSampleTime } = shouldUpdateGhostSample(
        runElapsedRef.current,
        lastSampleTimeRef.current,
        0.1,
      );

      if (shouldSample) {
        lastSampleTimeRef.current = nextSampleTime;

        if (canRecordPathPoint(runPathRef.current.length)) {
          runPathRef.current.push(formatPathPoint(pos1.x, pos1.z));
        }

        if (pos2 && canRecordPathPoint(runPathP2Ref.current.length)) {
          runPathP2Ref.current.push(formatPathPoint(pos2.x, pos2.z));
        }
      }

      if (ghostMesh) {
        if (showGhost) {
          const ghost = calculateGhostPlaybackCoord(
            ghostPath,
            runElapsedRef.current,
          );
          ghostMesh.visible = ghost.isVisible;
          if (ghost.isVisible) {
            ghostMesh.position.set(
              ghost.coord[0],
              BALL_RADIUS,
              ghost.coord[1],
            );
          }
        } else {
          ghostMesh.visible = false;
        }
      }
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

