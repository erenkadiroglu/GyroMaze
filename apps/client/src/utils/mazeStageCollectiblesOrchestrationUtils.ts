import {
  resolveStartRingPosition,
  resolveGoalPortalVisuals,
  isCrystalVisible,
  type GoalPortalVisuals,
} from './collectiblesUtils.ts';

export interface StageCrystalsMetrics {
  totalCount: number;
  collectedCount: number;
  remainingCount: number;
  completionRatio: number;
  completionPercentage: number;
  isAllCollected: boolean;
}

export interface StageCrystalRenderItem {
  index: number;
  key: string;
  position: [number, number, number];
  isVisible: boolean;
  isCollected: boolean;
}

export interface StageGoalPortalDescriptor {
  position: [number, number, number];
  isUnlocked: boolean;
  statusLabel: string;
  visuals: GoalPortalVisuals;
}

export interface ResolveStageCollectiblesParams {
  levelRevisionKey?: string;
  startPosition?: [number, number, number];
  goalPosition?: [number, number, number];
  crystals?: Array<[number, number]>;
  collectedCrystals?: number[];
  isGoalUnlocked?: boolean;
}

export interface StageCollectiblesOrchestrationBundle {
  safeRevisionKey: string;
  startPosition: [number, number, number];
  startRingPosition: [number, number, number];
  goalPosition: [number, number, number];
  crystals: Array<[number, number]>;
  collectedCrystals: number[];
  crystalsMetrics: StageCrystalsMetrics;
  crystalRenderItems: StageCrystalRenderItem[];
  goalPortal: StageGoalPortalDescriptor;
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
export function normalizeStageVector3(
  vec?: [number, number, number],
  fallback: [number, number, number] = [0, 0, 0],
): [number, number, number] {
  if (!Array.isArray(vec)) return fallback;
  return [
    safeCoordinate(vec[0], fallback[0]),
    safeCoordinate(vec[1], fallback[1]),
    safeCoordinate(vec[2], fallback[2]),
  ];
}

/**
 * Enerji kristalleri toplama ilerlemesi ve metriklerini hesaplar.
 */
export function resolveCrystalsMetrics(
  crystals?: Array<[number, number]>,
  collectedCrystals?: number[],
): StageCrystalsMetrics {
  const safeCrystals = Array.isArray(crystals) ? crystals : [];
  const safeCollected = Array.isArray(collectedCrystals) ? collectedCrystals : [];

  const totalCount = safeCrystals.length;
  // Geçerli indeks aralığındaki toplanmış kristalleri say
  const validCollectedSet = new Set(
    safeCollected.filter((idx) => typeof idx === 'number' && idx >= 0 && idx < totalCount),
  );
  const collectedCount = validCollectedSet.size;
  const remainingCount = Math.max(0, totalCount - collectedCount);
  const completionRatio = totalCount > 0 ? Number((collectedCount / totalCount).toFixed(4)) : 1.0;
  const completionPercentage = Math.round(completionRatio * 100);
  const isAllCollected = remainingCount === 0;

  return {
    totalCount,
    collectedCount,
    remainingCount,
    completionRatio,
    completionPercentage,
    isAllCollected,
  };
}

/**
 * Hedef portalının durum ve görsel tanımlayıcısını çözer.
 */
export function resolveGoalPortalDescriptor(
  goalPosition?: [number, number, number],
  isGoalUnlocked: boolean = false,
): StageGoalPortalDescriptor {
  const normalizedGoalPos = normalizeStageVector3(goalPosition, [0, 0, 0]);
  const visuals = resolveGoalPortalVisuals(isGoalUnlocked);

  return {
    position: normalizedGoalPos,
    isUnlocked: isGoalUnlocked,
    statusLabel: isGoalUnlocked ? 'Hedef Açık' : 'Hedef Kilitli',
    visuals,
  };
}

/**
 * Kristal listesinden render öğelerini ve görünürlük durumlarını üretir.
 */
export function resolveCrystalRenderItems(
  crystals?: Array<[number, number]>,
  collectedCrystals?: number[],
  revisionKey: string = 'rev-default',
): StageCrystalRenderItem[] {
  if (!Array.isArray(crystals)) return [];
  const safeCollected = Array.isArray(collectedCrystals) ? collectedCrystals : [];

  return crystals.map(([cx, cz], idx) => {
    const isVisible = isCrystalVisible(idx, safeCollected);
    return {
      index: idx,
      key: `crystal-${revisionKey}-${idx}`,
      position: [safeCoordinate(cx, 0), 0.42, safeCoordinate(cz, 0)],
      isVisible,
      isCollected: !isVisible,
    };
  });
}

/**
 * Toplanabilirler telemetri ve hata ayıklama durum özetini biçimlendirir.
 */
export function formatStageCollectiblesTelemetry({
  metrics,
  startPosition,
  goalPortal,
}: {
  metrics: StageCrystalsMetrics;
  startPosition: [number, number, number];
  goalPortal: StageGoalPortalDescriptor;
}): string {
  const crystalStr = `${metrics.collectedCount}/${metrics.totalCount} Kristal (%${metrics.completionPercentage}, Kalan: ${metrics.remainingCount})`;
  const startStr = `[${startPosition[0].toFixed(1)}, ${startPosition[2].toFixed(1)}]`;
  const goalStr = `${goalPortal.statusLabel} ([${goalPortal.position[0].toFixed(1)}, ${goalPortal.position[2].toFixed(1)}])`;

  return `Toplanabilirler: ${crystalStr}, Başlangıç: ${startStr}, Hedef: ${goalStr}`;
}

/**
 * 3B Labirent sahnesi toplanabilirler ve geçitler orkestrasyon demetini üretir.
 */
export function resolveStageCollectiblesOrchestrationBundle({
  levelRevisionKey,
  startPosition,
  goalPosition,
  crystals,
  collectedCrystals,
  isGoalUnlocked = false,
}: ResolveStageCollectiblesParams): StageCollectiblesOrchestrationBundle {
  const safeRevisionKey =
    typeof levelRevisionKey === 'string' && levelRevisionKey.trim().length > 0
      ? levelRevisionKey.trim()
      : 'rev-default';

  const normalizedStart = normalizeStageVector3(startPosition, [0, 0, 0]);
  const normalizedGoal = normalizeStageVector3(goalPosition, [0, 0, 0]);
  const startRingPosition = resolveStartRingPosition(normalizedStart);

  const safeCrystals = Array.isArray(crystals) ? crystals : [];
  const safeCollected = Array.isArray(collectedCrystals) ? collectedCrystals : [];

  const crystalsMetrics = resolveCrystalsMetrics(safeCrystals, safeCollected);
  const crystalRenderItems = resolveCrystalRenderItems(
    safeCrystals,
    safeCollected,
    safeRevisionKey,
  );
  const goalPortal = resolveGoalPortalDescriptor(normalizedGoal, isGoalUnlocked);

  const telemetrySummary = formatStageCollectiblesTelemetry({
    metrics: crystalsMetrics,
    startPosition: normalizedStart,
    goalPortal,
  });

  return {
    safeRevisionKey,
    startPosition: normalizedStart,
    startRingPosition,
    goalPosition: normalizedGoal,
    crystals: safeCrystals,
    collectedCrystals: safeCollected,
    crystalsMetrics,
    crystalRenderItems,
    goalPortal,
    telemetrySummary,
  };
}
