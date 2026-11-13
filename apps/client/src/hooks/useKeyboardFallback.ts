'use client';

import { useEffect } from 'react';
import {
  useGameStore,
  transientGyro,
  transientGyroP2,
} from '@/store/useGameStore';
import {
  isKeyboardFallbackBlocked,
  shouldIgnoreKeyboardEvent,
  isMovementKey,
  shouldPreventDefaultMovementKey,
  calculateSinglePlayerKeyboardTilt,
  calculateMultiplayerKeyboardTilt,
} from '@/utils/keyboardFallbackUtils';

/**
 * Mobil cihaz bağlı olmadığında masaüstünde WASD veya Yön Tuşları ile
 * 3B labirenti test edebilmeyi ve Çok Oyunculu (2 Oyuncu) modda
 * 1. Oyuncu (WASD / 1. Telefon) ile 2. Oyuncuyu (Yön Tuşları / 2. Telefon) kontrol edebilmeyi sağlayan hook.
 */
export function useKeyboardFallback(): void {
  const isControllerPaired = useGameStore((s) => s.isControllerPaired);
  const isSecondControllerPaired = useGameStore(
    (s) => s.isSecondControllerPaired,
  );
  const isMultiplayer = useGameStore((s) => s.isMultiplayer);
  const gameStatus = useGameStore((s) => s.gameStatus);
  const isPairingModalOpen = useGameStore((s) => s.isPairingModalOpen);
  const isSettingsOpen = useGameStore((s) => s.isSettingsOpen);
  const isEditorOpen = useGameStore((s) => s.isEditorOpen);
  const isLeaderboardOpen = useGameStore((s) => s.isLeaderboardOpen);

  const isBlocked = isKeyboardFallbackBlocked(
    isPairingModalOpen,
    isSettingsOpen,
    isEditorOpen,
    isLeaderboardOpen,
    gameStatus,
  );

  useEffect(() => {
    const pressedKeys = new Set<string>();

    const resetKeyboardAxes = () => {
      const now = Date.now();
      if (!isControllerPaired) {
        transientGyro.beta = 0;
        transientGyro.gamma = 0;
        transientGyro.timestamp = now;
      }
      if (!isSecondControllerPaired) {
        transientGyroP2.beta = 0;
        transientGyroP2.gamma = 0;
        transientGyroP2.timestamp = now;
      }
    };

    if (isBlocked) {
      resetKeyboardAxes();
      return;
    }

    const updateFromKeys = () => {
      const now = Date.now();
      if (!isMultiplayer) {
        if (isControllerPaired) return;
        const { beta, gamma } = calculateSinglePlayerKeyboardTilt(pressedKeys);
        transientGyro.beta = beta;
        transientGyro.gamma = gamma;
        transientGyro.timestamp = now;
        return;
      }

      const { p1, p2 } = calculateMultiplayerKeyboardTilt(
        pressedKeys,
        isControllerPaired,
        isSecondControllerPaired,
      );

      if (!isControllerPaired) {
        transientGyro.beta = p1.beta;
        transientGyro.gamma = p1.gamma;
        transientGyro.timestamp = now;
      }

      if (!isSecondControllerPaired) {
        transientGyroP2.beta = p2.beta;
        transientGyroP2.gamma = p2.gamma;
        transientGyroP2.timestamp = now;
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        shouldIgnoreKeyboardEvent({
          ctrlKey: e.ctrlKey,
          metaKey: e.metaKey,
          altKey: e.altKey,
          target: e.target as HTMLElement | null,
        })
      ) {
        return;
      }

      if (isMovementKey(e.code)) {
        if (shouldPreventDefaultMovementKey(e.code)) {
          e.preventDefault();
        }
        if (pressedKeys.has(e.code)) return;
        pressedKeys.add(e.code);
        updateFromKeys();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (pressedKeys.has(e.code)) {
        pressedKeys.delete(e.code);
        updateFromKeys();
      }
    };

    const handleReleaseAllKeys = () => {
      if (pressedKeys.size === 0) return;
      pressedKeys.clear();
      resetKeyboardAxes();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        handleReleaseAllKeys();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleReleaseAllKeys);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleReleaseAllKeys);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      resetKeyboardAxes();
    };
  }, [
    isControllerPaired,
    isSecondControllerPaired,
    isMultiplayer,
    isBlocked,
  ]);
}

