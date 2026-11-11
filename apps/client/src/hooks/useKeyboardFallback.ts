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

  useEffect(() => {
    const pressedKeys = new Set<string>();
    const TILT_DEGREES = 20;

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
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;

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

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isControllerPaired, isSecondControllerPaired, isMultiplayer]);
}

