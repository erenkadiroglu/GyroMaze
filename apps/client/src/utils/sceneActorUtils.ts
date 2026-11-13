import {
  calculateMovingObstacleOffset,
  isLaserGateActive,
} from './sceneUtils.ts';
import { calculateBallRollingRotation } from './sceneCameraUtils.ts';

export interface MovingObstacleSpec {
  center: [number, number];
  axis: 'x' | 'z';
  speed: number;
  phaseOffset: number;
  amplitude: number;
}

/**
 * Hedef portal halkasının açılma durumuna göre yeni z-rotasyon açısını hesaplar.
 */
export function calculateGoalRingRotation(
  currentRotationZ: number,
  isGoalUnlocked: boolean,
  delta: number,
): number {
  const speed = isGoalUnlocked ? 2.4 : 0.8;
  return currentRotationZ + delta * speed;
}

/**
 * Kristalin havada süzülme (yüksekliğini) ve kendi etrafında dönme açısını hesaplar.
 */
export function calculateCrystalFloatTransform(
  elapsed: number,
  index: number,
  currentRotationY: number,
  delta: number,
): { y: number; rotationY: number } {
  return {
    y: Number((0.42 + Math.sin(elapsed * 3.5 + index) * 0.08).toFixed(4)),
    rotationY: currentRotationY + delta * 2.5,
  };
}

/**
 * Hareketli kinetik devriye engelinin sinüzoidal 3B dünya koordinatını hesaplar.
 */
export function calculateObstacleMeshPosition(
  obs: MovingObstacleSpec,
  elapsed: number,
): [number, number, number] {
  const offset = calculateMovingObstacleOffset(
    elapsed,
    obs.speed,
    obs.phaseOffset,
    obs.amplitude,
  );
  const ox = obs.axis === 'x' ? obs.center[0] + offset : obs.center[0];
  const oz = obs.axis === 'z' ? obs.center[1] + offset : obs.center[1];
  return [Number(ox.toFixed(4)), 0.36, Number(oz.toFixed(4))];
}

/**
 * Hareketli engelin kendi ekseni etrafında dönme açısını hesaplar.
 */
export function calculateObstacleRotationY(
  currentRotationY: number,
  isInteractive: boolean,
  delta: number,
  rotationSpeed: number = 1.8,
): number {
  if (!isInteractive) return currentRotationY;
  return currentRotationY + delta * rotationSpeed;
}

/**
 * Etkileşimin bekleme (cooldown) süresi içinde olup olmadığını denetler.
 */
export function isWithinInteractionCooldown(
  elapsed: number,
  lastHitTime: number,
  cooldownThreshold: number,
): boolean {
  if (lastHitTime < 0) return false;
  return elapsed - lastHitTime <= cooldownThreshold;
}

/**
 * Transient jiroskop telemetri nesnesini bellek ayırmadan anında günceller.
 */
export function updateTransientTelemetry(
  target: { ballX: number; ballZ: number; ballSpeed: number },
  pos: { x: number; z: number },
  vel: { x: number; z: number },
): void {
  target.ballX = pos.x;
  target.ballZ = pos.z;
  target.ballSpeed = Math.hypot(vel.x, vel.z);
}

/**
 * Görsel bilye mesh'inin 3B konumunu, görünürlüğünü ve yuvarlanma dönüşünü günceller.
 */
export function updateBallActorTransform(
  mesh: {
    position: { set: (x: number, y: number, z: number) => void };
    rotation: { x: number; z: number };
    visible?: boolean;
  } | null,
  pos: { x: number; z: number },
  vel: { x: number; z: number },
  radius: number,
  delta: number,
  isVisible: boolean = true,
): void {
  if (!mesh) return;
  mesh.visible = isVisible;
  mesh.position.set(pos.x, radius, pos.z);
  const nextRot = calculateBallRollingRotation(
    mesh.rotation,
    vel,
    radius,
    delta,
  );
  mesh.rotation.x = nextRot.x;
  mesh.rotation.z = nextRot.z;
}

/**
 * 1. veya 2. oyuncu için bilye başlangıç doğuş (spawn) 3B koordinatını hesaplar.
 */
export function calculateBallSpawnPosition(
  startPosition: [number, number, number],
  slot: 1 | 2,
  p2OffsetX: number,
  p2OffsetZ: number,
  ballRadius = 0.28,
): [number, number, number] {
  const [sx, , sz] = startPosition;
  const targetX = slot === 2 ? sx + p2OffsetX : sx;
  const targetZ = slot === 2 ? sz + p2OffsetZ : sz;
  return [targetX, ballRadius, targetZ];
}

/**
 * Kristallerin havada süzülme ve dönme animasyonlarını tüm görünür kristal mesh'leri için günceller.
 */
export function updateCrystalsAnimation(
  meshes: Array<{
    position: { y: number };
    rotation: { y: number };
    visible?: boolean;
  } | null | undefined>,
  crystalCount: number,
  elapsed: number,
  delta: number,
): void {
  for (let i = 0; i < crystalCount; i++) {
    const mesh = meshes[i];
    if (mesh && mesh.visible) {
      const { y, rotationY } = calculateCrystalFloatTransform(
        elapsed,
        i,
        mesh.rotation.y,
        delta,
      );
      mesh.rotation.y = rotationY;
      mesh.position.y = y;
    }
  }
}

/**
 * Lazer kapısı ışın mesh'lerinin görünürlüğünü aktif/pasif periyoduna göre günceller.
 */
export function updateLaserBeamsVisibility(
  beamMeshes: Array<{ visible: boolean } | null | undefined>,
  laserGates: Array<{ periodSeconds: number; phaseOffset: number }>,
  hazardElapsed: number,
): void {
  for (let i = 0; i < laserGates.length; i++) {
    const gate = laserGates[i];
    const beamMesh = beamMeshes[i];
    if (beamMesh) {
      beamMesh.visible = isLaserGateActive(
        hazardElapsed,
        gate.periodSeconds,
        gate.phaseOffset,
      );
    }
  }
}

/**
 * Hareketli devriye engellerinin görsel konum ve kendi ekseni etrafında dönüşünü günceller.
 */
export function updateMovingObstaclesTransform(
  obstacleMeshes: Array<{
    position: { set: (x: number, y: number, z: number) => void };
    rotation: { y: number };
  } | null | undefined>,
  movingObstacles: MovingObstacleSpec[],
  hazardElapsed: number,
  isInteractive: boolean,
  delta: number,
): void {
  for (let i = 0; i < movingObstacles.length; i++) {
    const obs = movingObstacles[i];
    const mesh = obstacleMeshes[i];
    if (mesh) {
      mesh.position.set(...calculateObstacleMeshPosition(obs, hazardElapsed));
      mesh.rotation.y = calculateObstacleRotationY(
        mesh.rotation.y,
        isInteractive,
        delta,
      );
    }
  }
}

/**
 * Bilye hareket izi (motion trail) başlangıç 3B konumu ve düzlem rotasyonunu hesaplar.
 */
export function resolveTrailInitialTransform(
  startPosition: [number, number, number],
): { position: [number, number, number]; rotation: [number, number, number] } {
  return {
    position: [startPosition[0], 0.025, startPosition[2]],
    rotation: [-Math.PI / 2, 0, 0],
  };
}




