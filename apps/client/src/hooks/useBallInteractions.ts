'use client';

import { useRef, useCallback } from 'react';
import type { RapierRigidBody } from '@react-three/rapier';
import { useGameStore } from '@/store/useGameStore';
import type { MazeLevelDefinition } from '../components/scene/mazeLevels';
import {
  findCollidingCrystalIndex,
  findCollidingBoostPad,
  calculateBoostVelocity,
  findTeleportDestination,
  isBallCollidingLaserGate,
  calculateMovingObstacleCollision,
} from '@/utils/sceneCollisions';
import { isLaserGateActive } from '@/utils/sceneUtils';
import { isWithinInteractionCooldown } from '@/utils/sceneActorUtils';
import { BALL_RADIUS, TRAIL_COUNT } from '../components/scene/sceneMaterials';

export interface UseBallInteractionsParams {
  levelData: MazeLevelDefinition;
  isMultiplayer: boolean;
  trailHistoryRef: React.MutableRefObject<Array<{ x: number; z: number }>>;
  onCollectCrystal: (idx: number) => void;
  onBoostHit: (slot: 1 | 2) => void;
  onTeleportHit: (slot: 1 | 2) => void;
  onLaserHit: (slot: 1 | 2) => void;
  onWallHit: (speed: number, slot: 1 | 2) => void;
  resetSingleBall: (body: RapierRigidBody | null, slot: 1 | 2) => void;
  resetBallAndBoard: () => void;
}

/**
 * 3B Labirent bilye etkileşim döngüsü ve bekleme süresi (cooldown) yöneticisi kancası.
 * Kristal toplama, rampalar, kuantum portalları, lazer kapıları ve kinetik engelleri yönetir.
 */
export function useBallInteractions({
  levelData,
  isMultiplayer,
  trailHistoryRef,
  onCollectCrystal,
  onBoostHit,
  onTeleportHit,
  onLaserHit,
  onWallHit,
  resetSingleBall,
  resetBallAndBoard,
}: UseBallInteractionsParams) {
  const resetSingleBallRef = useRef(resetSingleBall);
  resetSingleBallRef.current = resetSingleBall;
  const resetBallAndBoardRef = useRef(resetBallAndBoard);
  resetBallAndBoardRef.current = resetBallAndBoard;

  const lastBoostTimeRef = useRef<{ 1: number; 2: number }>({ 1: -1, 2: -1 });
  const lastTeleportTimeRef = useRef<{ 1: number; 2: number }>({ 1: -1, 2: -1 });
  const lastMovingHitTimeRef = useRef<{ 1: number; 2: number }>({
    1: -1,
    2: -1,
  });
  const lastHazardResetTimeRef = useRef<{ 1: number; 2: number }>({
    1: -1,
    2: -1,
  });

  const resetInteractionCooldowns = useCallback((slot: 1 | 2) => {
    lastBoostTimeRef.current[slot] = -1;
    lastTeleportTimeRef.current[slot] = -1;
    lastMovingHitTimeRef.current[slot] = -1;
    lastHazardResetTimeRef.current[slot] = -1;
  }, []);

  const processBallInteractions = useCallback(
    (
      body: RapierRigidBody,
      pos: { x: number; z: number },
      slot: 1 | 2,
      elapsed: number,
      isInteractive: boolean,
    ) => {
      if (!isInteractive) return;

      // 1. Enerji Kristali Toplama Kontrolü
      const liveCollected = useGameStore.getState().collectedCrystals;
      const crystalIdx = findCollidingCrystalIndex(
        pos,
        levelData.crystals,
        liveCollected,
      );
      if (crystalIdx !== -1) {
        onCollectCrystal(crystalIdx);
      }

      // 2. Hızlandırma Rampaları (Boost Pads) Kontrolü (0.45s cooldown)
      if (!isWithinInteractionCooldown(elapsed, lastBoostTimeRef.current[slot], 0.45)) {
        const hitPad = findCollidingBoostPad(pos, levelData.boostPads);
        if (hitPad) {
          lastBoostTimeRef.current[slot] = elapsed;
          const curV = body.linvel();
          const boostV = calculateBoostVelocity(curV, hitPad.direction);
          body.setLinvel({ x: boostV.x, y: 0, z: boostV.z }, true);
          onBoostHit(slot);
        }
      }

      // 3. Çift Yönlü Kuantum Işınlanma Portalları (Teleporters) Kontrolü (0.9s cooldown)
      if (!isWithinInteractionCooldown(elapsed, lastTeleportTimeRef.current[slot], 0.9)) {
        const dest = findTeleportDestination(pos, levelData.teleporters);
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
        }
      }

      // 4. Periyodik Lazer Kapıları Kontrolü (0.35s cooldown)
      if (!isWithinInteractionCooldown(elapsed, lastHazardResetTimeRef.current[slot], 0.35)) {
        for (let i = 0; i < levelData.laserGates.length; i++) {
          const gate = levelData.laserGates[i];
          if (!isLaserGateActive(elapsed, gate.periodSeconds, gate.phaseOffset)) {
            continue;
          }

          if (isBallCollidingLaserGate(pos, gate, BALL_RADIUS)) {
            lastHazardResetTimeRef.current[slot] = elapsed;
            onLaserHit(slot);
            if (isMultiplayer) {
              resetSingleBallRef.current(body, slot);
            } else {
              resetBallAndBoardRef.current();
            }
            break;
          }
        }
      }

      // 5. Hareketli Devriye Engelleri Kontrolü (0.25s cooldown)
      const movingObstacles = levelData.movingObstacles ?? [];
      if (
        movingObstacles.length > 0 &&
        !isWithinInteractionCooldown(elapsed, lastMovingHitTimeRef.current[slot], 0.25)
      ) {
        for (let i = 0; i < movingObstacles.length; i++) {
          const obs = movingObstacles[i];
          const result = calculateMovingObstacleCollision(
            pos,
            obs,
            elapsed,
            BALL_RADIUS,
          );
          if (result.isHit && result.reboundVel) {
            lastMovingHitTimeRef.current[slot] = elapsed;
            body.setLinvel(
              { x: result.reboundVel.x, y: 0, z: result.reboundVel.z },
              true,
            );
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
      trailHistoryRef,
      onCollectCrystal,
      onBoostHit,
      onTeleportHit,
      onLaserHit,
      onWallHit,
      resetSingleBall,
      resetBallAndBoard,
    ],
  );

  return {
    processBallInteractions,
    resetInteractionCooldowns,
  };
}
