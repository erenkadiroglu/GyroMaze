'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useGameStore } from '@/store/useGameStore';
import { soundEngine } from '@/utils/soundEngine';
import {
  calculateTimeAttackLimit,
  shouldRunGameTimer,
  isTimerExpired,
  shouldWarnTimerTick,
} from '@/utils/hudUtils';

export interface UseGameTimerOptions {
  starThresholds?: [number, number];
  isAnyOverlayOpen: boolean;
}

export interface UseGameTimerReturn {
  timeAttackLimit: number;
  isTimeAttack: boolean;
  isPageHidden: boolean;
  handleResetClick: () => void;
}

/**
 * Masaüstü HUD oyun saati, sekme gizleme/dondurma ve Süreye Karşı (Time Attack)
 * geri sayım, metronom uyarısı ve yenilgi yaşam döngüsü kancası.
 */
export function useGameTimer({
  starThresholds,
  isAnyOverlayOpen,
}: UseGameTimerOptions): UseGameTimerReturn {
  const gameStatus = useGameStore((s) => s.gameStatus);
  const setGameStatus = useGameStore((s) => s.setGameStatus);
  const gameMode = useGameStore((s) => s.gameMode);
  const level = useGameStore((s) => s.level);
  const resetCount = useGameStore((s) => s.resetCount);
  const setElapsedSeconds = useGameStore((s) => s.setElapsedSeconds);
  const isSoundMuted = useGameStore((s) => s.isSoundMuted);
  const triggerBallReset = useGameStore((s) => s.triggerBallReset);
  const triggerHaptic = useGameStore((s) => s.triggerHaptic);

  const [isPageHidden, setIsPageHidden] = useState(false);
  const lastWarnedSecondRef = useRef<number | null>(null);

  const timeAttackLimit = calculateTimeAttackLimit(starThresholds);
  const isTimeAttack = gameMode === 'time_attack';

  // Sekme gizlendiğinde oyun saatini dondurarak arka planda süre atlamasını önle
  useEffect(() => {
    const syncVisibility = () => {
      setIsPageHidden(document.hidden);
    };
    syncVisibility();
    document.addEventListener('visibilitychange', syncVisibility);
    return () => {
      document.removeEventListener('visibilitychange', syncVisibility);
    };
  }, []);

  // Bölüm veya durum değiştiğinde uyarı sayacını sıfırla
  useEffect(() => {
    lastWarnedSecondRef.current = null;
  }, [gameStatus, level, resetCount]);

  // 100ms aralıklı hassas oyun saati döngüsü
  useEffect(() => {
    if (!shouldRunGameTimer(gameStatus, isAnyOverlayOpen, isPageHidden)) return;

    const baseElapsed = useGameStore.getState().elapsedSeconds;
    const start = performance.now() - baseElapsed * 1000;
    const interval = window.setInterval(() => {
      const elapsed = Number(((performance.now() - start) / 1000).toFixed(1));

      if (isTimerExpired(isTimeAttack, elapsed, timeAttackLimit)) {
        setElapsedSeconds(timeAttackLimit);
        setGameStatus('lost');
        if (!isSoundMuted) {
          soundEngine.playDefeat();
        }
        triggerHaptic('hole');
        return;
      }

      setElapsedSeconds(elapsed);

      if (isTimeAttack) {
        const remainingCeil = Math.ceil(timeAttackLimit - elapsed);
        if (
          shouldWarnTimerTick(
            isTimeAttack,
            remainingCeil,
            lastWarnedSecondRef.current,
          )
        ) {
          lastWarnedSecondRef.current = remainingCeil;
          if (!isSoundMuted) {
            soundEngine.playTimerTick(remainingCeil <= 3);
          }
        }
      }
    }, 100);

    return () => window.clearInterval(interval);
  }, [
    gameStatus,
    level,
    resetCount,
    isAnyOverlayOpen,
    isPageHidden,
    isTimeAttack,
    timeAttackLimit,
    isSoundMuted,
    setElapsedSeconds,
    setGameStatus,
    triggerHaptic,
  ]);

  const handleResetClick = useCallback(() => {
    lastWarnedSecondRef.current = null;
    if (!isSoundMuted) soundEngine.playCalibrate();
    triggerBallReset();
  }, [isSoundMuted, triggerBallReset]);

  return {
    timeAttackLimit,
    isTimeAttack,
    isPageHidden,
    handleResetClick,
  };
}

