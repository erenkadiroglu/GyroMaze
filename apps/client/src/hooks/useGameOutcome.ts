'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useGameStore } from '@/store/useGameStore';
import { soundEngine } from '@/utils/soundEngine';
import {
  loadStoredPlayerName,
  saveStoredPlayerName,
  prepareLeaderboardScorePayload,
  resolveGameOutcomeMetrics,
} from '@/utils/gameOutcomeOrchestrationUtils';

/**
 * Oyun sonucu modalları (zafer ve süre doldu) için durum, rekor,
 * liderlik tablosu gönderimi ve yaşam döngüsü kancası.
 */
export function useGameOutcome() {
  const gameStatus = useGameStore((s) => s.gameStatus);
  const level = useGameStore((s) => s.level);
  const customLevel = useGameStore((s) => s.customLevel);
  const elapsedSeconds = useGameStore((s) => s.elapsedSeconds);
  const bestTimes = useGameStore((s) => s.bestTimes);
  const collectedCrystals = useGameStore((s) => s.collectedCrystals);
  const isMultiplayer = useGameStore((s) => s.isMultiplayer);
  const winnerPlayer = useGameStore((s) => s.winnerPlayer);
  const isSoundMuted = useGameStore((s) => s.isSoundMuted);
  const triggerBallReset = useGameStore((s) => s.triggerBallReset);
  const nextLevel = useGameStore((s) => s.nextLevel);
  const setSettingsOpen = useGameStore((s) => s.setSettingsOpen);
  const submitLeaderboardScore = useGameStore((s) => s.submitLeaderboardScore);

  const [playerName, setPlayerName] = useState('Oyuncu');
  const [scoreSubmitted, setScoreSubmitted] = useState(false);

  const metrics = useMemo(
    () =>
      resolveGameOutcomeMetrics({
        level,
        customLevel,
        elapsedSeconds,
        bestTimes,
        collectedCrystalsCount: collectedCrystals.length,
        gameStatus,
        winnerPlayer,
      }),
    [
      level,
      customLevel,
      elapsedSeconds,
      bestTimes,
      collectedCrystals.length,
      gameStatus,
      winnerPlayer,
    ],
  );

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setPlayerName(loadStoredPlayerName(window.localStorage));
    }
  }, []);

  useEffect(() => {
    setScoreSubmitted(false);
  }, [level, gameStatus]);

  const handleReset = useCallback(() => {
    if (!isSoundMuted) soundEngine.playCalibrate();
    triggerBallReset();
  }, [isSoundMuted, triggerBallReset]);

  const handleSwitchMode = useCallback(() => {
    handleReset();
    setSettingsOpen(true);
  }, [handleReset, setSettingsOpen]);

  const handleScoreSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (scoreSubmitted) return;
      const payload = prepareLeaderboardScorePayload(
        playerName,
        metrics.currentLevelInfo.id,
        elapsedSeconds,
      );
      setPlayerName(payload.playerName);
      if (typeof window !== 'undefined') {
        saveStoredPlayerName(window.localStorage, payload.playerName);
      }
      submitLeaderboardScore(payload);
      setScoreSubmitted(true);
    },
    [
      scoreSubmitted,
      playerName,
      submitLeaderboardScore,
      metrics.currentLevelInfo.id,
      elapsedSeconds,
    ],
  );

  return {
    gameStatus,
    level,
    currentLevelInfo: metrics.currentLevelInfo,
    elapsedSeconds,
    timeAttackLimit: metrics.timeAttackLimit,
    totalCrystals: metrics.totalCrystals,
    isPB: metrics.isPB,
    earnedStars: metrics.earnedStars,
    goalMessage: metrics.goalMessage,
    isCelebration: metrics.isCelebration,
    playerName,
    setPlayerName,
    scoreSubmitted,
    isMultiplayer,
    winnerPlayer,
    winnerText: metrics.winnerText,
    crystalSummary: metrics.crystalSummary,
    handleReset,
    handleSwitchMode,
    handleScoreSubmit,
    nextLevel,
  };
}

