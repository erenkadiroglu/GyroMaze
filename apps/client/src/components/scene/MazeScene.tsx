'use client';

import {
  useRef,
  useEffect,
  useMemo,
  useCallback,
  useState,
} from 'react';
import { Canvas } from '@react-three/fiber';
import { Physics } from '@react-three/rapier';
import { useGameStore } from '@/store/useGameStore';
import { getMazeLevel } from './mazeLevels';
import { SceneErrorBoundary } from './SceneErrorBoundary';
import { SceneLights } from './SceneLights';
import { MazeCameraRig } from './MazeCameraRig';
import { MazeStage } from './MazeStage';
import { useMazeSceneEvents } from '@/hooks/useMazeSceneEvents';

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

  const contextCleanupRef = useRef<(() => void) | null>(null);
  const [isContextLost, setIsContextLost] = useState(false);
  const [canvasRevision, setCanvasRevision] = useState(0);

  useEffect(() => {
    return () => {
      contextCleanupRef.current?.();
      contextCleanupRef.current = null;
    };
  }, []);

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

  const isLightScene = colorScheme === 'light' || boardTheme === 'daylight';
  const sceneBgColor = isLightScene ? '#e9eef5' : '#0f1a2b';
  const shadowMargin = Math.max(9, Math.ceil(activeLevel.boardSize * 0.78));

  const handleSceneRetry = useCallback(() => {
    setIsContextLost(false);
    setCanvasRevision((prev) => prev + 1);
  }, []);

  return (
    <div
      className="fixed inset-0 z-0 h-screen w-screen bg-base transition-colors duration-300"
    >
      <SceneErrorBoundary key={canvasRevision} onRetry={handleSceneRetry}>
        {isContextLost ? (
          <div className="flex h-full w-full flex-col items-center justify-center bg-base p-6 text-center text-fg">
            <div className="max-w-sm rounded-2xl border border-line bg-surface p-6 shadow-xl">
              <h2 className="text-base font-semibold">
                3B grafik bağlamı kesildi
              </h2>
              <p className="mt-2 text-xs leading-relaxed text-muted">
                Tarayıcı WebGL bağlamını geçici olarak serbest bıraktı.
              </p>
              <button
                type="button"
                onClick={handleSceneRetry}
                className="mt-4 min-h-10 cursor-pointer rounded-xl bg-brass px-4 text-xs font-semibold text-brass-fg"
              >
                Sahneyi yeniden başlat
              </button>
            </div>
          </div>
        ) : (
          <Canvas
            key={canvasRevision}
            shadows
            dpr={[1, 1.5]}
            gl={{ powerPreference: 'high-performance', antialias: true }}
            camera={{ position: [0, 14.5, 10.2], fov: 42, near: 0.1, far: 60 }}
            onCreated={({ gl }) => {
              contextCleanupRef.current?.();
              const dom = gl.domElement;
              const handleContextLost = (e: Event) => {
                e.preventDefault();
                setIsContextLost(true);
              };
              const handleContextRestored = () => {
                setIsContextLost(false);
              };
              dom.addEventListener('webglcontextlost', handleContextLost);
              dom.addEventListener('webglcontextrestored', handleContextRestored);
              contextCleanupRef.current = () => {
                dom.removeEventListener('webglcontextlost', handleContextLost);
                dom.removeEventListener(
                  'webglcontextrestored',
                  handleContextRestored,
                );
              };
            }}
          >
            <color attach="background" args={[sceneBgColor]} />
            <fog attach="fog" args={[sceneBgColor, 18, 38]} />

            <MazeCameraRig />

            <SceneLights
              isLightScene={isLightScene}
              shadowMargin={shadowMargin}
            />

            <Physics gravity={[0, 0, 0]}>
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
