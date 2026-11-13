import type {
  VoidHoleDefinition,
  BoostPadDefinition,
  TeleporterPairDefinition,
  LaserGateDefinition,
  MovingObstacleDefinition,
} from '../components/scene/mazeLevels.ts';

export interface StageHazardsMetrics {
  voidHolesCount: number;
  boostPadsCount: number;
  teleportersCount: number;
  teleporterPortalsCount: number;
  laserGatesCount: number;
  movingObstaclesCount: number;
  totalHazardsCount: number;
  hasActiveHazards: boolean;
}

export interface ResolveStageHazardsParams {
  levelRevisionKey?: string;
  voidHoles?: VoidHoleDefinition[];
  boostPads?: BoostPadDefinition[];
  teleporters?: TeleporterPairDefinition[];
  laserGates?: LaserGateDefinition[];
  movingObstacles?: MovingObstacleDefinition[];
}

export interface StageHazardsOrchestrationBundle {
  safeRevisionKey: string;
  voidHoles: VoidHoleDefinition[];
  boostPads: BoostPadDefinition[];
  teleporters: TeleporterPairDefinition[];
  laserGates: LaserGateDefinition[];
  movingObstacles: MovingObstacleDefinition[];
  metrics: StageHazardsMetrics;
  telemetrySummary: string;
}

/**
 * Tehlike listelerini güvenle doğrular; boş/tanımsız girdileri boş diziye çevirir.
 */
export function normalizeHazardLists(params: ResolveStageHazardsParams) {
  const voidHoles = Array.isArray(params.voidHoles) ? params.voidHoles : [];
  const boostPads = Array.isArray(params.boostPads) ? params.boostPads : [];
  const teleporters = Array.isArray(params.teleporters) ? params.teleporters : [];
  const laserGates = Array.isArray(params.laserGates) ? params.laserGates : [];
  const movingObstacles = Array.isArray(params.movingObstacles)
    ? params.movingObstacles
    : [];

  return {
    voidHoles,
    boostPads,
    teleporters,
    laserGates,
    movingObstacles,
  };
}

/**
 * Sahne tehlikeleri için revizyon anahtarını doğrular veya güvenli bir varsayılan üretir.
 */
export function resolveStageHazardsRevisionKey(revisionKey?: string): string {
  if (typeof revisionKey === 'string' && revisionKey.trim().length > 0) {
    return revisionKey.trim();
  }
  return 'rev-hazards-default';
}

/**
 * Tüm tehlike kategorileri üzerinden metrikleri ve toplam tehlike sayısını hesaplar.
 */
export function resolveStageHazardsMetrics({
  voidHoles,
  boostPads,
  teleporters,
  laserGates,
  movingObstacles,
}: ReturnType<typeof normalizeHazardLists>): StageHazardsMetrics {
  const voidHolesCount = voidHoles.length;
  const boostPadsCount = boostPads.length;
  const teleportersCount = teleporters.length;
  const teleporterPortalsCount = teleportersCount * 2;
  const laserGatesCount = laserGates.length;
  const movingObstaclesCount = movingObstacles.length;

  const totalHazardsCount =
    voidHolesCount +
    boostPadsCount +
    teleportersCount +
    laserGatesCount +
    movingObstaclesCount;

  return {
    voidHolesCount,
    boostPadsCount,
    teleportersCount,
    teleporterPortalsCount,
    laserGatesCount,
    movingObstaclesCount,
    totalHazardsCount,
    hasActiveHazards: totalHazardsCount > 0,
  };
}

/**
 * Tehlikeler telemetri ve hata ayıklama durum özetini insan tarafından okunabilir biçimde üretir.
 */
export function formatStageHazardsTelemetry(
  metrics: StageHazardsMetrics,
  revisionKey: string,
): string {
  if (!metrics.hasActiveHazards) {
    return `Sahne Tehlikeleri: Aktif tehlike veya engel bulunmuyor (Rev: ${revisionKey})`;
  }

  const parts: string[] = [];
  if (metrics.voidHolesCount > 0) {
    parts.push(`${metrics.voidHolesCount} Tuzak Deliği`);
  }
  if (metrics.boostPadsCount > 0) {
    parts.push(`${metrics.boostPadsCount} Hızlandırma Rampası`);
  }
  if (metrics.teleportersCount > 0) {
    parts.push(`${metrics.teleportersCount} Işınlanma Çifti`);
  }
  if (metrics.laserGatesCount > 0) {
    parts.push(`${metrics.laserGatesCount} Lazer Kapısı`);
  }
  if (metrics.movingObstaclesCount > 0) {
    parts.push(`${metrics.movingObstaclesCount} Hareketli Engel`);
  }

  return `Sahne Tehlikeleri: ${parts.join(', ')} (Toplam: ${metrics.totalHazardsCount} Tehlike Ögesi, Rev: ${revisionKey})`;
}

/**
 * 3B Labirent sahnesi tehlikeleri ve dinamik alanları orkestrasyon demetini tek seferde üretir.
 */
export function resolveStageHazardsOrchestrationBundle(
  params: ResolveStageHazardsParams,
): StageHazardsOrchestrationBundle {
  const safeRevisionKey = resolveStageHazardsRevisionKey(params.levelRevisionKey);
  const normalizedLists = normalizeHazardLists(params);
  const metrics = resolveStageHazardsMetrics(normalizedLists);
  const telemetrySummary = formatStageHazardsTelemetry(metrics, safeRevisionKey);

  return {
    safeRevisionKey,
    ...normalizedLists,
    metrics,
    telemetrySummary,
  };
}

