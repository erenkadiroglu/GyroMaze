import type {
  LaserGateDefinition,
  BoostPadDefinition,
  TeleporterPairDefinition,
  MovingObstacleDefinition,
} from '../components/scene/mazeLevels.ts';
import { calculateMovingObstacleOffset } from './sceneUtils.ts';

export interface BallCoord {
  x: number;
  z: number;
}

export interface Velocity2D {
  x: number;
  z: number;
}

export interface MovingCollisionResult {
  isHit: boolean;
  reboundVel?: Velocity2D;
}

/**
 * Bilyenin toplanmamış enerji kristallerinden biriyle temas edip etmediğini kontrol eder.
 * Çarpışma varsa bulunan ilk kristalin dizinini, aksi halde -1 döner.
 */
export function findCollidingCrystalIndex(
  pos: BallCoord,
  crystals: Array<[number, number]>,
  collectedCrystals: number[],
  thresholdSq = 0.42,
): number {
  for (let i = 0; i < crystals.length; i++) {
    if (!collectedCrystals.includes(i)) {
      const [cx, cz] = crystals[i];
      const dx = pos.x - cx;
      const dz = pos.z - cz;
      if (dx * dx + dz * dz < thresholdSq) {
        return i;
      }
    }
  }
  return -1;
}

/**
 * Bilyenin herhangi bir hızlandırma rampası (Boost Pad) üzerinde olup olmadığını denetler.
 */
export function findCollidingBoostPad(
  pos: BallCoord,
  boostPads: BoostPadDefinition[] | undefined,
  thresholdSq = 0.34,
): BoostPadDefinition | null {
  if (!boostPads || boostPads.length === 0) return null;
  for (let i = 0; i < boostPads.length; i++) {
    const pad = boostPads[i];
    const dx = pos.x - pad.position[0];
    const dz = pos.z - pad.position[1];
    if (dx * dx + dz * dz < thresholdSq) {
      return pad;
    }
  }
  return null;
}

/**
 * Hızlandırma rampasına çarpan bilyeye yönlü kinetik darbe uygular.
 */
export function calculateBoostVelocity(
  currentVel: Velocity2D,
  padDirection: [number, number],
  impulse = 7.2,
): Velocity2D {
  return {
    x: currentVel.x + padDirection[0] * impulse,
    z: currentVel.z + padDirection[1] * impulse,
  };
}

/**
 * Çift yönlü kuantum portallarına temas eden bilyenin ışınlanacağı hedef koordinatı döner.
 */
export function findTeleportDestination(
  pos: BallCoord,
  teleporters: TeleporterPairDefinition[] | undefined,
  thresholdSq = 0.24,
): [number, number] | null {
  if (!teleporters || teleporters.length === 0) return null;
  for (let i = 0; i < teleporters.length; i++) {
    const pair = teleporters[i];
    const dEntrySq =
      (pos.x - pair.entry[0]) ** 2 + (pos.z - pair.entry[1]) ** 2;
    const dExitSq =
      (pos.x - pair.exit[0]) ** 2 + (pos.z - pair.exit[1]) ** 2;

    if (dEntrySq < thresholdSq) {
      return pair.exit;
    }
    if (dExitSq < thresholdSq) {
      return pair.entry;
    }
  }
  return null;
}

/**
 * Lazer kapısının aktif olduğu anda bilyenin lazer ışını koridorunu kesip kesmediğini test eder.
 */
export function isBallCollidingLaserGate(
  pos: BallCoord,
  gate: LaserGateDefinition,
  ballRadius = 0.34,
): boolean {
  const [gx, gz] = gate.position;
  const halfLen = gate.length / 2;
  const hitThreshold = ballRadius + 0.08;

  if (gate.axis === 'x') {
    return (
      Math.abs(pos.z - gz) < hitThreshold && Math.abs(pos.x - gx) < halfLen
    );
  }
  return (
    Math.abs(pos.x - gx) < hitThreshold && Math.abs(pos.z - gz) < halfLen
  );
}

/**
 * Bilyenin hareketli devriye engeline çarpıp çarpmadığını ve geri tepme (rebound) hızını hesaplar.
 */
export function calculateMovingObstacleCollision(
  pos: BallCoord,
  obstacle: MovingObstacleDefinition,
  elapsed: number,
  ballRadius = 0.34,
  obstacleRadius = 0.38,
): MovingCollisionResult {
  const offset = calculateMovingObstacleOffset(
    elapsed,
    obstacle.speed,
    obstacle.phaseOffset,
    obstacle.amplitude,
  );
  const ox =
    obstacle.axis === 'x' ? obstacle.center[0] + offset : obstacle.center[0];
  const oz =
    obstacle.axis === 'z' ? obstacle.center[1] + offset : obstacle.center[1];

  const dx = pos.x - ox;
  const dz = pos.z - oz;
  const distSq = dx * dx + dz * dz;
  const minDist = ballRadius + obstacleRadius;

  if (distSq < minDist * minDist) {
    const dist = Math.sqrt(distSq);
    const nx = dist > 1e-4 ? dx / dist : obstacle.axis === 'x' ? 0 : 1;
    const nz = dist > 1e-4 ? dz / dist : obstacle.axis === 'x' ? 1 : 0;
    return {
      isHit: true,
      reboundVel: {
        x: nx * 6.8,
        z: nz * 6.8,
      },
    };
  }

  return { isHit: false };
}

/**
 * Bilyenin hedef portalının içinde olup olmadığını denetler.
 */
export function isBallInsideGoal(
  pos: BallCoord,
  goalPosition: [number, number, number],
  thresholdSq = 0.49,
): boolean {
  const dx = pos.x - goalPosition[0];
  const dz = pos.z - goalPosition[2];
  return dx * dx + dz * dz < thresholdSq;
}

/**
 * Oyun etkileşimli ve hedef açılmışken bilyenin hedefe ulaşıp ulaşmadığını denetler.
 */
export function canTriggerGoalReach(
  isInteractive: boolean,
  isGoalUnlocked: boolean,
  pos: BallCoord,
  goalPosition: [number, number, number],
  thresholdSq = 0.2116,
): boolean {
  if (!isInteractive || !isGoalUnlocked) return false;
  return isBallInsideGoal(pos, goalPosition, thresholdSq);
}

/**
 * Tahtanın eğim açısına ve yerçekimine göre bilyenin bir sonraki hız vektörünü hesaplar.
 */
export function stepBallVelocity(
  currentVel: Velocity2D,
  tiltEuler: { x: number; z: number },
  gravityScale: number,
  delta: number,
  dampingCoeff = 0.55,
): Velocity2D {
  const accelX = -gravityScale * Math.sin(tiltEuler.z);
  const accelZ = gravityScale * Math.sin(tiltEuler.x);

  const damping = Math.exp(-dampingCoeff * delta);
  const nextVx = (currentVel.x + accelX * delta) * damping;
  const nextVz = (currentVel.z + accelZ * delta) * damping;

  return { x: nextVx, z: nextVz };
}

