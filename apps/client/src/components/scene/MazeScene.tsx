'use client';

import {
  Component,
  ErrorInfo,
  ReactNode,
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
  CuboidCollider,
  CylinderCollider,
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
import {
  isLaserGateActive,
  calculateMovingObstacleOffset,
  calculateCameraTargetTransform,
  calculateGhostPlaybackCoord,
  calculateTrailScale,
  resolveThemePalette,
  resolveBallSkinColors,
} from '@/utils/sceneUtils';

// Garbage Collection (GC) duraksamalarını önlemek için modül seviyesinde önceden ayrılmış nesneler
const _targetEuler = new THREE.Euler(0, 0, 0, 'XYZ');
const _targetQuat = new THREE.Quaternion();
const _currentQuat = new THREE.Quaternion();
const _currentEuler = new THREE.Euler(0, 0, 0, 'XYZ');
const _cameraTargetPos = new THREE.Vector3(0, 14.5, 10.2);
const _cameraLookAt = new THREE.Vector3(0, 0, 0);

// GPU Shader ve bellek optimizasyonu için paylaşılan (singleton) materyaller
const _boardMaterial = new THREE.MeshStandardMaterial({
  color: '#18181b',
  roughness: 0.55,
  metalness: 0.25,
});
const _outerWallMaterial = new THREE.MeshStandardMaterial({
  color: '#27272a',
  roughness: 0.35,
  metalness: 0.45,
});
const _innerWallMaterial = new THREE.MeshStandardMaterial({
  color: '#3f3f46',
  roughness: 0.3,
  metalness: 0.5,
});
const _ballMaterial = new THREE.MeshStandardMaterial({
  color: '#f4f4f5',
  metalness: 0.88,
  roughness: 0.14,
});
const _holeCoreMaterial = new THREE.MeshBasicMaterial({ color: '#050507' });
const _holeRingMaterial = new THREE.MeshStandardMaterial({
  color: '#f43f5e',
  emissive: '#e11d48',
  emissiveIntensity: 1.4,
});
const _goalUnlockedRingMaterial = new THREE.MeshStandardMaterial({
  color: '#10b981',
  emissive: '#10b981',
  emissiveIntensity: 1.7,
  roughness: 0.2,
});
const _goalLockedRingMaterial = new THREE.MeshStandardMaterial({
  color: '#f59e0b',
  emissive: '#d97706',
  emissiveIntensity: 1.1,
  roughness: 0.3,
});
const _goalUnlockedCoreMaterial = new THREE.MeshBasicMaterial({
  color: '#34d399',
  transparent: true,
  opacity: 0.38,
});
const _goalLockedCoreMaterial = new THREE.MeshBasicMaterial({
  color: '#fbbf24',
  transparent: true,
  opacity: 0.22,
});
const _startRingMaterial = new THREE.MeshBasicMaterial({
  color: '#38bdf8',
  transparent: true,
  opacity: 0.65,
});
const _crystalMaterial = new THREE.MeshStandardMaterial({
  color: '#38bdf8',
  emissive: '#0284c7',
  emissiveIntensity: 1.6,
  roughness: 0.15,
  metalness: 0.8,
});
const _laserBeamMaterial = new THREE.MeshBasicMaterial({
  color: '#fb7185',
  transparent: true,
  opacity: 0.88,
});
const _laserPillarMaterial = new THREE.MeshStandardMaterial({
  color: '#52525b',
  metalness: 0.7,
  roughness: 0.25,
});
const _trailMaterial = new THREE.MeshBasicMaterial({
  color: '#38bdf8',
  transparent: true,
  opacity: 0.28,
});
const _boostBaseMaterial = new THREE.MeshBasicMaterial({
  color: '#a855f7',
  transparent: true,
  opacity: 0.25,
});
const _boostArrowMaterial = new THREE.MeshStandardMaterial({
  color: '#c084fc',
  emissive: '#9333ea',
  emissiveIntensity: 1.8,
});
const _teleporterRingMaterial = new THREE.MeshStandardMaterial({
  color: '#22d3ee',
  emissive: '#06b6d4',
  emissiveIntensity: 1.9,
});
const _teleporterCoreMaterial = new THREE.MeshBasicMaterial({
  color: '#67e8f9',
  transparent: true,
  opacity: 0.32,
});
const _ghostBallMaterial = new THREE.MeshStandardMaterial({
  color: '#34d399',
  emissive: '#10b981',
  emissiveIntensity: 1.4,
  transparent: true,
  opacity: 0.36,
});
const _movingObstacleMaterial = new THREE.MeshStandardMaterial({
  color: '#f97316',
  emissive: '#ea580c',
  emissiveIntensity: 1.35,
  roughness: 0.25,
  metalness: 0.65,
});
const _ball2Material = new THREE.MeshStandardMaterial({
  color: '#f59e0b',
  emissive: '#d97706',
  emissiveIntensity: 0.45,
  metalness: 0.88,
  roughness: 0.16,
});

const MAX_TILT_RADIANS = THREE.MathUtils.degToRad(24);
const BALL_RADIUS = 0.34;
const TRAIL_COUNT = 7;

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
  const trailMeshesRef = useRef<Array<THREE.Mesh | null>>([]);
  const trailHistoryRef = useRef<Array<{ x: number; z: number }>>(
    Array.from({ length: TRAIL_COUNT }, () => ({
      x: levelData.startPosition[0],
      z: levelData.startPosition[2],
    })),
  );
  const runPathRef = useRef<Array<[number, number]>>([]);
  const runPathP2Ref = useRef<Array<[number, number]>>([]);
  const runElapsedRef = useRef<number>(0);
  const hazardElapsedRef = useRef<number>(0);
  const lastSampleTimeRef = useRef<number>(0);
  const lastWallSoundTimeRef = useRef<{ 1: number; 2: number }>({ 1: 0, 2: 0 });
  const lastBoostTimeRef = useRef<{ 1: number; 2: number }>({ 1: -1, 2: -1 });
  const lastTeleportTimeRef = useRef<{ 1: number; 2: number }>({ 1: -1, 2: -1 });
  const lastMovingHitTimeRef = useRef<{ 1: number; 2: number }>({ 1: -1, 2: -1 });
  const lastHazardResetTimeRef = useRef<{ 1: number; 2: number }>({
    1: -1,
    2: -1,
  });
  const lastHoleHitMsRef = useRef<{ 1: number; 2: number }>({ 1: 0, 2: 0 });

  const resetCount = useGameStore((s) => s.resetCount);
  const gameStatus = useGameStore((s) => s.gameStatus);
  const isPairingModalOpen = useGameStore((s) => s.isPairingModalOpen);
  const isSettingsOpen = useGameStore((s) => s.isSettingsOpen);
  const isEditorOpen = useGameStore((s) => s.isEditorOpen);
  const isLeaderboardOpen = useGameStore((s) => s.isLeaderboardOpen);
  const cameraMode = useGameStore((s) => s.cameraMode);
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
    const themePalette = resolveThemePalette(boardTheme, colorScheme);
    _boardMaterial.color.set(themePalette.boardColor);
    _boardMaterial.roughness = themePalette.boardRoughness;
    _boardMaterial.metalness = themePalette.boardMetalness;
    _outerWallMaterial.color.set(themePalette.outerWallColor);
    _innerWallMaterial.color.set(themePalette.innerWallColor);
    _trailMaterial.color.set(themePalette.trailColor);

    const skinColors = resolveBallSkinColors(ballSkin, isLightBoard);
    _ballMaterial.color.set(skinColors.color);
    _ballMaterial.emissive.set(skinColors.emissive);
    _ballMaterial.emissiveIntensity = skinColors.emissiveIntensity;
    if (skinColors.trailColor) {
      _trailMaterial.color.set(skinColors.trailColor);
    }
  }, [boardTheme, colorScheme, isLightBoard, ballSkin]);

  const halfBoard = levelData.boardSize / 2;
  const wallHeight = 0.85;
  const wallThickness = 0.4;

  const outerWalls = useMemo(
    () => [
      {
        position: [0, wallHeight / 2, -halfBoard] as [number, number, number],
        size: [
          levelData.boardSize + wallThickness,
          wallHeight,
          wallThickness,
        ] as [number, number, number],
      },
      {
        position: [0, wallHeight / 2, halfBoard] as [number, number, number],
        size: [
          levelData.boardSize + wallThickness,
          wallHeight,
          wallThickness,
        ] as [number, number, number],
      },
      {
        position: [-halfBoard, wallHeight / 2, 0] as [number, number, number],
        size: [wallThickness, wallHeight, levelData.boardSize] as [
          number,
          number,
          number,
        ],
      },
      {
        position: [halfBoard, wallHeight / 2, 0] as [number, number, number],
        size: [wallThickness, wallHeight, levelData.boardSize] as [
          number,
          number,
          number,
        ],
      },
    ],
    [halfBoard, levelData.boardSize],
  );

  const levelRevisionKey = useMemo(
    () => getLevelRevisionKey(levelData),
    [levelData],
  );
  const [p2SpawnOffsetX, p2SpawnOffsetZ] = useMemo(
    () => findSafeP2SpawnOffset(levelData, BALL_RADIUS),
    [levelData],
  );

  const resetSingleBall = useCallback(
    (body: RapierRigidBody | null, slot: 1 | 2) => {
      const [sx, , sz] = levelData.startPosition;
      const targetX = slot === 2 ? sx + p2SpawnOffsetX : sx;
      const targetZ = slot === 2 ? sz + p2SpawnOffsetZ : sz;

      lastBoostTimeRef.current[slot] = -1;
      lastTeleportTimeRef.current[slot] = -1;
      lastMovingHitTimeRef.current[slot] = -1;
      lastHazardResetTimeRef.current[slot] = -1;

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
        for (let i = 0; i < TRAIL_COUNT; i++) {
          trailHistoryRef.current[i].x = sx;
          trailHistoryRef.current[i].z = sz;
        }
      }
    },
    [levelData.startPosition, p2SpawnOffsetX, p2SpawnOffsetZ],
  );

  const resetBallAndBoard = useCallback(() => {
    _currentQuat.identity();
    if (visualTiltGroupRef.current) {
      visualTiltGroupRef.current.quaternion.identity();
    }
    const [sx, , sz] = levelData.startPosition;
    runPathRef.current = [[Number(sx.toFixed(2)), Number(sz.toFixed(2))]];
    runPathP2Ref.current = [
      [
        Number((sx + p2SpawnOffsetX).toFixed(2)),
        Number((sz + p2SpawnOffsetZ).toFixed(2)),
      ],
    ];
    runElapsedRef.current = 0;
    hazardElapsedRef.current = 0;
    lastSampleTimeRef.current = 0;
    resetSingleBall(ballBodyRef.current, 1);
    resetSingleBall(ball2BodyRef.current, 2);
  }, [
    levelData.startPosition,
    p2SpawnOffsetX,
    p2SpawnOffsetZ,
    resetSingleBall,
  ]);

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

  const processBallInteractions = useCallback(
    (
      body: RapierRigidBody,
      pos: { x: number; z: number },
      slot: 1 | 2,
      elapsed: number,
      isInteractive: boolean,
    ) => {
      if (!isInteractive) return;

      // Enerji Kristali Toplama Kontrolü (Senkron store okuma ile çift tetiklenme engelli)
      const liveCollected = useGameStore.getState().collectedCrystals;
      for (let i = 0; i < levelData.crystals.length; i++) {
        if (!liveCollected.includes(i)) {
          const [cx, cz] = levelData.crystals[i];
          const dx = pos.x - cx;
          const dz = pos.z - cz;
          if (dx * dx + dz * dz < 0.42) {
            onCollectCrystal(i);
          }
        }
      }

      // Hızlandırma Rampaları (Boost Pads) Kontrolü
      const boostPads = levelData.boostPads;
      if (boostPads && elapsed - lastBoostTimeRef.current[slot] > 0.45) {
        for (let i = 0; i < boostPads.length; i++) {
          const pad = boostPads[i];
          const dx = pos.x - pad.position[0];
          const dz = pos.z - pad.position[1];
          if (dx * dx + dz * dz < 0.34) {
            lastBoostTimeRef.current[slot] = elapsed;
            const curV = body.linvel();
            body.setLinvel(
              {
                x: curV.x + pad.direction[0] * 7.2,
                y: 0,
                z: curV.z + pad.direction[1] * 7.2,
              },
              true,
            );
            onBoostHit(slot);
            break;
          }
        }
      }

      // Çift Yönlü Kuantum Işınlanma Portalları (Teleporters) Kontrolü
      const teleporters = levelData.teleporters;
      if (teleporters && elapsed - lastTeleportTimeRef.current[slot] > 0.9) {
        for (let i = 0; i < teleporters.length; i++) {
          const pair = teleporters[i];
          const dEntrySq =
            (pos.x - pair.entry[0]) ** 2 + (pos.z - pair.entry[1]) ** 2;
          const dExitSq =
            (pos.x - pair.exit[0]) ** 2 + (pos.z - pair.exit[1]) ** 2;

          let dest: [number, number] | null = null;
          if (dEntrySq < 0.24) {
            dest = pair.exit;
          } else if (dExitSq < 0.24) {
            dest = pair.entry;
          }

          if (dest) {
            lastTeleportTimeRef.current[slot] = elapsed;
            body.setTranslation({ x: dest[0], y: BALL_RADIUS, z: dest[1] }, true);
            if (slot === 1) {
              for (let t = 0; t < TRAIL_COUNT; t++) {
                trailHistoryRef.current[t].x = dest[0];
                trailHistoryRef.current[t].z = dest[1];
              }
            }
            onTeleportHit(slot);
            break;
          }
        }
      }

      // Periyodik Lazer Kapıları Kontrolü
      if (elapsed - lastHazardResetTimeRef.current[slot] > 0.35) {
        for (let i = 0; i < levelData.laserGates.length; i++) {
          const gate = levelData.laserGates[i];
          if (
            !isLaserGateActive(
              elapsed,
              gate.periodSeconds,
              gate.phaseOffset,
            )
          ) {
            continue;
          }

          const [gx, gz] = gate.position;
          const halfLen = gate.length / 2;
          const hitThreshold = BALL_RADIUS + 0.08;
          const hit =
            gate.axis === 'x'
              ? Math.abs(pos.z - gz) < hitThreshold &&
                Math.abs(pos.x - gx) < halfLen
              : Math.abs(pos.x - gx) < hitThreshold &&
                Math.abs(pos.z - gz) < halfLen;

          if (hit) {
            lastHazardResetTimeRef.current[slot] = elapsed;
            onLaserHit(slot);
            if (isMultiplayer) {
              resetSingleBall(body, slot);
            } else {
              resetBallAndBoard();
            }
            break;
          }
        }
      }

      // Hareketli Devriye Engelleri (Moving Kinetic Obstacles) Kontrolü
      const movingObstacles = levelData.movingObstacles ?? [];
      if (
        movingObstacles.length > 0 &&
        elapsed - lastMovingHitTimeRef.current[slot] > 0.25
      ) {
        for (let i = 0; i < movingObstacles.length; i++) {
          const obs = movingObstacles[i];
          const offset = calculateMovingObstacleOffset(
            elapsed,
            obs.speed,
            obs.phaseOffset,
            obs.amplitude,
          );
          const ox = obs.axis === 'x' ? obs.center[0] + offset : obs.center[0];
          const oz = obs.axis === 'z' ? obs.center[1] + offset : obs.center[1];
          const dx = pos.x - ox;
          const dz = pos.z - oz;
          const distSq = dx * dx + dz * dz;
          const minDist = BALL_RADIUS + 0.38;
          if (distSq < minDist * minDist) {
            lastMovingHitTimeRef.current[slot] = elapsed;
            const dist = Math.sqrt(distSq);
            const nx = dist > 1e-4 ? dx / dist : obs.axis === 'x' ? 0 : 1;
            const nz = dist > 1e-4 ? dz / dist : obs.axis === 'x' ? 1 : 0;
            body.setLinvel({ x: nx * 6.8, y: 0, z: nz * 6.8 }, true);
            onWallHit(5.5, slot);
            break;
          }
        }
      }
    },
    [
      levelData.crystals,
      levelData.boostPads,
      levelData.teleporters,
      levelData.laserGates,
      levelData.movingObstacles,
      isMultiplayer,
      onCollectCrystal,
      onBoostHit,
      onTeleportHit,
      onLaserHit,
      onWallHit,
      resetSingleBall,
      resetBallAndBoard,
    ],
  );

  useFrame((state, delta) => {
    const safeDelta = Math.min(delta, 0.05);
    const elapsed = state.clock.elapsedTime;

    if (goalRingRef.current) {
      goalRingRef.current.rotation.z += safeDelta * (isGoalUnlocked ? 2.4 : 0.8);
    }

    // Kristallerin havada süzülme ve dönme animasyonu
    for (let i = 0; i < levelData.crystals.length; i++) {
      const mesh = crystalMeshesRef.current[i];
      if (mesh && mesh.visible) {
        mesh.rotation.y += safeDelta * 2.5;
        mesh.position.y = 0.42 + Math.sin(elapsed * 3.5 + i) * 0.08;
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
        const offset = calculateMovingObstacleOffset(
          hazardElapsed,
          obs.speed,
          obs.phaseOffset,
          obs.amplitude,
        );
        const ox = obs.axis === 'x' ? obs.center[0] + offset : obs.center[0];
        const oz = obs.axis === 'z' ? obs.center[1] + offset : obs.center[1];
        mesh.position.set(ox, 0.36, oz);
        if (isInteractive) {
          mesh.rotation.y += safeDelta * 1.8;
        }
      }
    }

    const rawPitchRad = isInteractive
      ? THREE.MathUtils.degToRad(transientGyro.beta)
      : 0;
    const rawRollRad = isInteractive
      ? -THREE.MathUtils.degToRad(transientGyro.gamma)
      : 0;

    const clampedPitch = THREE.MathUtils.clamp(
      rawPitchRad,
      -MAX_TILT_RADIANS,
      MAX_TILT_RADIANS,
    );
    const clampedRoll = THREE.MathUtils.clamp(
      rawRollRad,
      -MAX_TILT_RADIANS,
      MAX_TILT_RADIANS,
    );

    _targetEuler.set(clampedPitch, 0, clampedRoll, 'XYZ');
    _targetQuat.setFromEuler(_targetEuler);

    // 1. Seçilen tepkisellik katsayısı (tiltResponsiveness) ile anında eğim tepkisi
    const slerpAlpha = 1 - Math.exp(-tiltResponsiveness * safeDelta);
    _currentQuat.slerp(_targetQuat, slerpAlpha);
    _currentEuler.setFromQuaternion(_currentQuat, 'XYZ');

    if (visualTiltGroupRef.current) {
      visualTiltGroupRef.current.quaternion.copy(_currentQuat);
    }

    // 2. Fizik küresine eğim ivmesi, kristal toplama, lazer kontrolü ve neon iz güncellemesi
    if (ballBodyRef.current) {
      if (isInteractive) {
        const accelX = -gravityScale * Math.sin(_currentEuler.z);
        const accelZ = gravityScale * Math.sin(_currentEuler.x);

        const currentVel = ballBodyRef.current.linvel();
        const damping = Math.exp(-0.55 * safeDelta);
        const nextVx = (currentVel.x + accelX * safeDelta) * damping;
        const nextVz = (currentVel.z + accelZ * safeDelta) * damping;

        ballBodyRef.current.setLinvel({ x: nextVx, y: 0, z: nextVz }, true);
      } else {
        ballBodyRef.current.setLinvel({ x: 0, y: 0, z: 0 }, true);
      }

      const pos = ballBodyRef.current.translation();
      const vel = ballBodyRef.current.linvel();
      transientGyro.ballX = pos.x;
      transientGyro.ballZ = pos.z;
      transientGyro.ballSpeed = Math.hypot(vel.x, vel.z);

      if (visualBallMeshRef.current) {
        visualBallMeshRef.current.position.set(pos.x, BALL_RADIUS, pos.z);
        visualBallMeshRef.current.rotation.x +=
          (vel.z / BALL_RADIUS) * safeDelta;
        visualBallMeshRef.current.rotation.z -=
          (vel.x / BALL_RADIUS) * safeDelta;
      }

      // 10Hz Hayalet Yarışçı (Ghost Replay) Kaydı ve Canlı Oynatımı
      let shouldSampleGhost = false;
      if (gameStatus === 'playing' && isInteractive) {
        runElapsedRef.current += safeDelta;
        shouldSampleGhost =
          runElapsedRef.current - lastSampleTimeRef.current >= 0.1;
        if (shouldSampleGhost) {
          lastSampleTimeRef.current =
            runElapsedRef.current - lastSampleTimeRef.current > 0.25
              ? runElapsedRef.current
              : lastSampleTimeRef.current + 0.1;
          if (runPathRef.current.length < 600) {
            runPathRef.current.push([
              Math.round(pos.x * 100) / 100,
              Math.round(pos.z * 100) / 100,
            ]);
          }
        }

        if (ghostBallMeshRef.current) {
          if (showGhost) {
            const ghost = calculateGhostPlaybackCoord(
              ghostPath,
              runElapsedRef.current,
            );
            ghostBallMeshRef.current.visible = ghost.isVisible;
            if (ghost.isVisible) {
              ghostBallMeshRef.current.position.set(
                ghost.coord[0],
                BALL_RADIUS,
                ghost.coord[1],
              );
            }
          } else {
            ghostBallMeshRef.current.visible = false;
          }
        }
      } else if (ghostBallMeshRef.current) {
        ghostBallMeshRef.current.visible = false;
      }

      // Neon Hareket İzi (Motion Trail) halkalarını güncelle (Sıfır GC)
      const history = trailHistoryRef.current;
      for (let i = TRAIL_COUNT - 1; i > 0; i--) {
        history[i].x += (history[i - 1].x - history[i].x) * 0.42;
        history[i].z += (history[i - 1].z - history[i].z) * 0.42;
      }
      history[0].x = pos.x;
      history[0].z = pos.z;

      for (let i = 0; i < TRAIL_COUNT; i++) {
        const trailMesh = trailMeshesRef.current[i];
        if (trailMesh) {
          trailMesh.visible = showTrail;
          trailMesh.position.set(history[i].x, 0.025, history[i].z);
          const scale = calculateTrailScale(i, TRAIL_COUNT);
          trailMesh.scale.set(scale, scale, 1);
        }
      }

      // 1. Oyuncu kristal, rampa, portal, lazer ve hareketli engel etkileşimleri
      processBallInteractions(
        ballBodyRef.current,
        pos,
        1,
        hazardElapsed,
        isInteractive,
      );

      if (isInteractive && isGoalUnlocked) {
        const [gx, , gz] = levelData.goalPosition;
        if ((pos.x - gx) ** 2 + (pos.z - gz) ** 2 < 0.2116) {
          onReachGoal(runPathRef.current, 1);
        }
      }

      // Çok Oyunculu (2. Oyuncu - Altın Bilye) Fizik ve Tam Etkileşim Paritesi
      if (isMultiplayer && ball2BodyRef.current) {
        const p2PitchRad = THREE.MathUtils.clamp(
          isInteractive ? THREE.MathUtils.degToRad(transientGyroP2.beta) : 0,
          -MAX_TILT_RADIANS,
          MAX_TILT_RADIANS,
        );
        const p2RollRad = THREE.MathUtils.clamp(
          isInteractive ? -THREE.MathUtils.degToRad(transientGyroP2.gamma) : 0,
          -MAX_TILT_RADIANS,
          MAX_TILT_RADIANS,
        );

        if (isInteractive) {
          const ax2 = -gravityScale * Math.sin(p2RollRad);
          const az2 = gravityScale * Math.sin(p2PitchRad);
          const v2 = ball2BodyRef.current.linvel();
          const damp = Math.exp(-0.55 * safeDelta);
          ball2BodyRef.current.setLinvel(
            {
              x: (v2.x + ax2 * safeDelta) * damp,
              y: 0,
              z: (v2.z + az2 * safeDelta) * damp,
            },
            true,
          );
        } else {
          ball2BodyRef.current.setLinvel({ x: 0, y: 0, z: 0 }, true);
        }

        const pos2 = ball2BodyRef.current.translation();
        const vel2 = ball2BodyRef.current.linvel();
        transientGyroP2.ballX = pos2.x;
        transientGyroP2.ballZ = pos2.z;
        transientGyroP2.ballSpeed = Math.hypot(vel2.x, vel2.z);

        if (shouldSampleGhost && runPathP2Ref.current.length < 600) {
          runPathP2Ref.current.push([
            Math.round(pos2.x * 100) / 100,
            Math.round(pos2.z * 100) / 100,
          ]);
        }

        if (visualBall2MeshRef.current) {
          visualBall2MeshRef.current.visible = true;
          visualBall2MeshRef.current.position.set(pos2.x, BALL_RADIUS, pos2.z);
          visualBall2MeshRef.current.rotation.x +=
            (vel2.z / BALL_RADIUS) * safeDelta;
          visualBall2MeshRef.current.rotation.z -=
            (vel2.x / BALL_RADIUS) * safeDelta;
        }

        // 2. Oyuncu için tüm kristal, rampa, portal, lazer ve hareketli engel kontrolleri
        processBallInteractions(
          ball2BodyRef.current,
          pos2,
          2,
          hazardElapsed,
          isInteractive,
        );

        // 2. Oyuncu ile 1. Oyuncu için birebir simetrik hedef portalı yarıçapı (0.46 birim)
        if (isInteractive && isGoalUnlocked) {
          const [gx, , gz] = levelData.goalPosition;
          if ((pos2.x - gx) ** 2 + (pos2.z - gz) ** 2 < 0.2116) {
            onReachGoal(runPathP2Ref.current, 2);
          }
        }
      } else if (visualBall2MeshRef.current) {
        visualBall2MeshRef.current.visible = false;
      }

      // 3. Seçili Kamera Moduna Göre Dinamik Kamera Konumlandırma
      const { targetPos, lookAt } = calculateCameraTargetTransform(
        cameraMode,
        pos,
        clampedRoll,
        clampedPitch,
      );
      _cameraTargetPos.set(...targetPos);
      _cameraLookAt.set(...lookAt);
    }

    state.camera.position.lerp(
      _cameraTargetPos,
      1 - Math.exp(-10 * safeDelta),
    );
    state.camera.lookAt(_cameraLookAt);
  });

  return (
    <>
      {/* 1. SABİT FİZİK ÇARPIŞTIRICILARI (TAHTA-YEREL UZAY) */}
      <RigidBody type="fixed" colliders={false} friction={0.12} restitution={0.18}>
        {outerWalls.map((wall, idx) => (
          <CuboidCollider
            key={`phys-outer-${idx}`}
            args={[wall.size[0] / 2, wall.size[1] / 2, wall.size[2] / 2]}
            position={wall.position}
          />
        ))}

        {levelData.innerWalls.map((wall, idx) => (
          <CuboidCollider
            key={`phys-inner-${levelRevisionKey}-${idx}`}
            args={[wall.size[0] / 2, wall.size[1] / 2, wall.size[2] / 2]}
            position={wall.position}
          />
        ))}

        {/* Hedef Portalı Sensörü */}
        <CylinderCollider
          args={[0.4, 0.46]}
          position={levelData.goalPosition}
          sensor
          onIntersectionEnter={(payload) => {
            const slot =
              payload.other.rigidBodyObject?.name === 'ball-p2' ? 2 : 1;
            onReachGoal(
              slot === 2 ? runPathP2Ref.current : runPathRef.current,
              slot,
            );
          }}
        />

        {/* Tuzak Delikleri (Void Holes) Sensörleri */}
        {levelData.voidHoles.map((hole, idx) => (
          <CylinderCollider
            key={`phys-hole-${levelRevisionKey}-${idx}`}
            args={[0.4, (hole.radius ?? 0.42) * 0.68]}
            position={[hole.position[0], 0.25, hole.position[1]]}
            sensor
            onIntersectionEnter={(payload) => {
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
              const slot: 1 | 2 =
                payload.other.rigidBodyObject?.name === 'ball-p2' ? 2 : 1;
              const nowMs = performance.now();
              if (nowMs - lastHoleHitMsRef.current[slot] < 350) return;
              lastHoleHitMsRef.current[slot] = nowMs;
              onFallIntoHole(slot);
              if (isMultiplayer) {
                resetSingleBall(
                  slot === 2 ? ball2BodyRef.current : ballBodyRef.current,
                  slot,
                );
              } else {
                resetBallAndBoard();
              }
            }}
          />
        ))}
      </RigidBody>

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

        {outerWalls.map((wall, idx) => (
          <mesh
            key={`vis-outer-${idx}`}
            position={wall.position}
            material={_outerWallMaterial}
            castShadow
            receiveShadow
          >
            <boxGeometry args={wall.size} />
          </mesh>
        ))}

        {levelData.innerWalls.map((wall, idx) => (
          <mesh
            key={`vis-inner-${levelRevisionKey}-${idx}`}
            position={wall.position}
            material={_innerWallMaterial}
            castShadow
            receiveShadow
          >
            <boxGeometry args={wall.size} />
          </mesh>
        ))}

        {/* Başlangıç Noktası İşaretçisi */}
        <mesh
          position={[
            levelData.startPosition[0],
            0.02,
            levelData.startPosition[2],
          ]}
          rotation={[-Math.PI / 2, 0, 0]}
          material={_startRingMaterial}
        >
          <ringGeometry args={[0.35, 0.52, 24]} />
        </mesh>

        {/* Tuzak Delikleri */}
        {levelData.voidHoles.map((hole, idx) => {
          const r = hole.radius ?? 0.42;
          return (
            <group
              key={`vis-hole-${levelRevisionKey}-${idx}`}
              position={[hole.position[0], 0.02, hole.position[1]]}
            >
              <mesh
                rotation={[-Math.PI / 2, 0, 0]}
                material={_holeCoreMaterial}
              >
                <circleGeometry args={[r, 24]} />
              </mesh>
              <mesh
                rotation={[-Math.PI / 2, 0, 0]}
                position={[0, 0.005, 0]}
                material={_holeRingMaterial}
              >
                <ringGeometry args={[r * 0.82, r * 1.08, 24]} />
              </mesh>
            </group>
          );
        })}

        {/* Toplanabilir Enerji Kristalleri */}
        {levelData.crystals.map(([cx, cz], idx) => {
          const isCollected = collectedCrystals.includes(idx);
          return (
            <mesh
              key={`crystal-${levelRevisionKey}-${idx}`}
              ref={(el) => {
                crystalMeshesRef.current[idx] = el;
              }}
              position={[cx, 0.42, cz]}
              visible={!isCollected}
              material={_crystalMaterial}
              castShadow
            >
              <octahedronGeometry args={[0.28, 0]} />
            </mesh>
          );
        })}

        {/* Kinetik Hızlandırma Rampaları (Boost Pads) */}
        {(levelData.boostPads ?? []).map((pad, idx) => {
          const [bx, bz] = pad.position;
          const [dx, dz] = pad.direction;
          const yawAngle = Math.atan2(dx, dz);
          return (
            <group
              key={`boost-${levelRevisionKey}-${idx}`}
              position={[bx, 0.02, bz]}
              rotation={[0, yawAngle, 0]}
            >
              <mesh
                rotation={[-Math.PI / 2, 0, 0]}
                material={_boostBaseMaterial}
              >
                <planeGeometry args={[0.85, 1.1]} />
              </mesh>
              <mesh
                position={[0, 0.02, 0.12]}
                rotation={[Math.PI / 2, 0, 0]}
                material={_boostArrowMaterial}
              >
                <coneGeometry args={[0.24, 0.48, 3]} />
              </mesh>
            </group>
          );
        })}

        {/* Çift Yönlü Kuantum Işınlanma Portalları (Teleporters) */}
        {(levelData.teleporters ?? []).map((pair, idx) =>
          [pair.entry, pair.exit].map(([tx, tz], subIdx) => (
            <group
              key={`teleporter-${levelRevisionKey}-${idx}-${subIdx}`}
              position={[tx, 0.025, tz]}
            >
              <mesh
                rotation={[-Math.PI / 2, 0, 0]}
                material={_teleporterRingMaterial}
              >
                <ringGeometry args={[0.28, 0.44, 24]} />
              </mesh>
              <mesh
                rotation={[-Math.PI / 2, 0, 0]}
                position={[0, -0.005, 0]}
                material={_teleporterCoreMaterial}
              >
                <circleGeometry args={[0.28, 20]} />
              </mesh>
            </group>
          )),
        )}

        {/* Periyodik Lazer Kapılar */}
        {levelData.laserGates.map((gate, idx) => {
          const [gx, gz] = gate.position;
          const halfLen = gate.length / 2;
          const p1: [number, number, number] =
            gate.axis === 'x'
              ? [gx - halfLen, 0.35, gz]
              : [gx, 0.35, gz - halfLen];
          const p2: [number, number, number] =
            gate.axis === 'x'
              ? [gx + halfLen, 0.35, gz]
              : [gx, 0.35, gz + halfLen];
          const beamSize: [number, number, number] =
            gate.axis === 'x'
              ? [gate.length, 0.14, 0.08]
              : [0.08, 0.14, gate.length];

          return (
            <group key={`laser-${levelRevisionKey}-${idx}`}>
              <mesh position={p1} material={_laserPillarMaterial}>
                <cylinderGeometry args={[0.1, 0.12, 0.7, 12]} />
              </mesh>
              <mesh position={p2} material={_laserPillarMaterial}>
                <cylinderGeometry args={[0.1, 0.12, 0.7, 12]} />
              </mesh>
              <mesh
                ref={(el) => {
                  laserBeamMeshesRef.current[idx] = el;
                }}
                position={[gx, 0.35, gz]}
                material={_laserBeamMaterial}
              >
                <boxGeometry args={beamSize} />
              </mesh>
            </group>
          );
        })}

        {/* Hareketli Kinetik Devriye Engelleri (Moving Obstacles) */}
        {(levelData.movingObstacles ?? []).map((obs, idx) => (
          <mesh
            key={`moving-obs-${levelRevisionKey}-${idx}`}
            ref={(el) => {
              movingObstacleMeshesRef.current[idx] = el;
            }}
            position={[obs.center[0], 0.36, obs.center[1]]}
            material={_movingObstacleMaterial}
            castShadow
          >
            <cylinderGeometry args={[0.36, 0.38, 0.72, 16]} />
          </mesh>
        ))}

        {/* Hedef Portalı (Kristaller Toplandığında Kehribardan Zümrüt Yeşiline Dönüşür) */}
        <group position={levelData.goalPosition}>
          <mesh
            ref={goalRingRef}
            position={[0, -0.32, 0]}
            rotation={[-Math.PI / 2, 0, 0]}
            material={
              isGoalUnlocked
                ? _goalUnlockedRingMaterial
                : _goalLockedRingMaterial
            }
          >
            <ringGeometry args={[0.35, 0.68, 6]} />
          </mesh>
          <mesh
            position={[0, -0.33, 0]}
            rotation={[-Math.PI / 2, 0, 0]}
            material={
              isGoalUnlocked
                ? _goalUnlockedCoreMaterial
                : _goalLockedCoreMaterial
            }
          >
            <circleGeometry args={[0.35, 24]} />
          </mesh>
          <pointLight
            color={isGoalUnlocked ? '#10b981' : '#f59e0b'}
            intensity={3.0}
            distance={4.2}
            position={[0, 0.5, 0]}
          />
        </group>

        {/* Bilye Neon Hareket İzi (Motion Trail) */}
        {Array.from({ length: TRAIL_COUNT }).map((_, idx) => (
          <mesh
            key={`trail-${idx}`}
            ref={(el) => {
              trailMeshesRef.current[idx] = el;
            }}
            position={[
              levelData.startPosition[0],
              0.025,
              levelData.startPosition[2],
            ]}
            rotation={[-Math.PI / 2, 0, 0]}
            material={_trailMaterial}
          >
            <circleGeometry args={[BALL_RADIUS * 0.68, 16]} />
          </mesh>
        ))}

        {/* Hayalet Yarışçı Küresi (Kendi En İyi Rekorunun Canlı Hologramı) */}
        <mesh
          ref={ghostBallMeshRef}
          visible={false}
          position={[
            levelData.startPosition[0],
            BALL_RADIUS,
            levelData.startPosition[2],
          ]}
          material={_ghostBallMaterial}
        >
          <sphereGeometry args={[BALL_RADIUS * 0.92, 20, 20]} />
        </mesh>

        {/* 1. Oyuncu Görsel Metal Bilye */}
        <mesh
          ref={visualBallMeshRef}
          position={[
            levelData.startPosition[0],
            BALL_RADIUS,
            levelData.startPosition[2],
          ]}
          material={_ballMaterial}
          castShadow
        >
          <sphereGeometry args={[BALL_RADIUS, 32, 32]} />
        </mesh>

        {/* Çok Oyunculu 2. Oyuncu Görsel Altın Bilye */}
        <mesh
          ref={visualBall2MeshRef}
          visible={false}
          position={[
            levelData.startPosition[0] + p2SpawnOffsetX,
            BALL_RADIUS,
            levelData.startPosition[2] + p2SpawnOffsetZ,
          ]}
          material={_ball2Material}
          castShadow
        >
          <sphereGeometry args={[BALL_RADIUS, 32, 32]} />
        </mesh>
      </group>
    </>
  );
}

