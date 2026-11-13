/**
 * 3B Sahne Işıkları ve Gölgeleri (SceneLights) Orkestrasyon Motoru.
 * Ortam ışığı, gölgeli yönsel güneş ışığı ve noktasal dolgu ışığı yapılandırmalarını saf mimariyle hesaplar.
 */

export interface AmbientLightConfig {
  intensity: number;
}

export interface ShadowCameraBounds {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

export interface DirectionalSunLightConfig {
  position: [number, number, number];
  intensity: number;
  castShadow: boolean;
  mapSize: [number, number];
  cameraBounds: ShadowCameraBounds;
}

export interface PointFillLightConfig {
  position: [number, number, number];
  intensity: number;
  color: string;
}

export interface SceneLightsBundle {
  ambient: AmbientLightConfig;
  sun: DirectionalSunLightConfig;
  fill: PointFillLightConfig;
  telemetrySummary: string;
}

export const DEFAULT_SUN_POSITION: [number, number, number] = [8, 16, 10];
export const DEFAULT_FILL_POSITION: [number, number, number] = [-8, 6, -8];
export const DEFAULT_SHADOW_MAP_SIZE: [number, number] = [1024, 1024];
export const DEFAULT_FILL_LIGHT_COLOR = '#38bdf8';

/**
 * Açık veya koyu sahne temasına göre ortam aydınlatma şiddetini döner.
 */
export function resolveAmbientLightConfig(
  isLightScene: boolean,
): AmbientLightConfig {
  return {
    intensity: isLightScene ? 1.25 : 0.7,
  };
}

/**
 * Yönsel güneş ışığı pozisyonu, ışık şiddeti ve gölge kamerası sınırlarını hesaplar.
 */
export function resolveDirectionalSunLightConfig(
  isLightScene: boolean,
  shadowMargin: number,
): DirectionalSunLightConfig {
  const safeMargin =
    Number.isFinite(shadowMargin) && shadowMargin > 0
      ? Math.ceil(shadowMargin)
      : 10;

  return {
    position: DEFAULT_SUN_POSITION,
    intensity: isLightScene ? 2.1 : 1.75,
    castShadow: true,
    mapSize: DEFAULT_SHADOW_MAP_SIZE,
    cameraBounds: {
      left: -safeMargin,
      right: safeMargin,
      top: safeMargin,
      bottom: -safeMargin,
    },
  };
}

/**
 * Sahne derinliğini artıran neon/siyan noktasal dolgu ışığı yapılandırmasını döner.
 */
export function resolvePointFillLightConfig(
  isLightScene: boolean,
): PointFillLightConfig {
  return {
    position: DEFAULT_FILL_POSITION,
    intensity: isLightScene ? 0.65 : 1.1,
    color: DEFAULT_FILL_LIGHT_COLOR,
  };
}

/**
 * 3B Işıklar için tek satırlık telemetri ve hata ayıklama dizesi üretir.
 */
export function formatSceneLightsTelemetry(
  isLightScene: boolean,
  shadowMargin: number,
): string {
  const safeMargin =
    Number.isFinite(shadowMargin) && shadowMargin > 0
      ? Math.ceil(shadowMargin)
      : 10;
  const sceneType = isLightScene ? 'Aydınlık Sahne' : 'Karanlık Sahne';
  const ambientVal = isLightScene ? '1.25' : '0.70';
  const sunVal = isLightScene ? '2.10' : '1.75';
  const fillVal = isLightScene ? '0.65' : '1.10';

  return `3B Işıklar: ${sceneType} | Ortam: ${ambientVal}, Güneş: ${sunVal}, Dolgu: ${fillVal} | Gölge Marjı: ${safeMargin}`;
}

/**
 * Tüm 3B sahne ışıklarını ve gölge sınırlarını tek bir saf yapılandırma demetinde toplar.
 */
export function resolveSceneLightsBundle(
  isLightScene: boolean,
  shadowMargin: number,
): SceneLightsBundle {
  const ambient = resolveAmbientLightConfig(isLightScene);
  const sun = resolveDirectionalSunLightConfig(isLightScene, shadowMargin);
  const fill = resolvePointFillLightConfig(isLightScene);
  const telemetrySummary = formatSceneLightsTelemetry(
    isLightScene,
    shadowMargin,
  );

  return {
    ambient,
    sun,
    fill,
    telemetrySummary,
  };
}
