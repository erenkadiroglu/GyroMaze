import { BALL_RADIUS, TRAIL_COUNT } from '../components/scene/sceneMaterials.ts';
import {
  calculateBallSpawnPosition,
  resolveTrailInitialTransform,
} from './sceneActorUtils.ts';

export const DEFAULT_STAGE_BALL_RADIUS = BALL_RADIUS || 0.34;
export const DEFAULT_STAGE_TRAIL_COUNT = TRAIL_COUNT || 7;

export interface StageBallActorDescriptor {
  name: string;
  slot: 1 | 2;
  position: [number, number, number];
  radius: number;
  initiallyVisible: boolean;
}

export interface StageGhostBallDescriptor {
  name: string;
  position: [number, number, number];
  radius: number;
  initiallyVisible: boolean;
}

export interface StageMotionTrailDescriptor {
  name: string;
  count: number;
  circleRadius: number;
  initialTransform: {
    position: [number, number, number];
    rotation: [number, number, number];
  };
}

export interface StageActorsDescriptors {
  p1Ball: StageBallActorDescriptor;
  p2Ball: StageBallActorDescriptor;
  ghostBall: StageGhostBallDescriptor;
  motionTrail: StageMotionTrailDescriptor;
}

export interface ResolveStageActorsParams {
  startPosition?: [number, number, number];
  p2SpawnOffsetX?: number;
  p2SpawnOffsetZ?: number;
  ballRadius?: number;
  trailCount?: number;
}

export interface StageActorsOrchestrationBundle {
  startPosition: [number, number, number];
  p2SpawnOffsetX: number;
  p2SpawnOffsetZ: number;
  p1Spawn: [number, number, number];
  p2Spawn: [number, number, number];
  ghostSpawn: [number, number, number];
  trailInitialTransform: {
    position: [number, number, number];
    rotation: [number, number, number];
  };
  descriptors: StageActorsDescriptors;
  telemetrySummary: string;
}

/**
 * Sayısal değeri güvenle sınırlar ve tanımsız/NaN durumlarında fallback döner.
 */
function safeCoordinate(value: unknown, fallback: number = 0): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

/**
 * 3B koordinat vektörünü doğrular.
 */
export function normalizeActorPosition(
  pos?: [number, number, number],
  fallback: [number, number, number] = [0, 0, 0],
): [number, number, number] {
  if (!Array.isArray(pos)) return fallback;
  return [
    safeCoordinate(pos[0], fallback[0]),
    safeCoordinate(pos[1], fallback[1]),
    safeCoordinate(pos[2], fallback[2]),
  ];
}

/**
 * 1P, 2P ve hayalet bilyeler için başlangıç dünya koordinatlarını hesaplar.
 */
export function resolveActorSpawnPositions(
  startPosition: [number, number, number],
  p2SpawnOffsetX: number = 0.72,
  p2SpawnOffsetZ: number = 0,
  ballRadius: number = DEFAULT_STAGE_BALL_RADIUS,
): {
  p1Spawn: [number, number, number];
  p2Spawn: [number, number, number];
  ghostSpawn: [number, number, number];
} {
  const p1Spawn = calculateBallSpawnPosition(
    startPosition,
    1,
    0,
    0,
    ballRadius,
  );
  const p2Spawn = calculateBallSpawnPosition(
    startPosition,
    2,
    p2SpawnOffsetX,
    p2SpawnOffsetZ,
    ballRadius,
  );
  const ghostSpawn: [number, number, number] = [
    startPosition[0],
    ballRadius,
    startPosition[2],
  ];

  return {
    p1Spawn,
    p2Spawn,
    ghostSpawn,
  };
}

/**
 * Dinamik aktörlerin tanımlayıcı nesnelerini üretir.
 */
