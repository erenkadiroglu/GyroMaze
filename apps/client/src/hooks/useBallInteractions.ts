'use client';

import { useRef, useCallback } from 'react';
import type { RapierRigidBody } from '@react-three/rapier';
import { useGameStore } from '@/store/useGameStore';
import type { MazeLevelDefinition } from '../components/scene/mazeLevels';
import { findCollidingCrystalIndex } from '@/utils/sceneCollisions';
import {
  createInteractionCooldownMap,
  resetPlayerInteractionCooldowns,
  evaluateBoostPadHit,
  evaluateTeleportHit,
  evaluateLaserGateHit,
  evaluateMovingObstacleHit,
  type InteractionCooldownMap,
} from '@/utils/ballInteractionUtils';
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

  const lastBoostTimeRef = useRef<InteractionCooldownMap>(createInteractionCooldownMap());
  const lastTeleportTimeRef = useRef<InteractionCooldownMap>(createInteractionCooldownMap());
  const lastMovingHitTimeRef = useRef<InteractionCooldownMap>(createInteractionCooldownMap());
  const lastHazardResetTimeRef = useRef<InteractionCooldownMap>(createInteractionCooldownMap());

  const resetInteractionCooldowns = useCallback((slot: 1 | 2) => {
    resetPlayerInteractionCooldowns(
      lastBoostTimeRef.current,
      lastTeleportTimeRef.current,
      lastMovingHitTimeRef.current,
      lastHazardResetTimeRef.current,
      slot,
    );
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

      // 2. Hızlandırma Rampaları (Boost Pads) Kontrolü
      const boostResult = evaluateBoostPadHit(
        pos,
        body.linvel(),
        levelData.boostPads,
        elapsed,
        lastBoostTimeRef.current[slot],
      );
      if (boostResult.hit && boostResult.newVelocity) {
        lastBoostTimeRef.current[slot] = elapsed;
        body.setLinvel(boostResult.newVelocity, true);
        onBoostHit(slot);
      }

      // 3. Çift Yönlü Kuantum Işınlanma Portalları (Teleporters) Kontrolü
      const teleportResult = evaluateTeleportHit(
        pos,
        levelData.teleporters,
        elapsed,
        lastTeleportTimeRef.current[slot],
      );
      if (teleportResult.hit && teleportResult.destination) {
        lastTeleportTimeRef.current[slot] = elapsed;
        const [destX, destZ] = teleportResult.destination;
        body.setTranslation({ x: destX, y: BALL_RADIUS, z: destZ }, true);
        if (slot === 1) {
          for (let t = 0; t < TRAIL_COUNT; t++) {
            trailHistoryRef.current[t].x = destX;
            trailHistoryRef.current[t].z = destZ;
          }
        }
        onTeleportHit(slot);
      }

      // 4. Periyodik Lazer Kapıları Kontrolü
      const laserResult = evaluateLaserGateHit(
        pos,
        levelData.laserGates,
        elapsed,
        lastHazardResetTimeRef.current[slot],
        BALL_RADIUS,
      );
      if (laserResult.hit) {
        lastHazardResetTimeRef.current[slot] = elapsed;
        onLaserHit(slot);
        if (isMultiplayer) {
          resetSingleBallRef.current(body, slot);
        } else {
          resetBallAndBoardRef.current();
        }
      }

      // 5. Hareketli Devriye Engelleri Kontrolü
      const movingResult = evaluateMovingObstacleHit(
        pos,
        levelData.movingObstacles,
        elapsed,
        lastMovingHitTimeRef.current[slot],
        BALL_RADIUS,
      );
      if (movingResult.hit && movingResult.reboundVel) {
        lastMovingHitTimeRef.current[slot] = elapsed;
        body.setLinvel(movingResult.reboundVel, true);
        onWallHit(movingResult.hitSpeed ?? 5.5, slot);
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
