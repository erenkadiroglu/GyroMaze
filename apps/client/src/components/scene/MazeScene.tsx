'use client';

import { Canvas } from '@react-three/fiber';
import { Physics } from '@react-three/rapier';
import { SceneErrorBoundary } from './SceneErrorBoundary';
import { SceneLights } from './SceneLights';
import { MazeCameraRig } from './MazeCameraRig';
import { MazeStage } from './MazeStage';
import { ContextLostFallback } from './ContextLostFallback';
import { useSceneViewport } from '@/hooks/useSceneViewport';

/**
 * Masaüstü ekranında tam ekran çalışan 3B WebGL sahnesi.
 * useSceneViewport orkestrasyon kancası üzerinden WebGL bağlam kurtarmasını,
 * kamera teçhizatını, sahne aydınlatmasını ve Rapier fizik simülasyonunu koordine eder.
 */
export function MazeScene() {
  const {
    viewportState,
    stageProps,
    isContextLost,
    canvasRevision,
    handleSceneRetry,
    attachContextListeners,
  } = useSceneViewport();

  const { containerProps, canvasConfig, lightingConfig } = viewportState;

  return (
    <div {...containerProps}>
      <SceneErrorBoundary key={canvasRevision} onRetry={handleSceneRetry}>
        {isContextLost ? (
          <ContextLostFallback onRetry={handleSceneRetry} />
        ) : (
          <Canvas
            key={canvasRevision}
            shadows={canvasConfig.shadows}
            dpr={canvasConfig.dpr}
            gl={canvasConfig.gl}
            camera={canvasConfig.camera}
            onCreated={({ gl }) => attachContextListeners(gl)}
          >
            <color attach="background" args={[lightingConfig.sceneBgColor]} />
            <fog
              attach="fog"
              args={[
                lightingConfig.sceneBgColor,
                lightingConfig.fogNear,
                lightingConfig.fogFar,
              ]}
            />

            <MazeCameraRig />

            <SceneLights
              isLightScene={lightingConfig.isLightScene}
              shadowMargin={lightingConfig.shadowMargin}
            />

            <Physics gravity={canvasConfig.physicsGravity}>
              <MazeStage {...stageProps} />
            </Physics>
          </Canvas>
        )}
      </SceneErrorBoundary>
    </div>
  );
}
