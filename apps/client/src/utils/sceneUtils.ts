import type { BoardTheme, ColorScheme, CameraMode, BallSkin } from '@gyromaze/shared';

export interface ThemePaletteConfig {
  boardColor: string;
  boardRoughness: number;
  boardMetalness: number;
  outerWallColor: string;
  innerWallColor: string;
  trailColor: string;
}

export interface BallSkinColorsConfig {
  color: string;
  emissive: string;
  emissiveIntensity: number;
  trailColor?: string;
}

/**
 * Periyodik lazer kapısının verilen sahne süresinde aktif (tehlikeli) olup olmadığını hesaplar.
 * Fizik çarpışma kontrolü ile görsel ışın görünürlüğünü tek formülde eşitler.
 */
export function isLaserGateActive(
  elapsed: number,
  periodSeconds: number,
  phaseOffset: number,
): boolean {
  const period = Math.max(0.2, periodSeconds);
  const cycleTime = (((elapsed + phaseOffset) % period) + period) % period;
  return cycleTime < period * 0.52;
}

/**
 * Hareketli kinetik engelin sinüzoidal konum ötelemesini hesaplar.
 */
export function calculateMovingObstacleOffset(
  elapsed: number,
  speed: number,
  phaseOffset: number,
  amplitude: number,
): number {
  return Math.sin(elapsed * speed + phaseOffset) * amplitude;
}

export {
  calculateCameraTargetTransform,
  type CameraTransformTarget,
} from './sceneCameraUtils.ts';

/**
 * Hayalet yarışçı için zaman enterpolasyonlu koordinatı ve görünürlük durumunu döner.
 */
export function calculateGhostPlaybackCoord(
  ghostPath: Array<[number, number]> | undefined,
  runElapsed: number,
  sampleRate: number = 10,
): { coord: [number, number]; isVisible: boolean } {
  if (!ghostPath || ghostPath.length <= 1 || runElapsed < 0) {
    return { coord: [0, 0], isVisible: false };
  }

  const exactIdx = runElapsed * sampleRate;
  const idx0 = Math.min(ghostPath.length - 1, Math.floor(exactIdx));
  const idx1 = Math.min(ghostPath.length - 1, idx0 + 1);

  if (idx0 >= ghostPath.length - 1) {
    return {
      coord: ghostPath[ghostPath.length - 1],
      isVisible: false,
    };
  }

  const frac = exactIdx - idx0;
  const gx =
    ghostPath[idx0][0] + (ghostPath[idx1][0] - ghostPath[idx0][0]) * frac;
  const gz =
    ghostPath[idx0][1] + (ghostPath[idx1][1] - ghostPath[idx0][1]) * frac;

  return {
    coord: [gx, gz],
    isVisible: true,
  };
}

/**
 * Neon hareket izi halkasının sırasına göre boyut ölçekleme çarpanını hesaplar.
 */
export function calculateTrailScale(index: number, totalCount: number): number {
  if (totalCount <= 0) return 1;
  return Math.max(0.15, 1 - index / (totalCount + 1));
}

/**
 * 3B sahne atmosferi ve renk şemasına göre materyal palet parametrelerini belirler.
 */
export function resolveThemePalette(
  boardTheme: BoardTheme,
  colorScheme: ColorScheme,
): ThemePaletteConfig {
  const isLightBoard = colorScheme === 'light' || boardTheme === 'daylight';

  if (isLightBoard) {
    return {
      boardColor: '#ffffff',
      boardRoughness: 0.42,
      boardMetalness: 0.08,
      outerWallColor: '#475569',
      innerWallColor: '#64748b',
      trailColor: '#0284c7',
    };
  }

  if (boardTheme === 'cyberpunk') {
    return {
      boardColor: '#0f1026',
      boardRoughness: 0.55,
      boardMetalness: 0.25,
      outerWallColor: '#1e1b4b',
      innerWallColor: '#312e81',
      trailColor: '#f472b6',
    };
  }

  if (boardTheme === 'crimson') {
    return {
      boardColor: '#1c1214',
      boardRoughness: 0.55,
      boardMetalness: 0.25,
      outerWallColor: '#3f1d24',
      innerWallColor: '#57242c',
      trailColor: '#fb923c',
    };
  }

  // Varsayılan: Zümrüt / Emerald
  return {
    boardColor: '#18181b',
    boardRoughness: 0.55,
    boardMetalness: 0.25,
    outerWallColor: '#27272a',
    innerWallColor: '#3f3f46',
    trailColor: '#38bdf8',
  };
}

/**
 * Bilye kaplaması ve açık zemin moduna göre bilye materyal parametrelerini döner.
 */
export function resolveBallSkinColors(
  ballSkin: BallSkin,
  isLightBoard: boolean,
): BallSkinColorsConfig {
  if (ballSkin === 'emerald') {
    return {
      color: '#10b981',
      emissive: '#059669',
      emissiveIntensity: 0.7,
      trailColor: '#34d399',
    };
  }

  if (ballSkin === 'plasma') {
    return {
      color: '#a855f7',
      emissive: '#7e22ce',
      emissiveIntensity: 0.75,
      trailColor: '#c084fc',
    };
  }

  if (ballSkin === 'crimson') {
    return {
      color: '#f43f5e',
      emissive: '#e11d48',
      emissiveIntensity: 0.75,
      trailColor: '#fb7185',
    };
  }

  // Varsayılan: Chrome
  return {
    color: isLightBoard ? '#18181b' : '#f4f4f5',
    emissive: '#000000',
    emissiveIntensity: 0,
  };
}