export function resolveActorDescriptors({
  p1Spawn,
  p2Spawn,
  ghostSpawn,
  trailInitialTransform,
  ballRadius = DEFAULT_STAGE_BALL_RADIUS,
  trailCount = DEFAULT_STAGE_TRAIL_COUNT,
}: {
  p1Spawn: [number, number, number];
  p2Spawn: [number, number, number];
  ghostSpawn: [number, number, number];
  trailInitialTransform: {
    position: [number, number, number];
    rotation: [number, number, number];
  };
  ballRadius?: number;
  trailCount?: number;
}): StageActorsDescriptors {
  return {
    p1Ball: {
      name: 'visual-ball-p1',
      slot: 1,
      position: p1Spawn,
      radius: ballRadius,
      initiallyVisible: true,
    },
    p2Ball: {
      name: 'visual-ball-p2',
      slot: 2,
      position: p2Spawn,
      radius: ballRadius,
      initiallyVisible: false,
    },
    ghostBall: {
      name: 'ghost-ball',
      position: ghostSpawn,
      radius: Number((ballRadius * 0.92).toFixed(4)),
      initiallyVisible: false,
    },
    motionTrail: {
      name: 'motion-trail',
      count: trailCount,
      circleRadius: Number((ballRadius * 0.68).toFixed(4)),
      initialTransform: trailInitialTransform,
    },
  };
}

/**
 * Aktörler telemetri ve hata ayıklama özetini biçimlendirir.
 */
export function formatStageActorsTelemetry({
  p1Spawn,
  p2Spawn,
  p2OffsetX,
  p2OffsetZ,
  trailCount,
}: {
  p1Spawn: [number, number, number];
  p2Spawn: [number, number, number];
  p2OffsetX: number;
  p2OffsetZ: number;
  trailCount: number;
}): string {
  const p1Str = `[${p1Spawn[0].toFixed(2)}, ${p1Spawn[2].toFixed(2)}]`;
  const p2Str = `[${p2Spawn[0].toFixed(2)}, ${p2Spawn[2].toFixed(2)}]`;
  const offsetStr = `[${p2OffsetX.toFixed(2)}, ${p2OffsetZ.toFixed(2)}]`;

  return `Sahne Aktörleri: P1 ${p1Str}, P2 ${p2Str} (Ofset: ${offsetStr}), ${trailCount} Neon İzi`;
}

/**
 * 3B Labirent sahnesi dinamik aktörleri orkestrasyon demetini tek seferde üretir.
 */
export function resolveStageActorsOrchestrationBundle({
  startPosition,
  p2SpawnOffsetX = 0.72,
  p2SpawnOffsetZ = 0,
  ballRadius = DEFAULT_STAGE_BALL_RADIUS,
  trailCount = DEFAULT_STAGE_TRAIL_COUNT,
}: ResolveStageActorsParams = {}): StageActorsOrchestrationBundle {
  const normalizedStart = normalizeActorPosition(startPosition, [0, 0, 0]);
  const safeOffsetX = safeCoordinate(p2SpawnOffsetX, 0.72);
  const safeOffsetZ = safeCoordinate(p2SpawnOffsetZ, 0);

  const { p1Spawn, p2Spawn, ghostSpawn } = resolveActorSpawnPositions(
    normalizedStart,
    safeOffsetX,
    safeOffsetZ,
    ballRadius,
  );

  const trailInitialTransform = resolveTrailInitialTransform(normalizedStart);

  const descriptors = resolveActorDescriptors({
    p1Spawn,
    p2Spawn,
    ghostSpawn,
    trailInitialTransform,
    ballRadius,
    trailCount,
  });

  const telemetrySummary = formatStageActorsTelemetry({
    p1Spawn,
    p2Spawn,
    p2OffsetX: safeOffsetX,
    p2OffsetZ: safeOffsetZ,
    trailCount,
  });

  return {
    startPosition: normalizedStart,
    p2SpawnOffsetX: safeOffsetX,
    p2SpawnOffsetZ: safeOffsetZ,
    p1Spawn,
    p2Spawn,
    ghostSpawn,
    trailInitialTransform,
    descriptors,
    telemetrySummary,
  };
}
