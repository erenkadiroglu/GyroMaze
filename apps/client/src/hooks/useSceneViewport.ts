'use client';

import { useMemo } from 'react';
import { useGameStore } from '@/store/useGameStore';
import { useMazeSceneEvents } from './useMazeSceneEvents';
import { useWebGLContextRecovery } from './useWebGLContextRecovery';
import {
  resolveSceneViewportState,
  resolveSceneStageProps,
  type ResolvedSceneViewportState,
} from '@/utils/sceneViewportOrchestrationUtils';
import type { MazeStageProps } from '@/components/scene/MazeStage';

export interface UseSceneViewportReturn {
  viewportState: ResolvedSceneViewportState;
  stageProps: MazeStageProps;
  isContextLost: boolean;
  canvasRevision: number;
  handleSceneRetry: () => void;
  attachContextListeners: (gl: import('three').WebGLRenderer) => void;
}

/**
 * 3B Labirent Sahnesi (MazeScene) Görünüm Orkestrasyon Kancası.
 * Zustand durum deposu, WebGL bağlam kurtarma döngüsü ve labirent sahne olaylarını
 * saf orkestrasyon motoruyla birleştirerek MazeScene bileşenine tek elden sunar.
 */
export function useSceneViewport(): UseSceneViewportReturn {
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

  const initialViewportState = useMemo(() => {
    return resolveSceneViewportState({
      level,
      customLevel,
      colorScheme,
      boardTheme,
      isContextLost,
      canvasRevision,
    });
  }, [level, customLevel, colorScheme, boardTheme, isContextLost, canvasRevision]);

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
  } = useMazeSceneEvents({ activeLevel: initialViewportState.activeLevel });

  const viewportState = useMemo(() => {
    return resolveSceneViewportState({
      level,
      customLevel,
      colorScheme,
      boardTheme,
      isContextLost,
      canvasRevision,
      isGoalUnlocked,
      remainingCrystalsCount:
        initialViewportState.activeLevel.crystals.length -
        collectedCrystals.length,
    });
  }, [
    level,
    customLevel,
    colorScheme,
    boardTheme,
    isContextLost,
    canvasRevision,
    isGoalUnlocked,
    initialViewportState.activeLevel.crystals.length,
    collectedCrystals.length,
  ]);

  const stageProps = useMemo(() => {
    return resolveSceneStageProps({
      levelData: viewportState.activeLevel,
      isGoalUnlocked,
      collectedCrystals,
      ghostPath: ghostPaths[viewportState.activeLevel.id],
      onCollectCrystal: handleCollectCrystal,
      onReachGoal: handleReachGoal,
      onFallIntoHole: handleFallIntoHole,
      onLaserHit: handleLaserHit,
      onBoostHit: handleBoostHit,
      onTeleportHit: handleTeleportHit,
      onWallHit: handleWallHit,
    });
  }, [
    viewportState.activeLevel,
    isGoalUnlocked,
    collectedCrystals,
    ghostPaths,
    handleCollectCrystal,
    handleReachGoal,
    handleFallIntoHole,
    handleLaserHit,
    handleBoostHit,
    handleTeleportHit,
    handleWallHit,
  ]);

  return {
    viewportState,
    stageProps,
    isContextLost,
    canvasRevision,
    handleSceneRetry,
    attachContextListeners,
  };
}

