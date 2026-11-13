import { BALL_RADIUS } from '../components/scene/sceneMaterials.ts';

export interface BoardBaseConfig {
  position: [number, number, number];
  boxArgs: [number, number, number];
}

export interface GridHelperConfig {
  key: string;
  size: number;
  divisions: number;
  colorCenterLine: string;
  colorGrid: string;
  position: [number, number, number];
}

export interface BallSpawnPosition {
  x: number;
  y: number;
  z: number;
  position: [number, number, number];
}

/**
 * Tahta alt gövde mesh'i için pozisyon ve kutu boyutlarını hesaplar.
 */
export function resolveBoardBaseConfig(boardSize: number): BoardBaseConfig {
  const safeSize = Number.isFinite(boardSize) && boardSize > 0 ? boardSize : 12;
  return {
    position: [0, -0.25, 0],
    boxArgs: [safeSize, 0.5, safeSize],
  };
}

/**
 * 3B tahta ızgara yardımcısı (gridHelper) renk ve boyut parametrelerini çözer.
 */
export function resolveGridHelperConfig(
  boardSize: number,
  isLightBoard: boolean,
): GridHelperConfig {
  const safeSize = Number.isFinite(boardSize) && boardSize > 0 ? boardSize : 12;
  return {
    key: isLightBoard ? 'grid-light' : 'grid-dark',
    size: Math.max(1, safeSize - 0.4),
    divisions: 12,
    colorCenterLine: isLightBoard ? '#cbd5e1' : '#27272a',
    colorGrid: isLightBoard ? '#e2e8f0' : '#27272a',
    position: [0, 0.01, 0],
  };
}

/**
 * 1. veya 2. oyuncu için dinamik fizik küresi başlangıç pozisyonunu hesaplar.
 */
export function resolveBallSpawnPosition(
  startPosition: [number, number, number],
  p2Offset?: [number, number],
): BallSpawnPosition {
  const [ox, oz] = p2Offset ?? [0, 0];
  const x = (startPosition[0] ?? 0) + ox;
  const y = BALL_RADIUS;
  const z = (startPosition[2] ?? 0) + oz;
  return {
    x,
    y,
    z,
    position: [x, y, z],
  };
}

