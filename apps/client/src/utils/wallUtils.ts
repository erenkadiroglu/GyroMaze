export interface WallItem {
  position: [number, number, number];
  size: [number, number, number];
}

/**
 * Duvar mesh'i için kararlı React anahtarı (key) üretir.
 */
export function resolveWallKey(
  type: 'outer' | 'inner',
  revision: string,
  index: number,
): string {
  return `vis-${type}-${revision}-${index}`;
}

/**
 * Duvar kutu geometrisi argümanlarını [width, height, depth] olarak doğrular.
 */
export function formatWallGeometryArgs(
  size: [number, number, number],
): [number, number, number] {
  return [Math.max(0.01, size[0]), Math.max(0.01, size[1]), Math.max(0.01, size[2])];
}

/**
 * Duvarın 3B hacmini (hacim = w * h * d) hesaplar.
 */
export function calculateWallVolume(size: [number, number, number]): number {
  return Number((size[0] * size[1] * size[2]).toFixed(4));
}

