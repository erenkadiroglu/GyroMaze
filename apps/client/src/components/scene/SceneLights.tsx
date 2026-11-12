'use client';

interface SceneLightsProps {
  isLightScene: boolean;
  shadowMargin: number;
}

/**
 * 3B Sahne aydınlatması: Ortam ışığı, gölgeli yönsel güneş ışığı ve noktasal dolgu ışığı.
 */
export function SceneLights({ isLightScene, shadowMargin }: SceneLightsProps) {
  return (
    <>
      <ambientLight intensity={isLightScene ? 1.25 : 0.7} />
      <directionalLight
        position={[8, 16, 10]}
        intensity={isLightScene ? 2.1 : 1.75}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-shadowMargin}
        shadow-camera-right={shadowMargin}
        shadow-camera-top={shadowMargin}
        shadow-camera-bottom={-shadowMargin}
      />
      <pointLight
        position={[-8, 6, -8]}
        intensity={isLightScene ? 0.65 : 1.1}
        color="#38bdf8"
      />
    </>
  );
}

