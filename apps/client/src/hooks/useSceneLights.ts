'use client';

import { useMemo } from 'react';
import {
  resolveSceneLightsBundle,
  type SceneLightsBundle,
} from '@/utils/sceneLightsOrchestrationUtils';

export interface UseSceneLightsProps {
  isLightScene: boolean;
  shadowMargin: number;
}

/**
 * 3B Sahne Işıkları (SceneLights) Orkestrasyon Kancası.
 * Sahne aydınlatma şiddetlerini ve dinamik gölge kamerası sınırlarını useMemo ile önbellekleyerek
 * SceneLights bileşenine saf orkestrasyon motoru çıktısı sağlar.
 */
export function useSceneLights({
  isLightScene,
  shadowMargin,
}: UseSceneLightsProps): SceneLightsBundle {
  return useMemo(() => {
    return resolveSceneLightsBundle(isLightScene, shadowMargin);
  }, [isLightScene, shadowMargin]);
}
