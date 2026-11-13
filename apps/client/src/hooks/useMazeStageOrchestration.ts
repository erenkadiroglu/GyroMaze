'use client';

import { useRef, useEffect, useMemo, useCallback } from 'react';
import type { RapierRigidBody } from '@react-three/rapier';
import type * as THREE from 'three';
import { useGameStore } from '@/store/useGameStore';
import {
  findSafeP2SpawnOffset,
  getLevelRevisionKey,
  type MazeLevelDefinition,
} from '../components/scene/mazeLevels';
import { calculateOuterWallConfigs } from '@/utils/sceneGeometry';
import { BALL_RADIUS, applySceneThemeMaterials } from '../components/scene/sceneMaterials';
import { useBallInteractions } from './useBallInteractions';
import { useGhostReplay } from './useGhostReplay';
import { useMotionTrail } from './useMotionTrail';
import { useMazeStageReset } from './useMazeStageReset';
import { useMazeStageFrameLoop } from './useMazeStageFrameLoop';
import {
  isLightBoardTheme,
  calculateBallVelocitySpeed,
  shouldTriggerWallSound,
} from '@/utils/stageOrchestrationUtils';

export interface UseMazeStageOrchestrationParams {
  levelData: MazeLevelDefinition;
  isGoalUnlocked: boolean;
  collectedCrystals: number[];
  ghostPath?: Array<[number, number]>;
  onCollectCrystal: (idx: number) => void;
  onReachGoal: (runPath: Array<[number, number]>, winnerSlot?: 1 | 2) => void;
  onFallIntoHole: (slot: 1 | 2) => void;
  onLaserHit: (slot: 1 | 2) => void;
  onBoostHit: (slot: 1 | 2) => void;
  onTeleportHit: (slot: 1 | 2) => void;
  onWallHit: (speed: number, slot: 1 | 2) => void;
}

/**
 * 3B Labirent sahnesi orkestrasyon kancası:
 * Ref nesneleri, fizik çarpışmaları, tema senkronizasyonu, hareket izi,
 * hayalet yarışçı ve 60 FPS kare döngüsü yaşam döngüsünü yönetir.
 */
