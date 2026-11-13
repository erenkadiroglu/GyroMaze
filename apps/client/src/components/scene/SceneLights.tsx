'use client';

import { useSceneLights } from '@/hooks/useSceneLights';

export interface SceneLightsProps {
  isLightScene: boolean;
  shadowMargin: number;
}

/**
 * 3B Sahne aydınlatması: Ortam ışığı, gölgeli yönsel güneş ışığı ve noktasal dolgu ışığı.
 * useSceneLights kancası üzerinden saf orkestrasyon motoru tarafından beslenir.
 */
export function SceneLights(props: SceneLightsProps) {
  const { ambient, sun, fill } = useSceneLights(props);

  return (
    <>
      <ambientLight intensity={ambient.intensity} />
      <directionalLight
        position={sun.position}
        intensity={sun.intensity}
        castShadow={sun.castShadow}
        shadow-mapSize={sun.mapSize}
        shadow-camera-left={sun.cameraBounds.left}
        shadow-camera-right={sun.cameraBounds.right}
        shadow-camera-top={sun.cameraBounds.top}
        shadow-camera-bottom={sun.cameraBounds.bottom}
      />
      <pointLight
        position={fill.position}
        intensity={fill.intensity}
        color={fill.color}
      />
    </>
  );
}
