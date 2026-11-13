'use client';

import { useRef, useCallback } from 'react';
import { useGameStore } from '@/store/useGameStore';
import { soundEngine } from '@/utils/soundEngine';
import { calculateEarnedStars } from '@/utils/gameOutcomeUtils';
import { MazeLevelDefinition } from '@/components/scene/mazeLevels';
import {
  calculateWallHitIntensity,
  shouldWarnLockedPortal,
  getRemainingCrystalsCount,
  formatLockedPortalMessage,
  formatAllCrystalsCollectedMessage,
  canTriggerGoal,
  resolveHazardFallAction,
} from '@/utils/sceneEventUtils';

export interface UseMazeSceneEventsOptions {
  activeLevel: MazeLevelDefinition;
}

/**
 * 3B Labirent Sahnesi Olay İşleyicileri ve Ses/Haptik Orkestrasyon Kancası.
 * Kristal toplama, hedefe varış, boşluğa düşüş, lazer çarpması, rampa, portal ve duvar çarpışmalarını yönetir.
 */
export function useMazeSceneEvents({ activeLevel }: UseMazeSceneEventsOptions) {
  const isSoundMuted = useGameStore((s) => s.isSoundMuted);
  const collectedCrystals = useGameStore((s) => s.collectedCrystals);
  const collectCrystal = useGameStore((s) => s.collectCrystal);
  const recordLevelCompletion = useGameStore((s) => s.recordLevelCompletion);
  const triggerHaptic = useGameStore((s) => s.triggerHaptic);
  const triggerBallReset = useGameStore((s) => s.triggerBallReset);
  const showHudNotification = useGameStore((s) => s.showHudNotification);

  const lastLockedWarnTimeRef = useRef<number>(0);

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
        showHudNotification(formatAllCrystalsCollectedMessage(), 'success');
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
      const isPageHidden = typeof document !== 'undefined' && document.hidden;
      const isAnyModalOpen =
        state.isPairingModalOpen ||
        state.isSettingsOpen ||
        state.isEditorOpen ||
        state.isLeaderboardOpen;

      if (!canTriggerGoal(state.gameStatus, isPageHidden, isAnyModalOpen)) {
        return;
      }

      const goalUnlocked =
        state.collectedCrystals.length >= activeLevel.crystals.length;
      if (!goalUnlocked) {
        const now = performance.now();
        if (shouldWarnLockedPortal(now, lastLockedWarnTimeRef.current, 1300)) {
          lastLockedWarnTimeRef.current = now;
          if (!isSoundMuted) {
            soundEngine.playLockedPortal();
          }
          triggerHaptic('wall', winnerSlot);
          const remaining = getRemainingCrystalsCount(
            activeLevel.crystals.length,
            state.collectedCrystals.length,
          );
          showHudNotification(formatLockedPortalMessage(remaining), 'warn');
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
      const action = resolveHazardFallAction(
        useGameStore.getState().isMultiplayer,
        slot,
        'hole',
      );
      if (action.shouldResetBall) {
        triggerBallReset();
      } else if (action.notificationMessage) {
        showHudNotification(action.notificationMessage, action.notificationType);
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
      const action = resolveHazardFallAction(
        useGameStore.getState().isMultiplayer,
        slot,
        'laser',
      );
      if (action.shouldResetBall) {
        triggerBallReset();
      } else if (action.notificationMessage) {
        showHudNotification(action.notificationMessage, action.notificationType);
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
      const { volume, triggerHaptic: shouldVibrate } =
        calculateWallHitIntensity(speed);
      if (!isSoundMuted) {
        soundEngine.playWallHit(volume);
      }
      if (shouldVibrate) {
        triggerHaptic('wall', slot);
      }
    },
    [isSoundMuted, triggerHaptic],
  );

  return {
    isGoalUnlocked,
    collectedCrystals,
    handleCollectCrystal,
    handleReachGoal,
    handleFallIntoHole,
    handleLaserHit,
    handleBoostHit,
    handleTeleportHit,
    handleWallHit,
  };
}