export function useMazeStageOrchestration({
  levelData,
  isGoalUnlocked,
  collectedCrystals,
  ghostPath,
  onCollectCrystal,
  onReachGoal,
  onFallIntoHole: _onFallIntoHole,
  onLaserHit,
  onBoostHit,
  onTeleportHit,
  onWallHit,
}: UseMazeStageOrchestrationParams) {
  const ballBodyRef = useRef<RapierRigidBody | null>(null);
  const ball2BodyRef = useRef<RapierRigidBody | null>(null);
  const visualTiltGroupRef = useRef<THREE.Group | null>(null);
  const visualBallMeshRef = useRef<THREE.Mesh | null>(null);
  const visualBall2MeshRef = useRef<THREE.Mesh | null>(null);
  const ghostBallMeshRef = useRef<THREE.Mesh | null>(null);
  const goalRingRef = useRef<THREE.Mesh | null>(null);
  const crystalMeshesRef = useRef<Array<THREE.Mesh | null>>([]);
  const laserBeamMeshesRef = useRef<Array<THREE.Mesh | null>>([]);
  const movingObstacleMeshesRef = useRef<Array<THREE.Mesh | null>>([]);
  const hazardElapsedRef = useRef<number>(0);
  const lastWallSoundTimeRef = useRef<{ 1: number; 2: number }>({ 1: 0, 2: 0 });
  const lastHoleHitMsRef = useRef<{ 1: number; 2: number }>({ 1: 0, 2: 0 });

  const resetCount = useGameStore((s) => s.resetCount);
  const boardTheme = useGameStore((s) => s.boardTheme);
  const colorScheme = useGameStore((s) => s.colorScheme);
  const ballSkin = useGameStore((s) => s.ballSkin);
  const isMultiplayer = useGameStore((s) => s.isMultiplayer);
  const isLightBoard = isLightBoardTheme(colorScheme, boardTheme);

  // Seçilen 3B görsel temaya göre paylaşılan materyal renklerini güncelle
  useEffect(() => {
    applySceneThemeMaterials(boardTheme, colorScheme, isLightBoard, ballSkin);
  }, [boardTheme, colorScheme, isLightBoard, ballSkin]);

  const outerWalls = useMemo(
    () => calculateOuterWallConfigs(levelData.boardSize),
    [levelData.boardSize],
  );

  const levelRevisionKey = useMemo(
    () => getLevelRevisionKey(levelData),
    [levelData],
  );
  const [p2SpawnOffsetX, p2SpawnOffsetZ] = useMemo(
    () => findSafeP2SpawnOffset(levelData, BALL_RADIUS),
    [levelData],
  );

  const {
    trailMeshesRef,
    trailHistoryRef,
    stepMotionTrail,
    resetMotionTrail,
  } = useMotionTrail({
    startPosition: levelData.startPosition,
  });

  const {
    runPathRef,
    runPathP2Ref,
    resetRunPaths,
    stepGhostReplay,
  } = useGhostReplay({
    startPosition: levelData.startPosition,
    p2SpawnOffsetX,
    p2SpawnOffsetZ,
  });

  const resetSingleBallRef = useRef<
    ((body: RapierRigidBody | null, slot: 1 | 2) => void) | null
  >(null);
  const resetBallAndBoardRef = useRef<(() => void) | null>(null);

  const { processBallInteractions, resetInteractionCooldowns } =
    useBallInteractions({
      levelData,
      isMultiplayer,
      trailHistoryRef,
      onCollectCrystal,
      onBoostHit,
      onTeleportHit,
      onLaserHit,
      onWallHit,
      resetSingleBall: (b, s) => resetSingleBallRef.current?.(b, s),
      resetBallAndBoard: () => resetBallAndBoardRef.current?.(),
    });

  const { resetSingleBall, resetBallAndBoard } = useMazeStageReset({
    startPosition: levelData.startPosition,
    p2SpawnOffsetX,
    p2SpawnOffsetZ,
    resetCount,
    levelRevisionKey,
    ballBodyRef,
    ball2BodyRef,
    visualTiltGroupRef,
    hazardElapsedRef,
    resetInteractionCooldowns,
    resetMotionTrail,
    resetRunPaths,
  });
  resetSingleBallRef.current = resetSingleBall;
  resetBallAndBoardRef.current = resetBallAndBoard;

  const handleBallCollision = useCallback(
    (slot: 1 | 2) => {
      const body = slot === 2 ? ball2BodyRef.current : ballBodyRef.current;
      if (!body) return;
      const now = performance.now();
      const vel = body.linvel();
      const speed = calculateBallVelocitySpeed(vel);

      if (shouldTriggerWallSound(now, lastWallSoundTimeRef.current[slot], speed)) {
        lastWallSoundTimeRef.current[slot] = now;
        onWallHit(speed, slot);
      }
    },
    [onWallHit],
  );

  useMazeStageFrameLoop({
    levelData,
    isGoalUnlocked,
    isMultiplayer,
    ghostPath,
    onReachGoal,
    ballBodyRef,
    ball2BodyRef,
    visualTiltGroupRef,
    visualBallMeshRef,
    visualBall2MeshRef,
    ghostBallMeshRef,
    goalRingRef,
    crystalMeshesRef,
    laserBeamMeshesRef,
    movingObstacleMeshesRef,
    hazardElapsedRef,
    runPathRef,
    runPathP2Ref,
    stepGhostReplay,
    stepMotionTrail,
    processBallInteractions,
  });

  return {
    outerWalls,
    levelRevisionKey,
    p2SpawnOffsetX,
    p2SpawnOffsetZ,
    isLightBoard,
    isMultiplayer,
    ballBodyRef,
    ball2BodyRef,
    visualTiltGroupRef,
    visualBallMeshRef,
    visualBall2MeshRef,
    ghostBallMeshRef,
    goalRingRef,
    crystalMeshesRef,
    laserBeamMeshesRef,
    movingObstacleMeshesRef,
    trailMeshesRef,
    runPathRef,
    runPathP2Ref,
    lastHoleHitMsRef,
    resetSingleBall,
    resetBallAndBoard,
    handleBallCollision,
  };
}
