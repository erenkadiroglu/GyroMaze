import { getMazeLevel } from '../components/scene/levels/index.ts';
import type { MazeLevelDefinition } from '../components/scene/levels/types.ts';
import {
  isLightSceneActive,
  resolveSceneColors,
  calculateShadowMargin,
} from './sceneConfigUtils.ts';
import {
  getSceneContainerClass,
  getSceneCanvasCameraConfig,
  getSceneGLConfig,
  getSceneDprRange,
  getScenePhysicsGravity,
  type SceneCameraConfig,
  type SceneGLConfig,
} from './sceneViewportUtils.ts';
import type { MazeStageProps } from '../components/scene/MazeStage';

export interface SceneViewportOptions {
  level?: number | null;
  customLevel?: MazeLevelDefinition | null;
  colorScheme?: string | null;
  boardTheme?: string | null;
  isContextLost?: boolean;
  canvasRevision?: number;
  isGoalUnlocked?: boolean;
  remainingCrystalsCount?: number;
}

export interface SceneViewportContainerProps {
  className: string;
  role: 'region';
  'aria-label': string;
  'data-level': number;
  'data-theme': string;
  'data-scheme': string;
  'data-context-lost': boolean;
  'data-revision': number;
}

export interface SceneLightingConfig {
  isLightScene: boolean;
  sceneBgColor: string;
  fogNear: number;
  fogFar: number;
  shadowMargin: number;
}

export interface SceneCanvasConfigBundle {
  dpr: [number, number];
  gl: SceneGLConfig;
  camera: SceneCameraConfig;
  shadows: boolean;
  physicsGravity: [number, number, number];
}

export interface ResolvedSceneViewportState {
  activeLevel: MazeLevelDefinition;
  isLightScene: boolean;
  lightingConfig: SceneLightingConfig;
  canvasConfig: SceneCanvasConfigBundle;
  containerProps: SceneViewportContainerProps;
  telemetrySummary: string;
  isContextLost: boolean;
  canvasRevision: number;
}

/**
 * 3B Sahne bölgesi için ekran okuyucu etiketini formatlar.
 */
export function formatSceneViewportAriaLabel(
  levelId: number,
  levelTitle?: string,
): string {
  const safeId =
    Number.isFinite(levelId) && levelId > 0 ? Math.floor(levelId) : 1;
  const trimmedTitle = levelTitle?.trim();
  if (trimmedTitle) {
    return `3B Labirent Sahnesi — Bölüm ${safeId}: ${trimmedTitle}`;
  }
  return `3B Labirent Sahnesi — Bölüm ${safeId}`;
}

/**
 * 3B Sahne için tek satırlık hata ayıklama ve telemetri dizesi üretir.
 */
export function formatSceneViewportTelemetry(
  options: SceneViewportOptions & {
    boardSize: number;
    shadowMargin: number;
    isLightScene: boolean;
  },
): string {
  const safeId =
    Number.isFinite(options.level) && (options.level ?? 0) > 0
      ? Math.floor(options.level ?? 1)
      : 1;
  const revision =
    typeof options.canvasRevision === 'number' ? options.canvasRevision : 0;

  if (options.isContextLost) {
    return `3B Sahne: Bölüm ${safeId} | WebGL Bağlamı Kesildi (Revizyon: ${revision})`;
  }

  const themeName = options.boardTheme || 'wood';
  const schemeName = options.isLightScene ? 'Aydınlık' : 'Karanlık';
  const portalText = options.isGoalUnlocked ? 'Açık' : 'Kilitli';
  const crystals =
    typeof options.remainingCrystalsCount === 'number' &&
    options.remainingCrystalsCount >= 0
      ? options.remainingCrystalsCount
      : 0;

  return `3B Sahne: Bölüm ${safeId} (${options.boardSize}x${options.boardSize}) | Tema: ${themeName} (${schemeName}) | Gölge: ${options.shadowMargin} | Revizyon: ${revision} | Durum: Aktif (Portal: ${portalText}, Kalan Kristal: ${crystals})`;
}

/**
 * 3B Canvas'ı saran kapsayıcı div için semantik DOM niteliklerini üretir.
 */
