'use client';

import { useEffect } from 'react';
import { useGameStore, transientGyro } from '@/store/useGameStore';

/**
 * Mobil cihaz bağlı olmadığında masaüstünde WASD veya Yön Tuşları ile
 * 3B labirenti test edebilmeyi sağlayan yardımcı hook.
 */
export function useKeyboardFallback(): void {
  const isControllerPaired = useGameStore((s) => s.isControllerPaired);

  useEffect(() => {
    if (isControllerPaired) {
      return;
    }

    const pressedKeys = new Set<string>();
    const TILT_DEGREES = 20;

    const updateFromKeys = () => {
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
    };

    const handleKeyDown = (e: KeyboardEvent) => {
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
  }, [isControllerPaired]);
}

