import { BALL_RADIUS } from '../components/scene/sceneMaterials.ts';
import {
  resolveBallSpawnPosition,
  type BallSpawnPosition,
} from './stageUtils.ts';

export const DEFAULT_PHYSICS_BALL_RADIUS = BALL_RADIUS || 0.34;
export const DEFAULT_PHYSICS_RESTITUTION = 0.22;
export const DEFAULT_PHYSICS_FRICTION = 0.08;
export const DEFAULT_ENABLED_TRANSLATIONS: [boolean, boolean, boolean] = [
  true,
  false,
  true,
];
export const DEFAULT_ENABLED_ROTATIONS: [boolean, boolean, boolean] = [
  false,
  false,
  false,
];

export interface PhysicsBallRigidBodyConfig {
  slot: 1 | 2;
  name: string;
  type: 'dynamic';
  colliders: false;
  position: [number, number, number];
  enabledTranslations: [boolean, boolean, boolean];
  enabledRotations: [boolean, boolean, boolean];
  restitution: number;
  friction: number;
  ccd: boolean;
  colliderRadius: number;
}

export interface PhysicsBallsSpawnPair {
  p1Spawn: BallSpawnPosition;
  p2Spawn: BallSpawnPosition;
  offsetX: number;
  offsetZ: number;
}

export interface ResolvePhysicsBallConfigOptions {
  restitution?: number;
  friction?: number;
  ccd?: boolean;
  colliderRadius?: number;
}

/**
 * Sayısal değeri güvenle sınırlar ve NaN/Infinity durumunda varsayılan değere döner.
 */
function safeNumber(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

/**
 * 1. veya 2. oyuncu bilyesi için dinamik Rapier fizik gövdesi parametrelerini çözer.
 */
export function resolvePhysicsBallRigidBodyConfig(
  slot: 1 | 2,
  position: [number, number, number],
  options?: ResolvePhysicsBallConfigOptions,
): PhysicsBallRigidBodyConfig {
  const safeX = safeNumber(position?.[0], 0);
  const safeY = safeNumber(position?.[1], DEFAULT_PHYSICS_BALL_RADIUS);
  const safeZ = safeNumber(position?.[2], 0);

  const restitution = Math.max(
    0,
    Math.min(
      1,
      safeNumber(options?.restitution, DEFAULT_PHYSICS_RESTITUTION),
    ),
  );
  const friction = Math.max(
    0,
    safeNumber(options?.friction, DEFAULT_PHYSICS_FRICTION),
  );
  const ccd = options?.ccd !== false;
  const colliderRadius = Math.max(
    0.05,
    safeNumber(options?.colliderRadius, DEFAULT_PHYSICS_BALL_RADIUS),
  );

  return {
    slot,
    name: slot === 2 ? 'ball-p2' : 'ball-p1',
    type: 'dynamic',
    colliders: false,
    position: [safeX, safeY, safeZ],
    enabledTranslations: DEFAULT_ENABLED_TRANSLATIONS,
    enabledRotations: DEFAULT_ENABLED_ROTATIONS,
    restitution,
    friction,
    ccd,
    colliderRadius,
  };
}

/**
 * 1P ve 2P fizik kürelerinin başlangıç ve ofset doğuş pozisyonlarını hesaplar.
 */
export function resolvePhysicsBallsSpawnPair(
  startPosition: [number, number, number],
  p2SpawnOffsetX?: number,
  p2SpawnOffsetZ?: number,
): PhysicsBallsSpawnPair {
  const safeOffsetX = safeNumber(p2SpawnOffsetX, 0.72);
  const safeOffsetZ = safeNumber(p2SpawnOffsetZ, 0);

  const p1Spawn = resolveBallSpawnPosition(startPosition);
  const p2Spawn = resolveBallSpawnPosition(startPosition, [
    safeOffsetX,
    safeOffsetZ,
  ]);

  return {
    p1Spawn,
    p2Spawn,
    offsetX: safeOffsetX,
    offsetZ: safeOffsetZ,
  };
}

/**
 * Küre çarpışma olayını güvenle sarmalayarak slot değerini iletir.
 */
export function createSafeBallCollisionHandler(
  slot: 1 | 2,
  onBallCollision?: (slot: 1 | 2) => void,
): () => void {
  return () => {
    if (typeof onBallCollision === 'function') {
      try {
        onBallCollision(slot);
      } catch {
        // Çarpışma geri çağrısı hata üretse bile sahne akışını bozmaz
      }
    }
  };
}

/**
 * Fizik kürelerinin telemetri ve hata ayıklama durum dizesini biçimlendirir.
 */
export function formatPhysicsBallsTelemetry({
  isMultiplayer,
  p1Position,
  p2Position,
  ccd = true,
}: {
  isMultiplayer: boolean;
  p1Position: [number, number, number];
  p2Position?: [number, number, number];
  ccd?: boolean;
}): string {
  const p1Str = `[${p1Position[0].toFixed(2)}, ${p1Position[1].toFixed(2)}, ${p1Position[2].toFixed(2)}]`;
  const ccdLabel = ccd ? 'CCD: Açık' : 'CCD: Kapalı';

  if (!isMultiplayer) {
    return `Fizik Küreleri: 1P Aktif (Doğuş: ${p1Str}, Sıfır Zıplama, ${ccdLabel})`;
  }

  const p2Str = p2Position
    ? `[${p2Position[0].toFixed(2)}, ${p2Position[1].toFixed(2)}, ${p2Position[2].toFixed(2)}]`
    : 'Tanımsız';

  return `Fizik Küreleri: 1P & 2P Aktif (P1: ${p1Str}, P2: ${p2Str}, Sıfır Zıplama, ${ccdLabel})`;
}

export interface ResolvePhysicsBallsBundleParams {
  startPosition: [number, number, number];
  p2SpawnOffsetX?: number;
  p2SpawnOffsetZ?: number;
  isMultiplayer: boolean;
  options?: ResolvePhysicsBallConfigOptions;
}

export interface PhysicsBallsOrchestrationBundle {
  p1BallConfig: PhysicsBallRigidBodyConfig;
  p2BallConfig: PhysicsBallRigidBodyConfig;
  spawnPair: PhysicsBallsSpawnPair;
  isMultiplayer: boolean;
  telemetrySummary: string;
}

/**
 * Fizik kürelerinin tüm orkestrasyon durumunu ve yapılandırmasını tek seferde çözer.
 */
export function resolvePhysicsBallsOrchestrationBundle({
  startPosition,
  p2SpawnOffsetX,
  p2SpawnOffsetZ,
  isMultiplayer,
  options,
}: ResolvePhysicsBallsBundleParams): PhysicsBallsOrchestrationBundle {
  const spawnPair = resolvePhysicsBallsSpawnPair(
    startPosition,
    p2SpawnOffsetX,
    p2SpawnOffsetZ,
  );

  const p1BallConfig = resolvePhysicsBallRigidBodyConfig(
    1,
    spawnPair.p1Spawn.position,
    options,
  );

  const p2BallConfig = resolvePhysicsBallRigidBodyConfig(
    2,
    spawnPair.p2Spawn.position,
    options,
  );

  const telemetrySummary = formatPhysicsBallsTelemetry({
    isMultiplayer,
    p1Position: p1BallConfig.position,
    p2Position: p2BallConfig.position,
    ccd: p1BallConfig.ccd,
  });

  return {
    p1BallConfig,
    p2BallConfig,
    spawnPair,
    isMultiplayer,
    telemetrySummary,
  };
}

