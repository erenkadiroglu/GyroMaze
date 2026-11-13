'use client';

import {
  useRef,
  useEffect,
  useMemo,
  useCallback,
  useState,
} from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import {
  Physics,
  RigidBody,
  BallCollider,
  RapierRigidBody,
} from '@react-three/rapier';
import * as THREE from 'three';
import {
  useGameStore,
  transientGyro,
  transientGyroP2,
} from '@/store/useGameStore';
import {
  getMazeLevel,
  findSafeP2SpawnOffset,
  getLevelRevisionKey,
  MazeLevelDefinition,
} from './mazeLevels';
import { soundEngine } from '@/utils/soundEngine';
import { calculateEarnedStars } from '@/utils/gameOutcomeUtils';
import { isLaserGateActive } from '@/utils/sceneUtils';
import { calculateOuterWallConfigs } from '@/utils/sceneGeometry';
import { isBallInsideGoal } from '@/utils/sceneCollisions';
import {
  calculateGoalRingRotation,
  calculateCrystalFloatTransform,
  calculateObstacleMeshPosition,
  calculateObstacleRotationY,
  updateTransientTelemetry,
  updateBallActorTransform,
} from '@/utils/sceneActorUtils';
import {
  _targetEuler,
  _targetQuat,
  _currentQuat,
  _currentEuler,
  _boardMaterial,
  BALL_RADIUS,
  applySceneThemeMaterials,
} from './sceneMaterials';
import { SceneErrorBoundary } from './SceneErrorBoundary';
import { SceneLights } from './SceneLights';
import { MazeCameraRig } from './MazeCameraRig';
import { MazeStageWalls } from './MazeStageWalls';
import { MazeStageHazards } from './MazeStageHazards';
import { MazeStageCollectibles } from './MazeStageCollectibles';
import { MazeStageActors } from './MazeStageActors';
import { MazeStageColliders } from './MazeStageColliders';
import { calculateSlerpAlpha } from '@/utils/sceneColliderUtils';
import {
  calculateClampedTiltAngles,
  calculateBallLinvelStep,
} from '@/utils/sceneTiltUtils';
import { useBallInteractions } from '@/hooks/useBallInteractions';
import { useGhostReplay } from '@/hooks/useGhostReplay';
import { useMotionTrail } from '@/hooks/useMotionTrail';

