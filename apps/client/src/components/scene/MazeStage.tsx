'use client';

import { useRef, useEffect, useMemo, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import { type RapierRigidBody } from '@react-three/rapier';
import type * as THREE from 'three';
import {
  useGameStore,
  transientGyro,
  transientGyroP2,
} from '@/store/useGameStore';
import {
  findSafeP2SpawnOffset,
  getLevelRevisionKey,
  MazeLevelDefinition,
} from './mazeLevels';
import { calculateOuterWallConfigs } from '@/utils/sceneGeometry';
import { canTriggerGoalReach } from '@/utils/sceneCollisions';
import {
  calculateGoalRingRotation,
  updateTransientTelemetry,
  updateBallActorTransform,
  updateCrystalsAnimation,
  updateLaserBeamsVisibility,
  updateMovingObstaclesTransform,
} from '@/utils/sceneActorUtils';
import {
  _targetEuler,
  _targetQuat,
  _currentQuat,
  _currentEuler,
  BALL_RADIUS,
  applySceneThemeMaterials,
} from './sceneMaterials';
import { MazeStageWalls } from './MazeStageWalls';
import { MazeStageHazards } from './MazeStageHazards';
import { MazeStageCollectibles } from './MazeStageCollectibles';
import { MazeStageActors } from './MazeStageActors';
import { MazeStageColliders } from './MazeStageColliders';
import { MazeStageBoardBase } from './stage/MazeStageBoardBase';
import { MazeStagePhysicsBalls } from './stage/MazeStagePhysicsBalls';
import { calculateSlerpAlpha } from '@/utils/sceneColliderUtils';
import {
  calculateClampedTiltAngles,
  calculateBallLinvelStep,
} from '@/utils/sceneTiltUtils';
import {
  shouldThrottleWallHit,
  isBallSpeedSufficientForWallHit,
} from '@/utils/sceneEventUtils';
import { useBallInteractions } from '@/hooks/useBallInteractions';
import { useGhostReplay } from '@/hooks/useGhostReplay';
import { useMotionTrail } from '@/hooks/useMotionTrail';
import { useMazeStageReset } from '@/hooks/useMazeStageReset';

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
  const gameStatus = useGameStore((s) => s.gameStatus);
  const isPairingModalOpen = useGameStore((s) => s.isPairingModalOpen);
  const isSettingsOpen = useGameStore((s) => s.isSettingsOpen);
  const isEditorOpen = useGameStore((s) => s.isEditorOpen);
  const isLeaderboardOpen = useGameStore((s) => s.isLeaderboardOpen);
  const boardTheme = useGameStore((s) => s.boardTheme);
  const colorScheme = useGameStore((s) => s.colorScheme);
  const ballSkin = useGameStore((s) => s.ballSkin);
  const isMultiplayer = useGameStore((s) => s.isMultiplayer);
  const gravityScale = useGameStore((s) => s.gravityScale);
  const tiltResponsiveness = useGameStore((s) => s.tiltResponsiveness);
  const showTrail = useGameStore((s) => s.showTrail);
  const showGhost = useGameStore((s) => s.showGhost);
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

  useFrame((state, delta) => {
    const safeDelta = Math.min(delta, 0.05);
    const elapsed = state.clock.elapsedTime;

    if (goalRingRef.current) {
      goalRingRef.current.rotation.z = calculateGoalRingRotation(
        goalRingRef.current.rotation.z,
        isGoalUnlocked,
        safeDelta,
      );
    }

    // Kristallerin havada süzülme ve dönme animasyonu
    updateCrystalsAnimation(
      crystalMeshesRef.current,
      levelData.crystals.length,
      elapsed,
      safeDelta,
    );

    const isPageHidden = typeof document !== 'undefined' && document.hidden;
    const isInteractive =
      gameStatus === 'playing' &&
      !isPageHidden &&
      !isPairingModalOpen &&
      !isSettingsOpen &&
      !isEditorOpen &&
      !isLeaderboardOpen;

    if (isInteractive) {
      hazardElapsedRef.current += safeDelta;
    }
    const hazardElapsed = hazardElapsedRef.current;

    // Lazer ışınlarının görünürlüğünü duraklatma duyarlı saatle kare başına güncelle
    updateLaserBeamsVisibility(
      laserBeamMeshesRef.current,
      levelData.laserGates,
      hazardElapsed,
    );

    // Hareketli devriye engellerinin görsel konumunu kare başına güncelle
    updateMovingObstaclesTransform(
      movingObstacleMeshesRef.current,
      levelData.movingObstacles ?? [],
      hazardElapsed,
      isInteractive,
      safeDelta,
    );

    const { pitchRad, rollRad } = calculateClampedTiltAngles(
      transientGyro.beta,
      transientGyro.gamma,
      isInteractive,
    );

    _targetEuler.set(pitchRad, 0, rollRad, 'XYZ');
    _targetQuat.setFromEuler(_targetEuler);

    // 1. Seçilen tepkisellik katsayısı (tiltResponsiveness) ile anında eğim tepkisi
    const slerpAlpha = calculateSlerpAlpha(tiltResponsiveness, safeDelta);
    _currentQuat.slerp(_targetQuat, slerpAlpha);
    _currentEuler.setFromQuaternion(_currentQuat, 'XYZ');

    if (visualTiltGroupRef.current) {
      visualTiltGroupRef.current.quaternion.copy(_currentQuat);
    }

    // 2. Fizik küresine eğim ivmesi, kristal toplama, lazer kontrolü ve neon iz güncellemesi
    if (ballBodyRef.current) {
      const nextVel = calculateBallLinvelStep(
        ballBodyRef.current.linvel(),
        { x: _currentEuler.x, z: _currentEuler.z },
        gravityScale,
        safeDelta,
        isInteractive,
      );
      ballBodyRef.current.setLinvel(nextVel, true);

      const pos = ballBodyRef.current.translation();
      const vel = ballBodyRef.current.linvel();
      updateTransientTelemetry(transientGyro, pos, vel);
      updateBallActorTransform(
        visualBallMeshRef.current,
        pos,
        vel,
        BALL_RADIUS,
        safeDelta,
      );

      // 10Hz Hayalet Yarışçı (Ghost Replay) Canlı Oynatımı ve Yol Kaydı
      const pos2 =
        isMultiplayer && ball2BodyRef.current
          ? ball2BodyRef.current.translation()
          : null;

      stepGhostReplay(
        safeDelta,
        isInteractive && gameStatus === 'playing',
        pos,
        pos2,
        ghostPath,
        showGhost,
        ghostBallMeshRef.current,
      );

      // Neon Hareket İzi (Motion Trail) halkalarını güncelle (Sıfır GC)
      stepMotionTrail(pos, showTrail);

      // 1. Oyuncu kristal, rampa, portal, lazer ve hareketli engel etkileşimleri
      processBallInteractions(
        ballBodyRef.current,
        pos,
        1,
        hazardElapsed,
        isInteractive,
      );

      if (canTriggerGoalReach(isInteractive, isGoalUnlocked, pos, levelData.goalPosition)) {
        onReachGoal(runPathRef.current, 1);
      }

      // Çok Oyunculu (2. Oyuncu - Altın Bilye) Fizik ve Tam Etkileşim Paritesi
      if (isMultiplayer && ball2BodyRef.current) {
        const p2Angles = calculateClampedTiltAngles(
          transientGyroP2.beta,
          transientGyroP2.gamma,
          isInteractive,
        );

        const nextV2 = calculateBallLinvelStep(
          ball2BodyRef.current.linvel(),
          { x: p2Angles.pitchRad, z: p2Angles.rollRad },
          gravityScale,
          safeDelta,
          isInteractive,
        );
        ball2BodyRef.current.setLinvel(nextV2, true);

        const pos2Val = ball2BodyRef.current.translation();
        const vel2 = ball2BodyRef.current.linvel();
        updateTransientTelemetry(transientGyroP2, pos2Val, vel2);
        updateBallActorTransform(
          visualBall2MeshRef.current,
          pos2Val,
          vel2,
          BALL_RADIUS,
          safeDelta,
          true,
        );

        // 2. Oyuncu için tüm kristal, rampa, portal, lazer ve hareketli engel kontrolleri
        processBallInteractions(
          ball2BodyRef.current,
          pos2Val,
          2,
          hazardElapsed,
          isInteractive,
        );

        // 2. Oyuncu ile 1. Oyuncu için birebir simetrik hedef portalı
        if (canTriggerGoalReach(isInteractive, isGoalUnlocked, pos2Val, levelData.goalPosition)) {
          onReachGoal(runPathP2Ref.current, 2);
        }
      } else if (visualBall2MeshRef.current) {
        visualBall2MeshRef.current.visible = false;
      }
    }
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
