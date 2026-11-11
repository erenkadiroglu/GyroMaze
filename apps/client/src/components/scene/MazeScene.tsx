'use client';

import { useRef, useEffect, useMemo, useCallback } from 'react';
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
import { useGameStore, transientGyro } from '@/store/useGameStore';
import { MAZE_LEVELS, MazeLevelDefinition } from './mazeLevels';
import { soundEngine } from '@/utils/soundEngine';

// Garbage Collection (GC) duraksamalarını önlemek için modül seviyesinde önceden ayrılmış nesneler
const _targetEuler = new THREE.Euler(0, 0, 0, 'XYZ');
const _targetQuat = new THREE.Quaternion();
const _currentQuat = new THREE.Quaternion();
const _currentEuler = new THREE.Euler(0, 0, 0, 'XYZ');
const _cameraTargetPos = new THREE.Vector3(0, 14.5, 10.5);
const _cameraLookAt = new THREE.Vector3(0, 0, 0);

const MAX_TILT_RADIANS = THREE.MathUtils.degToRad(22);
const SLOPE_GRAVITY = 26.0;
const BALL_RADIUS = 0.34;

interface MazeStageProps {
  levelData: MazeLevelDefinition;
  onReachGoal: () => void;
  onFallIntoHole: () => void;
  onWallHit: (speed: number) => void;
}

/**
 * Zıplamasız (Zero-Bounce) Hibrit Fizik ve Görsel Labirent Sahnesi:
 * - Rapier fizik çarpıştırıcıları tahta-yerel (board-local) uzayda sabit (fixed) durur ve
 *   kürenin dikey ekseni (Y) tahta yüzeyine kilitlenir; böylece hızlı eğimlerde zemin küreyi
 *   asla havaya fırlatmaz.
 * - Görsel 3B grup (visualTiltGroupRef) ise Quaternion Slerp ile dünya uzayında 60 FPS
 *   pürüzsüzce eğilir ve kürenin yerel koordinatlarını birebir yansıtır.
 */
