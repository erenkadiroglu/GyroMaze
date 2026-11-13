'use client';

import { useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { Physics } from '@react-three/rapier';
import { useGameStore } from '@/store/useGameStore';
import { getMazeLevel } from './mazeLevels';
import { SceneErrorBoundary } from './SceneErrorBoundary';
import { SceneLights } from './SceneLights';
import { MazeCameraRig } from './MazeCameraRig';
import { MazeStage } from './MazeStage';
import { ContextLostFallback } from './ContextLostFallback';
import { useMazeSceneEvents } from '@/hooks/useMazeSceneEvents';
import { useWebGLContextRecovery } from '@/hooks/useWebGLContextRecovery';
import {
  isLightSceneActive,
  resolveSceneColors,
  calculateShadowMargin,
} from '@/utils/sceneConfigUtils';
import {
  getSceneContainerClass,
  getSceneCanvasCameraConfig,
  getSceneGLConfig,
  getSceneDprRange,
  getScenePhysicsGravity,
} from '@/utils/sceneViewportUtils';

/**
 * Masaüstü ekranında tam ekran çalışan 3B WebGL sahnesi.
 * WebGL bağlam kesilmesi kurtarması, kamera teçhizatı, aydınlatma ve Rapier fizik simülasyonunu koordine eder.
 */
export function MazeScene() {
  const level = useGameStore((s) => s.level);
  const customLevel = useGameStore((s) => s.customLevel);
  const ghostPaths = useGameStore((s) => s.ghostPaths);
  const colorScheme = useGameStore((s) => s.colorScheme);
  const boardTheme = useGameStore((s) => s.boardTheme);

  const {
    isContextLost,
    canvasRevision,
    handleSceneRetry,
    attachContextListeners,
  } = useWebGLContextRecovery();

  const activeLevel = useMemo(
    () => getMazeLevel(level, customLevel),
    [level, customLevel],
  );

  const {
    isGoalUnlocked,
    collectedCrystals,
    handleCollectCrystal,
    handleReachGoal,
    handleFallIntoHole,
    handleLaserHit,
    handleBoostHit,
    handleTeleportHit,
    handleWallHit,
  } = useMazeSceneEvents({ activeLevel });

  const isLightScene = isLightSceneActive(colorScheme, boardTheme);
  const { sceneBgColor, fogNear, fogFar } = resolveSceneColors(isLightScene);
  const shadowMargin = calculateShadowMargin(activeLevel.boardSize);

  return (
    <div className={getSceneContainerClass()}>
      <SceneErrorBoundary key={canvasRevision} onRetry={handleSceneRetry}>
        {isContextLost ? (
          <ContextLostFallback onRetry={handleSceneRetry} />
        ) : (
          <Canvas
            key={canvasRevision}
            shadows
            dpr={getSceneDprRange()}
            gl={getSceneGLConfig()}
            camera={getSceneCanvasCameraConfig()}
            onCreated={({ gl }) => attachContextListeners(gl)}
          >
            <color attach="background" args={[sceneBgColor]} />
            <fog attach="fog" args={[sceneBgColor, fogNear, fogFar]} />

            <MazeCameraRig />

            <SceneLights
              isLightScene={isLightScene}
              shadowMargin={shadowMargin}
            />

            <Physics gravity={getScenePhysicsGravity()}>
              <MazeStage
                levelData={activeLevel}
                isGoalUnlocked={isGoalUnlocked}
                collectedCrystals={collectedCrystals}
                ghostPath={ghostPaths[activeLevel.id]}
                onCollectCrystal={handleCollectCrystal}
                onReachGoal={handleReachGoal}
                onFallIntoHole={handleFallIntoHole}
                onLaserHit={handleLaserHit}
                onBoostHit={handleBoostHit}
                onTeleportHit={handleTeleportHit}
                onWallHit={handleWallHit}
              />
            </Physics>
          </Canvas>
        )}
      </SceneErrorBoundary>
    </div>
  );
}
