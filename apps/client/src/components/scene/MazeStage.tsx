'use client';

import { useRef, useEffect, useMemo, useCallback } from 'react';
import { type RapierRigidBody } from '@react-three/rapier';
import type * as THREE from 'three';
import { useGameStore } from '@/store/useGameStore';
import {
  findSafeP2SpawnOffset,
  getLevelRevisionKey,
  MazeLevelDefinition,
} from './mazeLevels';
import { calculateOuterWallConfigs } from '@/utils/sceneGeometry';
import { BALL_RADIUS, applySceneThemeMaterials } from './sceneMaterials';
import { MazeStageWalls } from './MazeStageWalls';
import { MazeStageHazards } from './MazeStageHazards';
import { MazeStageCollectibles } from './MazeStageCollectibles';
import { MazeStageActors } from './MazeStageActors';
import { MazeStageColliders } from './MazeStageColliders';
import { MazeStageBoardBase } from './stage/MazeStageBoardBase';
import { MazeStagePhysicsBalls } from './stage/MazeStagePhysicsBalls';
import {
  shouldThrottleWallHit,
  isBallSpeedSufficientForWallHit,
} from '@/utils/sceneEventUtils';
import { useBallInteractions } from '@/hooks/useBallInteractions';
import { useGhostReplay } from '@/hooks/useGhostReplay';
import { useMotionTrail } from '@/hooks/useMotionTrail';
import { useMazeStageReset } from '@/hooks/useMazeStageReset';
import { useMazeStageFrameLoop } from '@/hooks/useMazeStageFrameLoop';

export interface MazeStageProps {
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
 * Zıplamasız (Zero-Bounce), Enerji Kristalli, Lazer Kapılı, Hızlandırma Rampalı, Kuantum Portallı ve Hayalet Yarışçılı 3B Labirent Sahnesi.
 */
export function MazeStage({
  levelData,
  isGoalUnlocked,
  collectedCrystals,
  ghostPath,
  onCollectCrystal,
  onReachGoal,
  onFallIntoHole,
  onLaserHit,
  onBoostHit,
  onTeleportHit,
  onWallHit,
}: MazeStageProps) {
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
  const isLightBoard = colorScheme === 'light' || boardTheme === 'daylight';

  // Seçilen 3B görsel temaya, Aydınlık/Karanlık moda ve Bilye Kaplamasına (Skin) göre paylaşılan materyal renklerini güncelle
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
      if (shouldThrottleWallHit(now, lastWallSoundTimeRef.current[slot])) return;

      const vel = body.linvel();
      const speed = Math.hypot(vel.x, vel.z);
      if (isBallSpeedSufficientForWallHit(speed)) {
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

  return (
    <>
      {/* 1. SABİT FİZİK ÇARPIŞTIRICILARI (TAHTA-YEREL UZAY) */}
      <MazeStageColliders
        levelRevisionKey={levelRevisionKey}
        levelData={levelData}
        outerWalls={outerWalls}
        runPathRef={runPathRef}
        runPathP2Ref={runPathP2Ref}
        lastHoleHitMsRef={lastHoleHitMsRef}
        isMultiplayer={isMultiplayer}
        ballBodyRef={ballBodyRef}
        ball2BodyRef={ball2BodyRef}
        onReachGoal={onReachGoal}
        onFallIntoHole={onFallIntoHole}
        resetSingleBall={resetSingleBall}
        resetBallAndBoard={resetBallAndBoard}
      />

      {/* 1. ve 2. Oyuncu Dinamik Fizik Küreleri (Y ekseni kilitli -> Sıfır Zıplama!) */}
      <MazeStagePhysicsBalls
        ballBodyRef={ballBodyRef}
        ball2BodyRef={ball2BodyRef}
        startPosition={levelData.startPosition}
        p2SpawnOffsetX={p2SpawnOffsetX}
        p2SpawnOffsetZ={p2SpawnOffsetZ}
        isMultiplayer={isMultiplayer}
        onBallCollision={handleBallCollision}
      />

      {/* 2. GÖRSEL 3B SAHNE GRUBU */}
      <group ref={visualTiltGroupRef}>
        {/* Tahta Tabanı ve Izgara Yardımcısı */}
        <MazeStageBoardBase
          boardSize={levelData.boardSize}
          isLightBoard={isLightBoard}
        />

        {/* İç ve Dış Duvarlar */}
        <MazeStageWalls
          levelRevisionKey={levelRevisionKey}
          outerWalls={outerWalls}
          innerWalls={levelData.innerWalls}
        />

        {/* Tehlikeler ve Kinetik Engeller */}
        <MazeStageHazards
          levelRevisionKey={levelRevisionKey}
          voidHoles={levelData.voidHoles}
          boostPads={levelData.boostPads}
          teleporters={levelData.teleporters}
          laserGates={levelData.laserGates}
          movingObstacles={levelData.movingObstacles}
          laserBeamMeshesRef={laserBeamMeshesRef}
          movingObstacleMeshesRef={movingObstacleMeshesRef}
        />

        {/* Toplanabilirler, Başlangıç Halkası ve Hedef Portalı */}
        <MazeStageCollectibles
          levelRevisionKey={levelRevisionKey}
          startPosition={levelData.startPosition}
          goalPosition={levelData.goalPosition}
          crystals={levelData.crystals}
          collectedCrystals={collectedCrystals}
          isGoalUnlocked={isGoalUnlocked}
          crystalMeshesRef={crystalMeshesRef}
          goalRingRef={goalRingRef}
        />

        {/* Bilyeler, Hayalet Yarışçı ve Hareket İzi */}
        <MazeStageActors
          startPosition={levelData.startPosition}
          p2SpawnOffsetX={p2SpawnOffsetX}
          p2SpawnOffsetZ={p2SpawnOffsetZ}
          trailMeshesRef={trailMeshesRef}
          ghostBallMeshRef={ghostBallMeshRef}
          visualBallMeshRef={visualBallMeshRef}
          visualBall2MeshRef={visualBall2MeshRef}
        />
      </group>
    </>
  );
}
