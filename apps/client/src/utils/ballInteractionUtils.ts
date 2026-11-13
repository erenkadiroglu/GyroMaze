import type {
  BoostPadDefinition,
  TeleporterPairDefinition,
  LaserGateDefinition,
  MovingObstacleDefinition,
} from '@/components/scene/mazeLevels';
import {
  findCollidingBoostPad,
  calculateBoostVelocity,
  findTeleportDestination,
  isBallCollidingLaserGate,
  calculateMovingObstacleCollision,
} from './sceneCollisions.ts';
import { isLaserGateActive } from './sceneUtils.ts';
import { isWithinInteractionCooldown } from './sceneActorUtils.ts';

export const INTERACTION_COOLDOWNS = {
  boostPad: 0.45,
  teleport: 0.9,
  laserGate: 0.35,
  movingObstacle: 0.25,
} as const;

export const MOVING_OBSTACLE_WALL_HIT_SPEED = 5.5;

export interface InteractionCooldownMap {
  1: number;
  2: number;
}

/**
 * Oyuncular için etkileşim bekleme süresi haritasını başlatır.
 */
export function createInteractionCooldownMap(
  initialValue: number = -1,
): InteractionCooldownMap {
  return { 1: initialValue, 2: initialValue };
}

/**
 * Belirtilen oyuncu yuvası (slot) için tüm bekleme sürelerini sıfırlar.
 */
export function resetPlayerInteractionCooldowns(
  boostRef: InteractionCooldownMap,
  teleportRef: InteractionCooldownMap,
  movingHitRef: InteractionCooldownMap,
  hazardResetRef: InteractionCooldownMap,
  slot: 1 | 2,
): void {
  boostRef[slot] = -1;
  teleportRef[slot] = -1;
  movingHitRef[slot] = -1;
  hazardResetRef[slot] = -1;
}

export interface BoostCollisionResult {
  hit: boolean;
  newVelocity?: { x: number; y: number; z: number };
}

/**
 * Bilyenin hızlandırma rampasıyla etkileşimini ve yeni hız vektörünü hesaplar.
 */
export function evaluateBoostPadHit(
  pos: { x: number; z: number },
  currentLinvel: { x: number; y: number; z: number },
  boostPads: BoostPadDefinition[] | undefined,
  elapsed: number,
  lastBoostTime: number,
  cooldownSec: number = INTERACTION_COOLDOWNS.boostPad,
): BoostCollisionResult {
  if (isWithinInteractionCooldown(elapsed, lastBoostTime, cooldownSec)) {
    return { hit: false };
  }
  const hitPad = findCollidingBoostPad(pos, boostPads);
  if (!hitPad) {
    return { hit: false };
  }
  const boostV = calculateBoostVelocity(currentLinvel, hitPad.direction);
  return {
    hit: true,
    newVelocity: { x: boostV.x, y: 0, z: boostV.z },
  };
}

export interface TeleportCollisionResult {
  hit: boolean;
  destination?: [number, number];
}

/**
 * Bilyenin kuantum ışınlanma portalıyla etkileşimini ve hedef koordinatını hesaplar.
 */
export function evaluateTeleportHit(
  pos: { x: number; z: number },
  teleporters: TeleporterPairDefinition[] | undefined,
  elapsed: number,
  lastTeleportTime: number,
  cooldownSec: number = INTERACTION_COOLDOWNS.teleport,
): TeleportCollisionResult {
  if (isWithinInteractionCooldown(elapsed, lastTeleportTime, cooldownSec)) {
    return { hit: false };
  }
  const dest = findTeleportDestination(pos, teleporters);
  if (!dest) {
    return { hit: false };
  }
  return {
    hit: true,
    destination: dest,
  };
}

export interface LaserGateCollisionResult {
  hit: boolean;
}

/**
 * Bilyenin periyodik lazer bariyeriyle çarpışmasını değerlendirir.
 */
export function evaluateLaserGateHit(
  pos: { x: number; z: number },
  laserGates: LaserGateDefinition[] | undefined,
  elapsed: number,
  lastHazardResetTime: number,
  ballRadius: number,
  cooldownSec: number = INTERACTION_COOLDOWNS.laserGate,
): LaserGateCollisionResult {
  if (!laserGates || laserGates.length === 0) {
    return { hit: false };
  }
  if (isWithinInteractionCooldown(elapsed, lastHazardResetTime, cooldownSec)) {
    return { hit: false };
  }
  for (let i = 0; i < laserGates.length; i++) {
    const gate = laserGates[i];
    if (!isLaserGateActive(elapsed, gate.periodSeconds, gate.phaseOffset)) {
      continue;
    }
    if (isBallCollidingLaserGate(pos, gate, ballRadius)) {
      return { hit: true };
    }
  }
  return { hit: false };
}

export interface MovingObstacleHitResult {
  hit: boolean;
  reboundVel?: { x: number; y: number; z: number };
  hitSpeed?: number;
}

/**
 * Bilyenin hareketli devriye engelleriyle çarpışmasını ve sekme hızını değerlendirir.
 */
export function evaluateMovingObstacleHit(
  pos: { x: number; z: number },
  movingObstacles: MovingObstacleDefinition[] | undefined,
  elapsed: number,
  lastMovingHitTime: number,
  ballRadius: number,
  cooldownSec: number = INTERACTION_COOLDOWNS.movingObstacle,
  defaultHitSpeed: number = MOVING_OBSTACLE_WALL_HIT_SPEED,
): MovingObstacleHitResult {
  if (!movingObstacles || movingObstacles.length === 0) {
    return { hit: false };
  }
  if (isWithinInteractionCooldown(elapsed, lastMovingHitTime, cooldownSec)) {
    return { hit: false };
  }
  for (let i = 0; i < movingObstacles.length; i++) {
    const obs = movingObstacles[i];
    const collision = calculateMovingObstacleCollision(
      pos,
      obs,
      elapsed,
      ballRadius,
    );
    if (collision.isHit && collision.reboundVel) {
      return {
        hit: true,
        reboundVel: {
          x: collision.reboundVel.x,
          y: 0,
          z: collision.reboundVel.z,
        },
        hitSpeed: defaultHitSpeed,
      };
    }
  }
  return { hit: false };
}