export function resolveSceneViewportContainerProps(
  options: SceneViewportOptions,
  activeLevel: MazeLevelDefinition,
): SceneViewportContainerProps {
  return {
    className: getSceneContainerClass(),
    role: 'region',
    'aria-label': formatSceneViewportAriaLabel(activeLevel.id, activeLevel.title),
    'data-level': activeLevel.id,
    'data-theme': options.boardTheme || 'wood',
    'data-scheme': options.colorScheme || 'dark',
    'data-context-lost': Boolean(options.isContextLost),
    'data-revision':
      typeof options.canvasRevision === 'number' ? options.canvasRevision : 0,
  };
}

/**
 * Tahta boyutu ve tema ayarlarına göre sahne aydınlatma ve sis parametrelerini belirler.
 */
export function resolveSceneLightingConfig(
  boardSize: number,
  colorScheme?: string | null,
  boardTheme?: string | null,
): SceneLightingConfig {
  const isLightScene = isLightSceneActive(
    colorScheme || 'dark',
    boardTheme || 'wood',
  );
  const colors = resolveSceneColors(isLightScene);
  const shadowMargin = calculateShadowMargin(boardSize);

  return {
    isLightScene,
    sceneBgColor: colors.sceneBgColor,
    fogNear: colors.fogNear,
    fogFar: colors.fogFar,
    shadowMargin,
  };
}

/**
 * 3B Canvas ve Rapier fizik dünyası için sabit yapılandırmayı döner.
 */
export function resolveSceneCanvasConfig(): SceneCanvasConfigBundle {
  return {
    dpr: getSceneDprRange(),
    gl: getSceneGLConfig(),
    camera: getSceneCanvasCameraConfig(),
    shadows: true,
    physicsGravity: getScenePhysicsGravity(),
  };
}

/**
 * 3B Sahne görünümünün tüm parametrelerini birleştirip saf durum nesnesini döner.
 */
export function resolveSceneViewportState(
  options?: SceneViewportOptions,
): ResolvedSceneViewportState {
  const safeOptions: SceneViewportOptions = options ?? {};
  const activeLevel = getMazeLevel(
    safeOptions.level ?? 1,
    safeOptions.customLevel ?? null,
  );
  const lightingConfig = resolveSceneLightingConfig(
    activeLevel.boardSize,
    safeOptions.colorScheme,
    safeOptions.boardTheme,
  );
  const canvasConfig = resolveSceneCanvasConfig();
  const containerProps = resolveSceneViewportContainerProps(
    safeOptions,
    activeLevel,
  );
  const telemetrySummary = formatSceneViewportTelemetry({
    ...safeOptions,
    boardSize: activeLevel.boardSize,
    shadowMargin: lightingConfig.shadowMargin,
    isLightScene: lightingConfig.isLightScene,
  });

  return {
    activeLevel,
    isLightScene: lightingConfig.isLightScene,
    lightingConfig,
    canvasConfig,
    containerProps,
    telemetrySummary,
    isContextLost: Boolean(safeOptions.isContextLost),
    canvasRevision:
      typeof safeOptions.canvasRevision === 'number'
        ? safeOptions.canvasRevision
        : 0,
  };
}

/**
 * MazeStage bileşeni için prop paketini tip güvenli biçimde hazırlar.
 */
export function resolveSceneStageProps(params: {
  levelData: MazeLevelDefinition;
  isGoalUnlocked: boolean;
  collectedCrystals: number[];
  ghostPath?: Array<[number, number]>;
  onCollectCrystal: (idx: number) => void;
  onReachGoal: (runPath: Array<[number, number]>, winnerSlot?: 1 | 2) => void;
  onFallIntoHole: (slot: 1 | 2) => void;
  onLaserHit: (slot: 1 | 2) => void;
  onBoostHit: (slot: 1 | 2) => void;
  onTeleportHit: (slot: 1 | 2) => void;
  onWallHit: (speed: number, slot: 1 | 2) => void;
}): MazeStageProps {
  return {
    levelData: params.levelData,
    isGoalUnlocked: params.isGoalUnlocked,
    collectedCrystals: params.collectedCrystals,
    ghostPath: params.ghostPath,
    onCollectCrystal: params.onCollectCrystal,
    onReachGoal: params.onReachGoal,
    onFallIntoHole: params.onFallIntoHole,
    onLaserHit: params.onLaserHit,
    onBoostHit: params.onBoostHit,
    onTeleportHit: params.onTeleportHit,
    onWallHit: params.onWallHit,
  };
}
