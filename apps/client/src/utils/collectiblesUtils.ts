import {
  _goalUnlockedRingMaterial,
  _goalLockedRingMaterial,
  _goalUnlockedCoreMaterial,
  _goalLockedCoreMaterial,
} from '../components/scene/sceneMaterials.ts';

export interface GoalPortalVisuals {
  lightColor: string;
  lightIntensity: number;
  lightDistance: number;
  ringMaterial: typeof _goalUnlockedRingMaterial;
  coreMaterial: typeof _goalUnlockedCoreMaterial;
}

/**
 * Hedef portalının kilitli/açık durumuna göre materyal ve ışık rengini belirler.
 */
export function resolveGoalPortalVisuals(isGoalUnlocked: boolean): GoalPortalVisuals {
  if (isGoalUnlocked) {
    return {
      lightColor: '#10b981',
      lightIntensity: 3.0,
      lightDistance: 4.2,
      ringMaterial: _goalUnlockedRingMaterial,
      coreMaterial: _goalUnlockedCoreMaterial,
    };
  }

  return {
    lightColor: '#f59e0b',
    lightIntensity: 3.0,
    lightDistance: 4.2,
    ringMaterial: _goalLockedRingMaterial,
    coreMaterial: _goalLockedCoreMaterial,
  };
}

/**
 * Kristalin henüz toplanıp toplanmadığını (görünürlük durumunu) denetler.
 */
export function isCrystalVisible(crystalIndex: number, collectedCrystals: number[]): boolean {
  return !collectedCrystals.includes(crystalIndex);
}

/**
 * Başlangıç halkası için 3B konum vektörünü hesaplar.
 */
export function resolveStartRingPosition(
  startPosition: [number, number, number],
): [number, number, number] {
  return [startPosition[0], 0.02, startPosition[2]];
}
