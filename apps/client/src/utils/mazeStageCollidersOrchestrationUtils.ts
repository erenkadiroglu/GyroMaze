import type {
  MazeLevelDefinition,
  VoidHoleDefinition,
  WallDefinition,
} from '../components/scene/mazeLevels.ts';
import { calculateCuboidHalfExtents } from './sceneColliderUtils.ts';

export const DEFAULT_STAGE_COLLIDER_FRICTION = 0.12;
export const DEFAULT_STAGE_COLLIDER_RESTITUTION = 0.18;

export interface ColliderWallItem {
  position: [number, number, number];
  size: [number, number, number];
}

export interface StageCollidersRigidBodyConfig {
  type: 'fixed';
  colliders: false;
  friction: number;
  restitution: number;
}

export interface StageCollidersMetrics {
  outerWallsCount: number;
  innerWallsCount: number;
  totalSolidWallColliders: number;
  voidHoleSensorsCount: number;
  hasGoalSensor: boolean;
  totalSensorColliders: number;
  totalCollidersCount: number;
  isMultiplayer: boolean;
}

export interface ResolveStageCollidersParams {
  levelRevisionKey?: string;
  levelData?: Partial<
    Pick<MazeLevelDefinition, 'innerWalls' | 'goalPosition' | 'voidHoles'>
  >;
  outerWalls?: ColliderWallItem[];
  innerWalls?: WallDefinition[];
  goalPosition?: [number, number, number];
  voidHoles?: VoidHoleDefinition[];
  isMultiplayer?: boolean;
  friction?: number;
  restitution?: number;
}

export interface StageCollidersOrchestrationBundle {
  safeRevisionKey: string;
  rigidBodyConfig: StageCollidersRigidBodyConfig;
  outerWalls: ColliderWallItem[];
  innerWalls: ColliderWallItem[];
  goalPosition: [number, number, number];
  voidHoles: VoidHoleDefinition[];
  isMultiplayer: boolean;
  metrics: StageCollidersMetrics;
  telemetrySummary: string;
}

/**
 * Sayısal değeri güvenle doğrular; NaN/Infinity veya tip dışı değerlerde fallback döner.
 */
