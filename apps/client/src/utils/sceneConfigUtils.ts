/**
 * 3B Sahne aydınlatma, sis ve gölge hesaplama yardımcıları.
 */

export interface SceneColorsConfig {
  sceneBgColor: string;
  fogNear: number;
  fogFar: number;
}

/**
 * Aydınlık veya karanlık sahne durumunu belirler.
 */
export function isLightSceneActive(
  colorScheme: string,
  boardTheme: string,
): boolean {
  return colorScheme === 'light' || boardTheme === 'daylight';
}

/**
 * Sahne arka plan rengi ve sis aralıklarını döner.
 */
export function resolveSceneColors(isLightScene: boolean): SceneColorsConfig {
  return {
    sceneBgColor: isLightScene ? '#e9eef5' : '#0f1a2b',
    fogNear: 18,
    fogFar: 38,
  };
}

/**
 * Tahta boyutuna göre dinamik ışık gölge sınırını (shadow margin) hesaplar.
 */
export function calculateShadowMargin(boardSize: number): number {
  const safeSize = Number.isFinite(boardSize) && boardSize > 0 ? boardSize : 12;
  return Math.max(9, Math.ceil(safeSize * 0.78));
}

