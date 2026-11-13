/**
 * 3B WebGL Sahnesi (MazeScene) Canvas, kamera ve viewport yapılandırma yardımcıları.
 */

export interface SceneCameraConfig {
  position: [number, number, number];
  fov: number;
  near: number;
  far: number;
}

export interface SceneGLConfig {
  powerPreference: 'high-performance' | 'default' | 'low-power';
  antialias: boolean;
}

/**
 * 3B WebGL Canvas'ı kaplayan ana konteyner CSS sınıflarını döner.
 */
export function getSceneContainerClass(): string {
  return 'fixed inset-0 z-0 h-screen w-screen bg-base transition-colors duration-300';
}

/**
 * Standart perspektif kamera konum ve görüş açısı (FOV) yapılandırmasını döner.
 */
export function getSceneCanvasCameraConfig(): SceneCameraConfig {
  return {
    position: [0, 14.5, 10.2],
    fov: 42,
    near: 0.1,
    far: 60,
  };
}

/**
 * WebGL oluşturucu yüksek performans ve kenar yumuşatma (AA) yapılandırmasını döner.
 */
export function getSceneGLConfig(): SceneGLConfig {
  return {
    powerPreference: 'high-performance',
    antialias: true,
  };
}

/**
 * Yüksek DPI ve retina ekranlar için güvenli piksel oranı (DPR) aralığını döner.
 */
export function getSceneDprRange(): [number, number] {
  return [1, 1.5];
}

/**
 * Rapier fizik dünyası varsayılan yerçekimi vektörünü döner (tabla eğimiyle simüle edildiği için [0, 0, 0]).
 */
export function getScenePhysicsGravity(): [number, number, number] {
  return [0, 0, 0];
}

/**
 * Aktif bölümün canlı durum özetini formatlar.
 */
export function formatSceneSummary(
  levelId: number,
  isGoalUnlocked: boolean,
  remainingCrystalsCount: number,
): string {
  const safeId = Number.isFinite(levelId) && levelId > 0 ? Math.floor(levelId) : 1;
  const portalText = isGoalUnlocked ? 'Açık' : 'Kilitli';
  const crystalCount = Number.isFinite(remainingCrystalsCount) && remainingCrystalsCount >= 0
    ? Math.floor(remainingCrystalsCount)
    : 0;

  return `Bölüm ${safeId}, Portal: ${portalText}, Kalan Kristal: ${crystalCount}`;
}