function MazeStage({
  levelData,
  onReachGoal,
  onFallIntoHole,
  onWallHit,
}: MazeStageProps) {
  const ballBodyRef = useRef<RapierRigidBody | null>(null);
  const visualTiltGroupRef = useRef<THREE.Group | null>(null);
  const visualBallMeshRef = useRef<THREE.Mesh | null>(null);
  const goalRingRef = useRef<THREE.Mesh | null>(null);
  const lastWallSoundTimeRef = useRef<number>(0);

  const resetCount = useGameStore((s) => s.resetCount);
  const gameStatus = useGameStore((s) => s.gameStatus);

  const halfBoard = levelData.boardSize / 2;
  const wallHeight = 0.85;
  const wallThickness = 0.4;

  // Dış çerçeve duvarları
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

  const resetBallAndBoard = useCallback(() => {
    _currentQuat.identity();
    if (visualTiltGroupRef.current) {
      visualTiltGroupRef.current.quaternion.identity();
    }
    if (ballBodyRef.current) {
      const [sx, , sz] = levelData.startPosition;
      ballBodyRef.current.setTranslation(
        { x: sx, y: BALL_RADIUS, z: sz },
        true,
      );
      ballBodyRef.current.setLinvel({ x: 0, y: 0, z: 0 }, true);
      ballBodyRef.current.setAngvel({ x: 0, y: 0, z: 0 }, true);
    }
  }, [levelData.startPosition]);

  useEffect(() => {
    resetBallAndBoard();
  }, [resetCount, levelData.id, resetBallAndBoard]);

  const handleBallCollision = useCallback(() => {
    if (!ballBodyRef.current) return;
    const now = performance.now();
    if (now - lastWallSoundTimeRef.current < 95) return;

    const vel = ballBodyRef.current.linvel();
    const speed = Math.hypot(vel.x, vel.z);
    if (speed > 1.3) {
      lastWallSoundTimeRef.current = now;
      onWallHit(speed);
    }
  }, [onWallHit]);

  useFrame((state, delta) => {
    const safeDelta = Math.min(delta, 0.05);

    if (goalRingRef.current) {
      goalRingRef.current.rotation.z += safeDelta * 1.8;
    }

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

    // 1. Görsel 3B tahtayı Quaternion Slerp ile pürüzsüzce eğ
    const slerpAlpha = 1 - Math.exp(-12 * safeDelta);
    _currentQuat.slerp(_targetQuat, slerpAlpha);
    _currentEuler.setFromQuaternion(_currentQuat, 'XYZ');

    if (visualTiltGroupRef.current) {
      visualTiltGroupRef.current.quaternion.copy(_currentQuat);
    }

    // 2. Fizik küresine eğim açısına karşılık gelen teğetsel yerçekimi ivmesini uygula (Zıplama = 0)
    if (ballBodyRef.current) {
      if (isInteractive) {
        const accelX = -SLOPE_GRAVITY * Math.sin(_currentEuler.z);
        const accelZ = SLOPE_GRAVITY * Math.sin(_currentEuler.x);

        const currentVel = ballBodyRef.current.linvel();
        const damping = Math.exp(-1.15 * safeDelta);
        const nextVx = (currentVel.x + accelX * safeDelta) * damping;
        const nextVz = (currentVel.z + accelZ * safeDelta) * damping;

        ballBodyRef.current.setLinvel({ x: nextVx, y: 0, z: nextVz }, true);
      } else {
        ballBodyRef.current.setLinvel({ x: 0, y: 0, z: 0 }, true);
      }

      // Görsel küreyi fiziksel kürenin tahta-yerel koordinatlarıyla eşitle
      const pos = ballBodyRef.current.translation();
      const vel = ballBodyRef.current.linvel();

      if (visualBallMeshRef.current) {
        visualBallMeshRef.current.position.set(pos.x, BALL_RADIUS, pos.z);
        // Yuvarlanma hissi için hız vektörüne dik açısal dönüş
        visualBallMeshRef.current.rotation.x +=
          (vel.z / BALL_RADIUS) * safeDelta;
        visualBallMeshRef.current.rotation.z -=
          (vel.x / BALL_RADIUS) * safeDelta;
      }
    }

    // 3. Kameraya hafif paralaks takibi uygula
    _cameraTargetPos.set(
      -clampedRoll * 2.8,
      14.5,
      10.2 + clampedPitch * 2.2,
    );
    state.camera.position.lerp(
      _cameraTargetPos,
      1 - Math.exp(-6 * safeDelta),
    );
    state.camera.lookAt(_cameraLookAt);
  });

  return (
    <>
      {/* =====================================================================
          1. GÖRÜNMEZ SABİT FİZİK ÇARPIŞTIRICILARI (TAHTA-YEREL KOORDİNATLAR)
          Zemin ve duvarlar fizik motorunda sabit olduğu için küre asla zıplamaz!
         ===================================================================== */}
      <RigidBody type="fixed" colliders={false} friction={0.2} restitution={0.15}>
        {/* Dış Duvar Çarpıştırıcıları */}
        {outerWalls.map((wall, idx) => (
          <CuboidCollider
            key={`phys-outer-${idx}`}
            args={[wall.size[0] / 2, wall.size[1] / 2, wall.size[2] / 2]}
            position={wall.position}
          />
        ))}

        {/* İç Duvar Çarpıştırıcıları */}
        {levelData.innerWalls.map((wall, idx) => (
          <CuboidCollider
            key={`phys-inner-${levelData.id}-${idx}`}
            args={[wall.size[0] / 2, wall.size[1] / 2, wall.size[2] / 2]}
            position={wall.position}
          />
        ))}

        {/* Hedef Portalı Sensörü */}
        <CylinderCollider
          args={[0.4, 0.48]}
          position={levelData.goalPosition}
          sensor
          onIntersectionEnter={onReachGoal}
        />

        {/* Tuzak Delikleri (Void Holes) Sensörleri */}
        {levelData.voidHoles.map((hole, idx) => (
          <CylinderCollider
            key={`phys-hole-${levelData.id}-${idx}`}
            args={[0.4, hole.radius ?? 0.38]}
            position={[hole.position[0], 0.25, hole.position[1]]}
            sensor
            onIntersectionEnter={() => {
              onFallIntoHole();
              resetBallAndBoard();
            }}
          />
        ))}
      </RigidBody>

      {/* Dinamik Fizik Küresi (Y ekseni kilitli -> Sıfır Zıplama!) */}
      <RigidBody
        ref={ballBodyRef}
        type="dynamic"
        colliders={false}
        position={[
          levelData.startPosition[0],
          BALL_RADIUS,
          levelData.startPosition[2],
        ]}
        enabledTranslations={[true, false, true]}
        enabledRotations={[false, false, false]}
        restitution={0.2}
        friction={0.1}
        ccd={true}
        onCollisionEnter={handleBallCollision}
      >
        <BallCollider args={[BALL_RADIUS]} />
      </RigidBody>

      {/* =====================================================================
          2. GÖRSEL 3B SAHNE GRUBU (QUATERNION SLERP İLE EĞİLEN GÖRSEL KATMAN)
         ===================================================================== */}
      <group ref={visualTiltGroupRef}>
        {/* Ana Labirent Zemin Plakası */}
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

        {/* Görsel Dış Çerçeve Duvarları */}
        {outerWalls.map((wall, idx) => (
          <mesh
            key={`vis-outer-${idx}`}
            position={wall.position}
            castShadow
            receiveShadow
          >
            <boxGeometry args={wall.size} />
            <meshStandardMaterial
              color="#27272a"
              roughness={0.35}
              metalness={0.45}
            />
          </mesh>
        ))}

        {/* Görsel İç Labirent Duvarları */}
        {levelData.innerWalls.map((wall, idx) => (
          <mesh
            key={`vis-inner-${levelData.id}-${idx}`}
            position={wall.position}
            castShadow
            receiveShadow
          >
            <boxGeometry args={wall.size} />
            <meshStandardMaterial
              color="#3f3f46"
              roughness={0.3}
              metalness={0.5}
            />
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
        >
          <ringGeometry args={[0.35, 0.52, 32]} />
          <meshBasicMaterial color="#38bdf8" transparent opacity={0.65} />
        </mesh>

        {/* Tuzak Delikleri (Kırmızı / Kara Delik Halkaları) */}
        {levelData.voidHoles.map((hole, idx) => {
          const r = hole.radius ?? 0.46;
          return (
            <group
              key={`vis-hole-${levelData.id}-${idx}`}
              position={[hole.position[0], 0.02, hole.position[1]]}
            >
              <mesh rotation={[-Math.PI / 2, 0, 0]}>
                <circleGeometry args={[r, 32]} />
                <meshBasicMaterial color="#050507" />
              </mesh>
              <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]}>
                <ringGeometry args={[r * 0.82, r * 1.08, 32]} />
                <meshStandardMaterial
                  color="#f43f5e"
                  emissive="#e11d48"
                  emissiveIntensity={1.4}
                />
              </mesh>
            </group>
          );
        })}

        {/* Hedef Portalı (Zümrüt Yeşili Sensör Bölgesi) */}
        <group position={levelData.goalPosition}>
          <mesh
            ref={goalRingRef}
            position={[0, -0.32, 0]}
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
          <mesh position={[0, -0.33, 0]} rotation={[-Math.PI / 2, 0, 0]}>
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

        {/* Görsel Metal Bilye */}
        <mesh
          ref={visualBallMeshRef}
          position={[
            levelData.startPosition[0],
            BALL_RADIUS,
            levelData.startPosition[2],
          ]}
          castShadow
          receiveShadow
        >
          <sphereGeometry args={[BALL_RADIUS, 48, 48]} />
          <meshStandardMaterial
            color="#f4f4f5"
            metalness={0.88}
            roughness={0.14}
          />
        </mesh>
      </group>
    </>
  );
}

/**
 * Masaüstü ekranında tam ekran çalışan 3B WebGL sahnesi.
 */
export function MazeScene() {
  const level = useGameStore((s) => s.level);
  const gameStatus = useGameStore((s) => s.gameStatus);
  const elapsedSeconds = useGameStore((s) => s.elapsedSeconds);
  const isSoundMuted = useGameStore((s) => s.isSoundMuted);
  const recordLevelCompletion = useGameStore((s) => s.recordLevelCompletion);
  const triggerHaptic = useGameStore((s) => s.triggerHaptic);
  const setElapsedSeconds = useGameStore((s) => s.setElapsedSeconds);

  const activeLevel = useMemo(() => {
    const index = (level - 1) % MAZE_LEVELS.length;
    return MAZE_LEVELS[index];
  }, [level]);

  const handleReachGoal = useCallback(() => {
    if (gameStatus !== 'won') {
      if (!isSoundMuted) {
        soundEngine.playVictory();
      }
      triggerHaptic('goal');
      recordLevelCompletion(activeLevel.id, elapsedSeconds);
    }
  }, [
    gameStatus,
    isSoundMuted,
    triggerHaptic,
    recordLevelCompletion,
    activeLevel.id,
    elapsedSeconds,
  ]);

  const handleFallIntoHole = useCallback(() => {
    if (!isSoundMuted) {
      soundEngine.playHoleFall();
    }
    triggerHaptic('hole');
    setElapsedSeconds(0);
  }, [isSoundMuted, triggerHaptic, setElapsedSeconds]);

  const handleWallHit = useCallback(
    (speed: number) => {
      if (!isSoundMuted) {
        soundEngine.playWallHit(Math.min(1, speed / 8));
      }
      if (speed > 2.4) {
        triggerHaptic('wall');
      }
    },
    [isSoundMuted, triggerHaptic],
  );

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
        <Physics gravity={[0, 0, 0]}>
          <MazeStage
            levelData={activeLevel}
            onReachGoal={handleReachGoal}
            onFallIntoHole={handleFallIntoHole}
            onWallHit={handleWallHit}
          />
        </Physics>
      </Canvas>
    </div>
  );
}