/**
 * WebGL / Rapier WASM başlatma hatalarında uygulamanın çökmesini önleyen sınır bileşeni.
 */
class SceneErrorBoundary extends Component<
  { children: ReactNode; onRetry: () => void },
  { hasError: boolean }
> {
  public constructor(props: { children: ReactNode; onRetry: () => void }) {
    super(props);
    this.state = { hasError: false };
  }

  public static getDerivedStateFromError(): { hasError: boolean } {
    return { hasError: true };
  }

  public override componentDidCatch(_err: Error, _info: ErrorInfo): void {
    // WebGL veya fizik başlatma hatası kurtarma ekranına yönlendirildi.
  }

  public override render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-full w-full flex-col items-center justify-center bg-base p-6 text-center text-fg">
          <div className="max-w-sm rounded-2xl border border-line bg-surface p-6 shadow-xl">
            <h2 className="text-base font-semibold">3B sahne başlatılamadı</h2>
            <p className="mt-2 text-xs leading-relaxed text-muted">
              Tarayıcı WebGL grafik bağlamı kullanılamıyor veya sıfırlandı.
            </p>
            <button
              type="button"
              onClick={() => {
                this.setState({ hasError: false });
                this.props.onRetry();
              }}
              className="mt-4 min-h-10 cursor-pointer rounded-xl bg-brass px-4 text-xs font-semibold text-brass-fg"
            >
              Sahneyi yeniden başlat
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
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
