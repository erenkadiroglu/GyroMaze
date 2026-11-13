import {
  calculateTimeAttackLimit,
  shouldRunGameTimer,
  isTimerExpired,
  shouldWarnTimerTick,
} from './hudUtils.ts';

export const GAME_TIMER_INTERVAL_MS = 100;
export const DEFAULT_FALLBACK_TIME_ATTACK_LIMIT = 45;

export interface GameTimerTickParams {
  isTimeAttack: boolean;
  elapsed: number;
  timeAttackLimit: number;
  lastWarnedSecond: number | null;
}

export interface GameTimerTickResult {
  isExpired: boolean;
  finalElapsed: number;
  shouldWarnTick: boolean;
  isUrgentTick: boolean;
  nextWarnedSecond: number | null;
}

/**
 * Başlangıç zaman damgasından bu yana geçen süreyi 0.1 saniye hassasiyetinde hesaplar.
 */
export function calculateElapsedSeconds(startTimeMs: number, nowMs: number): number {
  if (nowMs <= startTimeMs) return 0;
  return Number(((nowMs - startTimeMs) / 1000).toFixed(1));
}

/**
 * Mevcut geçmiş süreyi koruyarak performans sayacı için başlangıç referansını hesaplar.
 */
export function calculateTimerStartTime(baseElapsedSeconds: number, nowMs: number): number {
  const safeBase = Math.max(0, Number.isFinite(baseElapsedSeconds) ? baseElapsedSeconds : 0);
  return nowMs - safeBase * 1000;
}

/**
 * 100ms zamanlayıcı döngüsünün her adımını kurallara göre değerlendirir.
 */
export function evaluateGameTimerTick({
  isTimeAttack,
  elapsed,
  timeAttackLimit,
  lastWarnedSecond,
}: GameTimerTickParams): GameTimerTickResult {
  if (isTimerExpired(isTimeAttack, elapsed, timeAttackLimit)) {
    return {
      isExpired: true,
      finalElapsed: timeAttackLimit,
      shouldWarnTick: false,
      isUrgentTick: false,
      nextWarnedSecond: lastWarnedSecond,
    };
  }

  let shouldWarnTick = false;
  let isUrgentTick = false;
  let nextWarnedSecond = lastWarnedSecond;

  if (isTimeAttack) {
    const remainingCeil = Math.ceil(timeAttackLimit - elapsed);
    if (shouldWarnTimerTick(isTimeAttack, remainingCeil, lastWarnedSecond)) {
      shouldWarnTick = true;
      nextWarnedSecond = remainingCeil;
      isUrgentTick = remainingCeil <= 3;
    }
  }

  return {
    isExpired: false,
    finalElapsed: elapsed,
    shouldWarnTick,
    isUrgentTick,
    nextWarnedSecond,
  };
}

/**
 * Sıfırlama butonuna basıldığında sesli geri bildirim gerekip gerekmediğini belirler.
 */
export function resolveResetClickAction(isSoundMuted: boolean): { shouldPlayCalibrate: boolean } {
  return {
    shouldPlayCalibrate: !isSoundMuted,
  };
}

export {
  calculateTimeAttackLimit,
  shouldRunGameTimer,
  isTimerExpired,
  shouldWarnTimerTick,
};
