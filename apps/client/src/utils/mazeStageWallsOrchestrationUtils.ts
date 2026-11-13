import {
  formatWallGeometryArgs,
  calculateWallVolume,
  resolveWallKey,
  type WallItem,
} from './wallUtils.ts';

export interface StageWallsMetrics {
  outerWallsCount: number;
  innerWallsCount: number;
  totalWallsCount: number;
  totalVolume: number;
}

export interface StageWallRenderDescriptor {
  key: string;
  type: 'outer' | 'inner';
  position: [number, number, number];
  size: [number, number, number];
  geometryArgs: [number, number, number];
  volume: number;
}

export interface ResolveStageWallsParams {
  levelRevisionKey?: string;
  outerWalls?: WallItem[];
  innerWalls?: WallItem[];
}

export interface StageWallsOrchestrationBundle {
  safeRevisionKey: string;
  outerWalls: WallItem[];
  innerWalls: WallItem[];
  outerDescriptors: StageWallRenderDescriptor[];
  innerDescriptors: StageWallRenderDescriptor[];
  metrics: StageWallsMetrics;
  telemetrySummary: string;
}

/**
 * Sayısal değeri güvenle doğrular; geçersiz durumlarda fallback döner.
 */
function safeCoordinate(value: unknown, fallback: number = 0): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

/**
 * Duvar listesindeki elemanları doğrular, bozuk koordinat ve boyutları temizler.
 */
export function normalizeWallItems(walls?: WallItem[]): WallItem[] {
  if (!Array.isArray(walls)) return [];

  return walls
    .filter((wall): wall is WallItem => Boolean(wall && Array.isArray(wall.position) && Array.isArray(wall.size)))
    .map((wall) => ({
      position: [
        safeCoordinate(wall.position[0], 0),
        safeCoordinate(wall.position[1], 0),
        safeCoordinate(wall.position[2], 0),
      ],
      size: [
        Math.max(0.01, safeCoordinate(wall.size[0], 1)),
        Math.max(0.01, safeCoordinate(wall.size[1], 1)),
        Math.max(0.01, safeCoordinate(wall.size[2], 1)),
      ],
    }));
}

/**
 * Düzey revizyon anahtarını doğrular veya güvenli bir varsayılan üretir.
 */
export function resolveStageWallsRevisionKey(revisionKey?: string): string {
  if (typeof revisionKey === 'string' && revisionKey.trim().length > 0) {
    return revisionKey.trim();
  }
  return 'rev-default';
}

/**
 * Duvar listesinden 3B render tanımlayıcılarını ve hacimlerini üretir.
 */
export function resolveWallRenderDescriptors(
  walls: WallItem[],
  type: 'outer' | 'inner',
  revisionKey: string,
): StageWallRenderDescriptor[] {
  return walls.map((wall, idx) => {
    const geometryArgs = formatWallGeometryArgs(wall.size);
    const volume = calculateWallVolume(geometryArgs);
    return {
      key: resolveWallKey(type, revisionKey, idx),
      type,
      position: wall.position,
      size: wall.size,
      geometryArgs,
      volume,
    };
  });
}

/**
 * Dış ve iç duvar dizileri üzerinden toplam metrikleri hesaplar.
 */
export function resolveStageWallsMetrics(
  outerDescriptors: StageWallRenderDescriptor[],
  innerDescriptors: StageWallRenderDescriptor[],
): StageWallsMetrics {
  const outerWallsCount = outerDescriptors.length;
  const innerWallsCount = innerDescriptors.length;
  const totalWallsCount = outerWallsCount + innerWallsCount;

  let rawVolume = 0;
  for (const item of outerDescriptors) {
    rawVolume += item.volume;
  }
  for (const item of innerDescriptors) {
    rawVolume += item.volume;
  }

  return {
    outerWallsCount,
    innerWallsCount,
    totalWallsCount,
    totalVolume: Number(rawVolume.toFixed(2)),
  };
}

/**
 * Sahne duvarları telemetri ve hata ayıklama özetini biçimlendirir.
 */
export function formatStageWallsTelemetry(
  metrics: StageWallsMetrics,
  revisionKey: string,
): string {
  return `Labirent Duvarları: ${metrics.outerWallsCount} Dış Sınır, ${metrics.innerWallsCount} İç Duvar (Toplam: ${metrics.totalWallsCount}, Hacim: ${metrics.totalVolume.toFixed(2)}m³, Rev: ${revisionKey})`;
}

/**
 * 3B Labirent sahnesi duvar orkestrasyon demetini tek seferde deterministik olarak üretir.
 */
export function resolveStageWallsOrchestrationBundle({
  levelRevisionKey,
  outerWalls,
  innerWalls,
}: ResolveStageWallsParams): StageWallsOrchestrationBundle {
  const safeRevisionKey = resolveStageWallsRevisionKey(levelRevisionKey);
  const normalizedOuter = normalizeWallItems(outerWalls);
  const normalizedInner = normalizeWallItems(innerWalls);

  const outerDescriptors = resolveWallRenderDescriptors(
    normalizedOuter,
    'outer',
    safeRevisionKey,
  );
  const innerDescriptors = resolveWallRenderDescriptors(
    normalizedInner,
    'inner',
    safeRevisionKey,
  );

  const metrics = resolveStageWallsMetrics(outerDescriptors, innerDescriptors);
  const telemetrySummary = formatStageWallsTelemetry(metrics, safeRevisionKey);

  return {
    safeRevisionKey,
    outerWalls: normalizedOuter,
    innerWalls: normalizedInner,
    outerDescriptors,
    innerDescriptors,
    metrics,
    telemetrySummary,
  };
}

