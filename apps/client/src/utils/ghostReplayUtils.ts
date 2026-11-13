import type * as THREE from 'three';
import { calculateGhostPlaybackCoord } from './sceneUtils.ts';
import { shouldUpdateGhostSample } from './sceneCameraUtils.ts';
import { formatPathPoint, canRecordPathPoint } from './sceneTiltUtils.ts';

export const GHOST_SAMPLE_RATE = 10; // 10 Hz
export const GHOST_SAMPLE_INTERVAL_SECONDS = 0.1; // 100 ms
export const MAX_GHOST_RECORDING_POINTS = 600; // 60 saniye @ 10 Hz
export const DEFAULT_GHOST_BALL_RADIUS = 0.34;

export interface GhostStepEvaluationParams {
  safeDelta: number;
  isInteractive: boolean;
  currentElapsed: number;
  lastSampleTime: number;
  pos1: { x: number; z: number };
  pos2: { x: number; z: number } | null;
  path1Length: number;
  path2Length: number;
  sampleInterval?: number;
  maxPoints?: number;
}

export interface GhostStepEvaluationResult {
  nextElapsed: number;
  shouldSample: boolean;
  nextSampleTime: number;
  newPoint1: [number, number] | null;
  newPoint2: [number, number] | null;
}

export interface GhostMeshTransformParams {
  showGhost: boolean;
  isInteractive: boolean;
  ghostPath: Array<[number, number]> | undefined;
  runElapsed: number;
  ballRadius?: number;
}

export interface GhostMeshTransformResult {
  isVisible: boolean;
  position: [number, number, number] | null;
}

/**
 * Başlangıç spawn koordinatlarından 1. ve 2. oyuncu için ilk yol noktalarını üretir.
 */
export function createInitialGhostPaths(
  startPosition: [number, number, number],
  p2SpawnOffsetX: number = 0.6,
  p2SpawnOffsetZ: number = 0,
): {
  runPath1: Array<[number, number]>;
  runPath2: Array<[number, number]>;
} {
  const [sx, , sz] = startPosition;
  return {
    runPath1: [formatPathPoint(sx, sz)],
    runPath2: [formatPathPoint(sx + p2SpawnOffsetX, sz + p2SpawnOffsetZ)],
  };
}

/**
 * 10Hz Hayalet yarışçı örnekleme adımı matematiğini hesaplar.
 */
export function evaluateGhostRecordingStep({
  safeDelta,
  isInteractive,
  currentElapsed,
  lastSampleTime,
  pos1,
  pos2,
  path1Length,
  path2Length,
  sampleInterval = GHOST_SAMPLE_INTERVAL_SECONDS,
  maxPoints = MAX_GHOST_RECORDING_POINTS,
}: GhostStepEvaluationParams): GhostStepEvaluationResult {
  if (!isInteractive) {
    return {
      nextElapsed: currentElapsed,
      shouldSample: false,
      nextSampleTime: lastSampleTime,
      newPoint1: null,
      newPoint2: null,
    };
  }

  const nextElapsed = currentElapsed + safeDelta;
  const { shouldSample, nextSampleTime } = shouldUpdateGhostSample(
    nextElapsed,
    lastSampleTime,
    sampleInterval,
  );

  let newPoint1: [number, number] | null = null;
  let newPoint2: [number, number] | null = null;

  if (shouldSample) {
    if (canRecordPathPoint(path1Length, maxPoints)) {
      newPoint1 = formatPathPoint(pos1.x, pos1.z);
    }
    if (pos2 && canRecordPathPoint(path2Length, maxPoints)) {
      newPoint2 = formatPathPoint(pos2.x, pos2.z);
    }
  }

  return {
    nextElapsed,
    shouldSample,
    nextSampleTime: shouldSample ? nextSampleTime : lastSampleTime,
    newPoint1,
    newPoint2,
  };
}

/**
 * Hayalet yarışçı 3B nesnesinin (mesh) görünürlük ve konum transformasyonunu çözer.
 */
export function resolveGhostMeshTransform({
  showGhost,
  isInteractive,
  ghostPath,
  runElapsed,
  ballRadius = DEFAULT_GHOST_BALL_RADIUS,
}: GhostMeshTransformParams): GhostMeshTransformResult {
  if (!isInteractive || !showGhost) {
    return {
      isVisible: false,
      position: null,
    };
  }

  const ghost = calculateGhostPlaybackCoord(
    ghostPath,
    runElapsed,
    GHOST_SAMPLE_RATE,
  );

  if (!ghost.isVisible) {
    return {
      isVisible: false,
      position: null,
    };
  }

  return {
    isVisible: true,
    position: [ghost.coord[0], ballRadius, ghost.coord[1]],
  };
}

/**
 * Üretilen transformasyonu Three.js Mesh referansına güvenle uygular.
 */
export function applyGhostMeshTransform(
  ghostMesh: THREE.Mesh | null | undefined,
  transform: GhostMeshTransformResult,
): void {
  if (!ghostMesh) return;
  ghostMesh.visible = transform.isVisible;
  if (transform.isVisible && transform.position) {
    ghostMesh.position.set(
      transform.position[0],
      transform.position[1],
      transform.position[2],
    );
  }
}
