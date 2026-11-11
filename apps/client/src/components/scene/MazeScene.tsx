'use client';

import { useRef, useEffect, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import {
  Physics,
  RigidBody,
  CuboidCollider,
  CylinderCollider,
  RapierRigidBody,
} from '@react-three/rapier';
import * as THREE from 'three';
import { useGameStore, transientGyro } from '@/store/useGameStore';
import { MAZE_LEVELS, MazeLevelDefinition } from './mazeLevels';

// Garbage Collection (GC) duraksamalarını önlemek için modül seviyesinde önceden ayrılmış nesneler
const _targetEuler = new THREE.Euler(0, 0, 0, 'XYZ');
const _targetQuat = new THREE.Quaternion();
const _currentQuat = new THREE.Quaternion();
const _cameraTargetPos = new THREE.Vector3(0, 14.5, 10.5);
const _cameraLookAt = new THREE.Vector3(0, 0, 0);

const MAX_TILT_RADIANS = THREE.MathUtils.degToRad(22);

interface KinematicMazeBoardProps {
  levelData: MazeLevelDefinition;
  onReachGoal: () => void;
}

/**
 * Jiroskop verilerine göre Quaternion Slerp ile 60 FPS sönümlenerek eğilen
 * kinematik labirent gövdesi.
 */
function KinematicMazeBoard({
  levelData,
  onReachGoal,
}: KinematicMazeBoardProps) {
  const mazeBodyRef = useRef<RapierRigidBody | null>(null);
  const goalRingRef = useRef<THREE.Mesh | null>(null);
  const resetCount = useGameStore((s) => s.resetCount);
  const gameStatus = useGameStore((s) => s.gameStatus);

  const halfBoard = levelData.boardSize / 2;
  const wallHeight = 0.85;
  const wallThickness = 0.4;

  // Dış çerçeve duvarları
  const outerWalls = useMemo(
    () => [
      // Kuzey Duvarı
      {
        position: [0, wallHeight / 2, -halfBoard] as [number, number, number],
        size: [levelData.boardSize + wallThickness, wallHeight, wallThickness] as [
          number,
          number,
          number,
        ],
      },
      // Güney Duvarı
      {
        position: [0, wallHeight / 2, halfBoard] as [number, number, number],
        size: [levelData.boardSize + wallThickness, wallHeight, wallThickness] as [
          number,
          number,
          number,
        ],
      },
      // Batı Duvarı
      {
        position: [-halfBoard, wallHeight / 2, 0] as [number, number, number],
        size: [wallThickness, wallHeight, levelData.boardSize] as [
          number,
          number,
          number,
        ],
      },
      // Doğu Duvarı
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

  // Sıfırlama sinyalinde labirenti düz konuma getir
  useEffect(() => {
    _currentQuat.identity();
    if (mazeBodyRef.current) {
      mazeBodyRef.current.setNextKinematicRotation(_currentQuat);
    }
  }, [resetCount, levelData.id]);

  useFrame((state, delta) => {
    // Hedef halkasının yumuşak dönüş animasyonu
    if (goalRingRef.current) {
      goalRingRef.current.rotation.y += delta * 1.8;
    }

    if (!mazeBodyRef.current) return;

    // Oyun kazanıldığında veya duraklatıldığında labirenti yumuşakça yatay konuma getir
    const isInteractive = gameStatus === 'playing' || gameStatus === 'waiting';

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

    // Kare hızından bağımsız küresel doğrusal enterpolasyon (Quaternion Slerp)
    const slerpAlpha = 1 - Math.exp(-10 * delta);
    _currentQuat.slerp(_targetQuat, slerpAlpha);

    mazeBodyRef.current.setNextKinematicRotation(_currentQuat);

    // Kameraya hafif paralaks hissi kazandır (Lerp)
    _cameraTargetPos.set(
      -clampedRoll * 3.2,
      14.5,
      10.2 + clampedPitch * 2.5,
    );
    state.camera.position.lerp(_cameraTargetPos, 1 - Math.exp(-5 * delta));
    state.camera.lookAt(_cameraLookAt);
  });

  return (
    <RigidBody
      ref={mazeBodyRef}
      type="kinematicPosition"
      colliders={false}
      friction={0.4}
      restitution={0.2}
    >
      {/* Ana Labirent Zemin Plakası */}
      <CuboidCollider
        args={[halfBoard, 0.25, halfBoard]}
        position={[0, -0.25, 0]}
      />
      <mesh position={[0, -0.25, 0]} receiveShadow castShadow>
        <boxGeometry args={[levelData.boardSize, 0.5, levelData.boardSize]} />
        <meshStandardMaterial
          color="#18181b"
          roughness={0.55}
          metalness={0.25}
        />
      </mesh>

      {/* Zemin Üzeri İnce Teknoloji Izgara Çizgileri */}
      <gridHelper
        args={[levelData.boardSize - 0.4, 12, '#27272a', '#27272a']}
        position={[0, 0.01, 0]}
      />

      {/* Dış Çerçeve Duvarları */}
      {outerWalls.map((wall, idx) => (
        <group key={`outer-${idx}`}>
          <CuboidCollider
            args={[wall.size[0] / 2, wall.size[1] / 2, wall.size[2] / 2]}
            position={wall.position}
          />
          <mesh position={wall.position} castShadow receiveShadow>
            <boxGeometry args={wall.size} />
            <meshStandardMaterial
              color="#27272a"
              roughness={0.35}
              metalness={0.45}
            />
          </mesh>
        </group>
      ))}

      {/* İç Labirent Duvarları */}
      {levelData.innerWalls.map((wall, idx) => (
        <group key={`inner-${levelData.id}-${idx}`}>
          <CuboidCollider
            args={[wall.size[0] / 2, wall.size[1] / 2, wall.size[2] / 2]}
            position={wall.position}
          />
          <mesh position={wall.position} castShadow receiveShadow>
            <boxGeometry args={wall.size} />
            <meshStandardMaterial
              color="#3f3f46"
              roughness={0.3}
              metalness={0.5}
            />
          </mesh>
        </group>
      ))}

      {/* Başlangıç Noktası İşaretçisi */}
      <mesh
        position={[levelData.startPosition[0], 0.02, levelData.startPosition[2]]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <ringGeometry args={[0.35, 0.52, 32]} />
        <meshBasicMaterial color="#38bdf8" transparent opacity={0.65} />
      </mesh>

      {/* Hedef Portalı (Zümrüt Yeşili Sensör Bölgesi) */}
      <group position={levelData.goalPosition}>
        <CylinderCollider
          args={[0.35, 0.55]}
          sensor
          onIntersectionEnter={onReachGoal}
        />
        <mesh
          ref={goalRingRef}
          position={[0, -0.25, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <ringGeometry args={[0.35, 0.68, 6]} />
          <meshStandardMaterial
            color="#10b981"
            emissive="#10b981"
            emissiveIntensity={1.6}
            roughness={0.2}
          />
        </mesh>
        <mesh position={[0, -0.32, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.35, 32]} />
          <meshBasicMaterial color="#34d399" transparent opacity={0.35} />
        </mesh>
        <pointLight
          color="#10b981"
          intensity={3.5}
          distance={4.5}
          position={[0, 0.5, 0]}
        />
      </group>
    </RigidBody>
  );
}

interface PlayerBallProps {
  startPosition: [number, number, number];
}

/**
 * Rapier fizik motoru tarafından kontrol edilen dinamik metal bilye.
 */
function PlayerBall({ startPosition }: PlayerBallProps) {
  const ballBodyRef = useRef<RapierRigidBody | null>(null);
  const resetCount = useGameStore((s) => s.resetCount);
  const level = useGameStore((s) => s.level);

  const resetBallPosition = () => {
    if (!ballBodyRef.current) return;
    ballBodyRef.current.setTranslation(
      { x: startPosition[0], y: startPosition[1], z: startPosition[2] },
      true,
    );
    ballBodyRef.current.setLinvel({ x: 0, y: 0, z: 0 }, true);
    ballBodyRef.current.setAngvel({ x: 0, y: 0, z: 0 }, true);
  };

  useEffect(() => {
    resetBallPosition();
  }, [resetCount, level, startPosition]);

  useFrame(() => {
    if (!ballBodyRef.current) return;
    const pos = ballBodyRef.current.translation();
    // Eğer küre herhangi bir nedenle platform dışına düşerse otomatik başlangıca döndür
    if (pos.y < -5) {
      resetBallPosition();
    }
  });

  return (
    <RigidBody
      ref={ballBodyRef}
      type="dynamic"
      colliders="ball"
      position={startPosition}
      restitution={0.25}
      friction={0.35}
      linearDamping={0.4}
      angularDamping={0.3}
      ccd={true}
    >
      <mesh castShadow receiveShadow>
        <sphereGeometry args={[0.34, 48, 48]} />
        <meshStandardMaterial
          color="#f4f4f5"
          metalness={0.88}
          roughness={0.14}
        />
      </mesh>
    </RigidBody>
  );
}

/**
 * Masaüstü ekranında tam ekran çalışan 3B WebGL sahnesi.
 */
export function MazeScene() {
  const level = useGameStore((s) => s.level);
  const gameStatus = useGameStore((s) => s.gameStatus);
  const setGameStatus = useGameStore((s) => s.setGameStatus);

  const activeLevel = useMemo(() => {
    const index = (level - 1) % MAZE_LEVELS.length;
    return MAZE_LEVELS[index];
  }, [level]);

  const handleReachGoal = () => {
    if (gameStatus !== 'won') {
      setGameStatus('won');
    }
  };

  return (
    <div className="fixed inset-0 z-0 h-screen w-screen bg-zinc-950">
      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{ position: [0, 14.5, 10.2], fov: 42, near: 0.1, far: 100 }}
      >
        <color attach="background" args={['#09090b']} />
        <fog attach="fog" args={['#09090b', 18, 36]} />

        {/* Sahne Aydınlatması */}
        <ambientLight intensity={0.65} />
        <directionalLight
          position={[8, 16, 10]}
          intensity={1.8}
          castShadow
          shadow-mapSize={[2048, 2048]}
          shadow-camera-left={-10}
          shadow-camera-right={10}
          shadow-camera-top={10}
          shadow-camera-bottom={-10}
        />
        <pointLight position={[-8, 6, -8]} intensity={1.2} color="#38bdf8" />

        {/* 3B Rapier Fizik Dünyası */}
        <Physics gravity={[0, -20, 0]}>
          <KinematicMazeBoard
            levelData={activeLevel}
            onReachGoal={handleReachGoal}
          />
          <PlayerBall startPosition={activeLevel.startPosition} />
        </Physics>
      </Canvas>
    </div>
  );
}