function safeNumber(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

/**
 * Sayıyı [min, max] aralığına sıkıştırır.
 */
function clampNumber(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Sabit çarpıştırıcılar için bölüm revizyon anahtarını doğrular.
 */
export function resolveCollidersRevisionKey(levelRevisionKey?: string): string {
  if (typeof levelRevisionKey === 'string' && levelRevisionKey.trim().length > 0) {
    return levelRevisionKey.trim();
  }
  return 'rev-colliders-default';
}

/**
 * Rapier sabit (fixed) gövde sürtünme ve sekme parametrelerini çözer.
 */
export function resolveCollidersRigidBodyConfig(options?: {
  friction?: number;
  restitution?: number;
}): StageCollidersRigidBodyConfig {
  const friction = clampNumber(
    safeNumber(options?.friction, DEFAULT_STAGE_COLLIDER_FRICTION),
    0,
    1,
  );
  const restitution = clampNumber(
    safeNumber(options?.restitution, DEFAULT_STAGE_COLLIDER_RESTITUTION),
    0,
    1,
  );

  return {
    type: 'fixed',
    colliders: false,
    friction: Number(friction.toFixed(4)),
    restitution: Number(restitution.toFixed(4)),
  };
}

/**
 * Katı duvar çarpıştırıcı listesini doğrular, bozuk koordinat ve boyutları temizler.
 */
export function normalizeColliderWalls(
  walls?: ColliderWallItem[],
): ColliderWallItem[] {
  if (!Array.isArray(walls)) return [];

  return walls
    .filter(
      (wall): wall is ColliderWallItem =>
        Boolean(wall && Array.isArray(wall.position) && Array.isArray(wall.size)),
    )
    .map((wall) => {
      const size: [number, number, number] = [
        Math.max(0.01, safeNumber(wall.size[0], 1)),
        Math.max(0.01, safeNumber(wall.size[1], 1)),
        Math.max(0.01, safeNumber(wall.size[2], 1)),
      ];
      // Cuboid half-extents hesaplanabilirliğini doğrular
      calculateCuboidHalfExtents(size);

      return {
        position: [
          safeNumber(wall.position[0], 0),
          safeNumber(wall.position[1], 0),
          safeNumber(wall.position[2], 0),
        ],
        size,
      };
    });
}

/**
 * Hedef portal sensörü 3B konumunu doğrular.
 */
export function normalizeColliderGoalPosition(
  goalPosition?: [number, number, number],
): [number, number, number] {
  if (!Array.isArray(goalPosition)) return [0, 0, 0];
  return [
    safeNumber(goalPosition[0], 0),
    safeNumber(goalPosition[1], 0),
    safeNumber(goalPosition[2], 0),
  ];
}

/**
 * Tuzak deliği sensör listesini doğrular; bozuk elemanları filtreler ve yarıçapı sınırlar.
 */
export function normalizeColliderVoidHoles(
  voidHoles?: VoidHoleDefinition[],
): VoidHoleDefinition[] {
  if (!Array.isArray(voidHoles)) return [];

  return voidHoles
    .filter(
      (hole): hole is VoidHoleDefinition =>
        Boolean(hole && Array.isArray(hole.position)),
    )
    .map((hole) => {
      const radius =
        typeof hole.radius === 'number' && Number.isFinite(hole.radius) && hole.radius > 0
          ? Number(Math.max(0.1, hole.radius).toFixed(4))
          : 0.42;

      return {
        position: [
          safeNumber(hole.position[0], 0),
          safeNumber(hole.position[1], 0),
        ],
        radius,
      };
    });
}

/**
 * Sabit duvar ve sensör çarpıştırıcılarının toplam sayısal metriklerini hesaplar.
 */
export function resolveStageCollidersMetrics({
  outerWallsCount,
  innerWallsCount,
  voidHoleSensorsCount,
  hasGoalSensor = true,
  isMultiplayer = false,
}: {
  outerWallsCount: number;
  innerWallsCount: number;
  voidHoleSensorsCount: number;
  hasGoalSensor?: boolean;
  isMultiplayer?: boolean;
}): StageCollidersMetrics {
  const safeOuter = Math.max(0, outerWallsCount);
  const safeInner = Math.max(0, innerWallsCount);
  const safeHoles = Math.max(0, voidHoleSensorsCount);
  const totalSolidWallColliders = safeOuter + safeInner;
  const totalSensorColliders = safeHoles + (hasGoalSensor ? 1 : 0);

  return {
    outerWallsCount: safeOuter,
    innerWallsCount: safeInner,
    totalSolidWallColliders,
    voidHoleSensorsCount: safeHoles,
    hasGoalSensor,
    totalSensorColliders,
    totalCollidersCount: totalSolidWallColliders + totalSensorColliders,
    isMultiplayer: Boolean(isMultiplayer),
  };
}

/**
 * Sabit çarpıştırıcılar telemetri ve hata ayıklama durum dizesini üretir.
 */
export function formatStageCollidersTelemetry(
  metrics: StageCollidersMetrics,
  rigidBodyConfig: StageCollidersRigidBodyConfig,
  revisionKey: string,
): string {
  const modeLabel = metrics.isMultiplayer ? '2P' : '1P';
  const goalLabel = metrics.hasGoalSensor ? 'Hedef Sensörü' : 'Hedef Yok';
  return `Sabit Çarpıştırıcılar: ${metrics.outerWallsCount} Dış + ${metrics.innerWallsCount} İç Duvar, ${metrics.voidHoleSensorsCount} Tuzak Sensörü, ${goalLabel} (Toplam: ${metrics.totalCollidersCount}, Sürtünme: ${rigidBodyConfig.friction.toFixed(2)}, Sekme: ${rigidBodyConfig.restitution.toFixed(2)}, Mod: ${modeLabel}, Rev: ${revisionKey})`;
}

/**
 * 3B Labirent sahnesi sabit fizik çarpıştırıcıları orkestrasyon demetini üretir.
 */
export function resolveStageCollidersOrchestrationBundle(
  params: ResolveStageCollidersParams = {},
): StageCollidersOrchestrationBundle {
  const safeRevisionKey = resolveCollidersRevisionKey(params.levelRevisionKey);
  const rigidBodyConfig = resolveCollidersRigidBodyConfig({
    friction: params.friction,
    restitution: params.restitution,
  });

  const outerWalls = normalizeColliderWalls(params.outerWalls);
  const innerWalls = normalizeColliderWalls(
    params.innerWalls ?? (params.levelData?.innerWalls as ColliderWallItem[] | undefined),
  );
  const goalPosition = normalizeColliderGoalPosition(
    params.goalPosition ?? params.levelData?.goalPosition,
  );
  const voidHoles = normalizeColliderVoidHoles(
    params.voidHoles ?? params.levelData?.voidHoles,
  );
  const isMultiplayer = Boolean(params.isMultiplayer);

  const metrics = resolveStageCollidersMetrics({
    outerWallsCount: outerWalls.length,
    innerWallsCount: innerWalls.length,
    voidHoleSensorsCount: voidHoles.length,
    hasGoalSensor: true,
    isMultiplayer,
  });

  const telemetrySummary = formatStageCollidersTelemetry(
    metrics,
    rigidBodyConfig,
    safeRevisionKey,
  );

  return {
    safeRevisionKey,
    rigidBodyConfig,
    outerWalls,
    innerWalls,
    goalPosition,
    voidHoles,
    isMultiplayer,
    metrics,
    telemetrySummary,
  };
}