interface MazeStageProps {
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
function MazeStage({
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

  const resetSingleBall = useCallback(
    (body: RapierRigidBody | null, slot: 1 | 2) => {
      const [sx, , sz] = levelData.startPosition;
      const targetX = slot === 2 ? sx + p2SpawnOffsetX : sx;
      const targetZ = slot === 2 ? sz + p2SpawnOffsetZ : sz;

      resetInteractionCooldowns(slot);

      if (slot === 2) {
        transientGyroP2.ballX = targetX;
        transientGyroP2.ballZ = targetZ;
        transientGyroP2.ballSpeed = 0;
      } else {
        transientGyro.ballX = targetX;
        transientGyro.ballZ = targetZ;
        transientGyro.ballSpeed = 0;
      }

      if (!body) return;
      body.setTranslation({ x: targetX, y: BALL_RADIUS, z: targetZ }, true);
      body.setLinvel({ x: 0, y: 0, z: 0 }, true);
      body.setAngvel({ x: 0, y: 0, z: 0 }, true);
      if (slot === 1) {
        resetMotionTrail([sx, 0, sz]);
      }
    },
    [
      levelData.startPosition,
      p2SpawnOffsetX,
      p2SpawnOffsetZ,
      resetInteractionCooldowns,
      resetMotionTrail,
    ],
  );
  resetSingleBallRef.current = resetSingleBall;

  const resetBallAndBoard = useCallback(() => {
    _currentQuat.identity();
    if (visualTiltGroupRef.current) {
      visualTiltGroupRef.current.quaternion.identity();
    }
    resetRunPaths();
    hazardElapsedRef.current = 0;
    resetSingleBall(ballBodyRef.current, 1);
    resetSingleBall(ball2BodyRef.current, 2);
  }, [
    resetRunPaths,
    resetSingleBall,
  ]);
  resetBallAndBoardRef.current = resetBallAndBoard;

  useEffect(() => {
    resetBallAndBoard();
  }, [resetCount, levelRevisionKey, resetBallAndBoard]);

  const handleBallCollision = useCallback(
    (slot: 1 | 2) => {
      const body = slot === 2 ? ball2BodyRef.current : ballBodyRef.current;
      if (!body) return;
      const now = performance.now();
      if (now - lastWallSoundTimeRef.current[slot] < 95) return;

      const vel = body.linvel();
      const speed = Math.hypot(vel.x, vel.z);
      if (speed > 1.3) {
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
    for (let i = 0; i < levelData.crystals.length; i++) {
      const mesh = crystalMeshesRef.current[i];
      if (mesh && mesh.visible) {
        const { y, rotationY } = calculateCrystalFloatTransform(
          elapsed,
          i,
          mesh.rotation.y,
          safeDelta,
        );
        mesh.rotation.y = rotationY;
        mesh.position.y = y;
      }
    }

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
    for (let i = 0; i < levelData.laserGates.length; i++) {
      const gate = levelData.laserGates[i];
      const beamMesh = laserBeamMeshesRef.current[i];
      if (beamMesh) {
        beamMesh.visible = isLaserGateActive(
          hazardElapsed,
          gate.periodSeconds,
          gate.phaseOffset,
        );
      }
    }

    // Hareketli devriye engellerinin görsel konumunu kare başına güncelle
    const movingObstacles = levelData.movingObstacles ?? [];
    for (let i = 0; i < movingObstacles.length; i++) {
      const obs = movingObstacles[i];
      const mesh = movingObstacleMeshesRef.current[i];
      if (mesh) {
        mesh.position.set(...calculateObstacleMeshPosition(obs, hazardElapsed));
        mesh.rotation.y = calculateObstacleRotationY(
          mesh.rotation.y,
          isInteractive,
          safeDelta,
        );
      }
    }

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

      if (isInteractive && isGoalUnlocked) {
        if (isBallInsideGoal(pos, levelData.goalPosition, 0.2116)) {
          onReachGoal(runPathRef.current, 1);
        }
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

        // 2. Oyuncu ile 1. Oyuncu için birebir simetrik hedef portalı yarıçapı (0.46 birim)
        if (isInteractive && isGoalUnlocked) {
          if (isBallInsideGoal(pos2Val, levelData.goalPosition, 0.2116)) {
            onReachGoal(runPathP2Ref.current, 2);
          }
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

      {/* 1. Oyuncu Dinamik Fizik Küresi (Y ekseni kilitli -> Sıfır Zıplama!) */}
      <RigidBody
        ref={ballBodyRef}
        name="ball-p1"
        type="dynamic"
        colliders={false}
        position={[
          levelData.startPosition[0],
          BALL_RADIUS,
          levelData.startPosition[2],
        ]}
        enabledTranslations={[true, false, true]}
        enabledRotations={[false, false, false]}
        restitution={0.22}
        friction={0.08}
        ccd={true}
        onCollisionEnter={() => handleBallCollision(1)}
      >
        <BallCollider args={[BALL_RADIUS]} />
      </RigidBody>

      {/* Çok Oyunculu Modda 2. Oyuncu Dinamik Fizik Küresi */}
      {isMultiplayer && (
        <RigidBody
          ref={ball2BodyRef}
          name="ball-p2"
          type="dynamic"
          colliders={false}
          position={[
            levelData.startPosition[0] + p2SpawnOffsetX,
            BALL_RADIUS,
            levelData.startPosition[2] + p2SpawnOffsetZ,
          ]}
          enabledTranslations={[true, false, true]}
          enabledRotations={[false, false, false]}
          restitution={0.22}
          friction={0.08}
          ccd={true}
          onCollisionEnter={() => handleBallCollision(2)}
        >
          <BallCollider args={[BALL_RADIUS]} />
        </RigidBody>
      )}

      {/* 2. GÖRSEL 3B SAHNE GRUBU */}
      <group ref={visualTiltGroupRef}>
        <mesh
          position={[0, -0.25, 0]}
          material={_boardMaterial}
          receiveShadow
        >
          <boxGeometry args={[levelData.boardSize, 0.5, levelData.boardSize]} />
        </mesh>

        <gridHelper
          key={isLightBoard ? 'grid-light' : 'grid-dark'}
          args={[
            levelData.boardSize - 0.4,
            12,
            isLightBoard ? '#cbd5e1' : '#27272a',
            isLightBoard ? '#e2e8f0' : '#27272a',
          ]}
          position={[0, 0.01, 0]}
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

/**
 * Masaüstü ekranında tam ekran çalışan 3B WebGL sahnesi.
 */
export function MazeScene() {
  const level = useGameStore((s) => s.level);
  const customLevel = useGameStore((s) => s.customLevel);
  const isSoundMuted = useGameStore((s) => s.isSoundMuted);
  const collectedCrystals = useGameStore((s) => s.collectedCrystals);
  const ghostPaths = useGameStore((s) => s.ghostPaths);
  const colorScheme = useGameStore((s) => s.colorScheme);
  const boardTheme = useGameStore((s) => s.boardTheme);
  const collectCrystal = useGameStore((s) => s.collectCrystal);
  const recordLevelCompletion = useGameStore((s) => s.recordLevelCompletion);
  const triggerHaptic = useGameStore((s) => s.triggerHaptic);
  const triggerBallReset = useGameStore((s) => s.triggerBallReset);
  const showHudNotification = useGameStore((s) => s.showHudNotification);

  const lastLockedWarnTimeRef = useRef<number>(0);
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

  const isLightScene = colorScheme === 'light' || boardTheme === 'daylight';
  const sceneBgColor = isLightScene ? '#e9eef5' : '#0f1a2b';
  const shadowMargin = Math.max(9, Math.ceil(activeLevel.boardSize * 0.78));

  const isGoalUnlocked =
    collectedCrystals.length >= activeLevel.crystals.length;

  const handleCollectCrystal = useCallback(
    (idx: number) => {
      const liveCollected = useGameStore.getState().collectedCrystals;
      if (liveCollected.includes(idx)) return;

      const nextCount = liveCollected.length + 1;
      if (!isSoundMuted) {
        soundEngine.playCrystalPickup(nextCount);
      }
      triggerHaptic('crystal');
      collectCrystal(idx);

      if (nextCount >= activeLevel.crystals.length) {
        showHudNotification(
          '🔓 Tüm enerji kristalleri toplandı! Hedef Portalı açıldı!',
          'success',
        );
      }
    },
    [
      isSoundMuted,
      activeLevel.crystals.length,
      triggerHaptic,
      collectCrystal,
      showHudNotification,
    ],
  );

  const handleReachGoal = useCallback(
    (runPath: Array<[number, number]>, winnerSlot: 1 | 2 = 1) => {
      const state = useGameStore.getState();
      if (
        state.gameStatus !== 'playing' ||
        (typeof document !== 'undefined' && document.hidden)
      ) {
        return;
      }
      if (
        state.isPairingModalOpen ||
        state.isSettingsOpen ||
        state.isEditorOpen ||
        state.isLeaderboardOpen
      ) {
        return;
      }

      const goalUnlocked =
        state.collectedCrystals.length >= activeLevel.crystals.length;
      if (!goalUnlocked) {
        const now = performance.now();
        if (now - lastLockedWarnTimeRef.current > 1300) {
          lastLockedWarnTimeRef.current = now;
          if (!isSoundMuted) {
            soundEngine.playLockedPortal();
          }
          triggerHaptic('wall', winnerSlot);
          const remaining = Math.max(
            1,
            activeLevel.crystals.length - state.collectedCrystals.length,
          );
          showHudNotification(
            `🔒 Portal Kilitli! Önce kalan ${remaining} enerji kristalini toplayın.`,
            'warn',
          );
        }
        return;
      }

      if (!isSoundMuted) {
        const earnedStars = calculateEarnedStars(
          state.elapsedSeconds,
          activeLevel.starThresholds,
        );
        soundEngine.playVictory(earnedStars);
      }
      triggerHaptic('goal');
      recordLevelCompletion(
        activeLevel.id,
        state.elapsedSeconds,
        runPath,
        winnerSlot,
      );
    },
    [
      isSoundMuted,
      triggerHaptic,
      recordLevelCompletion,
      activeLevel.id,
      activeLevel.crystals.length,
      activeLevel.starThresholds,
      showHudNotification,
    ],
  );

  const handleFallIntoHole = useCallback(
    (slot: 1 | 2) => {
      if (!isSoundMuted) {
        soundEngine.playHoleFall();
      }
      triggerHaptic('hole', slot);
      if (!useGameStore.getState().isMultiplayer) {
        triggerBallReset();
      } else {
        showHudNotification(`Oyuncu ${slot} boşluğa düştü`, 'warn');
      }
    },
    [isSoundMuted, triggerHaptic, triggerBallReset, showHudNotification],
  );

  const handleLaserHit = useCallback(
    (slot: 1 | 2) => {
      if (!isSoundMuted) {
        soundEngine.playLaserZap();
      }
      triggerHaptic('laser', slot);
      if (!useGameStore.getState().isMultiplayer) {
        triggerBallReset();
      } else {
        showHudNotification(`Oyuncu ${slot} lazere çarptı`, 'warn');
      }
    },
    [isSoundMuted, triggerHaptic, triggerBallReset, showHudNotification],
  );

  const handleBoostHit = useCallback(
    (slot: 1 | 2) => {
      if (!isSoundMuted) {
        soundEngine.playBoostPad();
      }
      triggerHaptic('boost', slot);
    },
    [isSoundMuted, triggerHaptic],
  );

  const handleTeleportHit = useCallback(
    (slot: 1 | 2) => {
      if (!isSoundMuted) {
        soundEngine.playTeleport();
      }
      triggerHaptic('teleport', slot);
    },
    [isSoundMuted, triggerHaptic],
  );

  const handleWallHit = useCallback(
    (speed: number, slot: 1 | 2) => {
      if (!isSoundMuted) {
        soundEngine.playWallHit(Math.min(1, speed / 8));
      }
      if (speed > 2.4) {
        triggerHaptic('wall', slot);
      }
    },
    [isSoundMuted, triggerHaptic],
  );

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
