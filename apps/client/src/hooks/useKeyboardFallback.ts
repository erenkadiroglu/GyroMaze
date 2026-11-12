'use client';

import { useEffect } from 'react';
import {
  useGameStore,
  transientGyro,
  transientGyroP2,
} from '@/store/useGameStore';

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

  const isBlocked =
    isPairingModalOpen ||
    isSettingsOpen ||
    isEditorOpen ||
    isLeaderboardOpen ||
    gameStatus !== 'playing';

  useEffect(() => {
    const pressedKeys = new Set<string>();
    const TILT_DEGREES = 20;

    const resetKeyboardAxes = () => {
      if (!isControllerPaired) {
        transientGyro.beta = 0;
        transientGyro.gamma = 0;
        transientGyro.timestamp = Date.now();
      }
      if (isMultiplayer && !isSecondControllerPaired) {
        transientGyroP2.beta = 0;
        transientGyroP2.gamma = 0;
        transientGyroP2.timestamp = Date.now();
      }
    };

    if (isBlocked) {
      resetKeyboardAxes();
      return;
    }

    const updateFromKeys = () => {
      if (!isMultiplayer) {
        if (isControllerPaired) return;
        let beta = 0;
        let gamma = 0;

        if (pressedKeys.has('KeyW') || pressedKeys.has('ArrowUp')) {
          beta -= TILT_DEGREES;
        }
        if (pressedKeys.has('KeyS') || pressedKeys.has('ArrowDown')) {
          beta += TILT_DEGREES;
        }
        if (pressedKeys.has('KeyA') || pressedKeys.has('ArrowLeft')) {
          gamma -= TILT_DEGREES;
        }
        if (pressedKeys.has('KeyD') || pressedKeys.has('ArrowRight')) {
          gamma += TILT_DEGREES;
        }

        transientGyro.beta = beta;
        transientGyro.gamma = gamma;
        transientGyro.timestamp = Date.now();
        return;
      }

      // Çok Oyunculu Mod: 1. Telefon bağlı değilse WASD -> Oyuncu 1
      if (!isControllerPaired) {
        let b1 = 0;
        let g1 = 0;
        if (pressedKeys.has('KeyW')) b1 -= TILT_DEGREES;
        if (pressedKeys.has('KeyS')) b1 += TILT_DEGREES;
        if (pressedKeys.has('KeyA')) g1 -= TILT_DEGREES;
        if (pressedKeys.has('KeyD')) g1 += TILT_DEGREES;
        transientGyro.beta = b1;
        transientGyro.gamma = g1;
        transientGyro.timestamp = Date.now();
      }

      // Çok Oyunculu Mod: 2. Telefon bağlı değilse Yön Tuşları -> Oyuncu 2
      if (!isSecondControllerPaired) {
        let b2 = 0;
        let g2 = 0;
        if (pressedKeys.has('ArrowUp')) b2 -= TILT_DEGREES;
        if (pressedKeys.has('ArrowDown')) b2 += TILT_DEGREES;
        if (pressedKeys.has('ArrowLeft')) g2 -= TILT_DEGREES;
        if (pressedKeys.has('ArrowRight')) g2 += TILT_DEGREES;
        transientGyroP2.beta = b2;
        transientGyroP2.gamma = g2;
        transientGyroP2.timestamp = Date.now();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName;
      if (
        tag === 'INPUT' ||
        tag === 'TEXTAREA' ||
        tag === 'SELECT' ||
        target?.isContentEditable
      ) {
        return;
      }

      if (
        [
          'KeyW',
          'KeyA',
          'KeyS',
          'KeyD',
          'ArrowUp',
          'ArrowDown',
          'ArrowLeft',
          'ArrowRight',
        ].includes(e.code)
      ) {
        if (e.code.startsWith('Arrow')) {
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
    };
  }, [
    isControllerPaired,
    isSecondControllerPaired,
    isMultiplayer,
    isBlocked,
  ]);
}

