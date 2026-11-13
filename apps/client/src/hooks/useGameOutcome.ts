'use client';

import { useState, useEffect, useCallback } from 'react';
import { useGameStore } from '@/store/useGameStore';
import { getMazeLevel } from '@/components/scene/mazeLevels';
import { soundEngine } from '@/utils/soundEngine';
import {
  calculateEarnedStars,
  formatStarGoalMessage,
  isPersonalBest,
  calculateTimeAttackLimit,
  cleanPlayerName,
  resolveMultiplayerWinnerText,
  formatDefeatCrystalSummary,
} from '@/utils/gameOutcomeUtils';
import { isCelebrationWorthy } from '@/utils/celebrationParticles';

const PLAYER_NAME_STORAGE_KEY = 'gyromaze_player_name_v1';

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

  const currentLevelInfo = getMazeLevel(level, customLevel);
  const [, twoStarLimit] = currentLevelInfo.starThresholds ?? [15, 24];
  const timeAttackLimit = calculateTimeAttackLimit(twoStarLimit);
  const totalCrystals = currentLevelInfo.crystals.length;

  const currentBest = bestTimes[currentLevelInfo.id];
  const isPB = isPersonalBest(elapsedSeconds, currentBest);
  const earnedStars = calculateEarnedStars(
    elapsedSeconds,
    currentLevelInfo.starThresholds,
  );
  const goalMessage = formatStarGoalMessage(
    elapsedSeconds,
    currentLevelInfo.starThresholds,
  );

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = window.localStorage.getItem(PLAYER_NAME_STORAGE_KEY);
        if (saved && saved.trim()) {
          setPlayerName(cleanPlayerName(saved));
        }
      } catch {
        // LocalStorage erişimi engellenmişse yoksay
      }
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
      const cleanName = cleanPlayerName(playerName);
      setPlayerName(cleanName);
      if (typeof window !== 'undefined') {
        try {
          window.localStorage.setItem(PLAYER_NAME_STORAGE_KEY, cleanName);
        } catch {
          // LocalStorage yazma hatasını yoksay
        }
      }
      submitLeaderboardScore({
        playerName: cleanName,
        levelId: currentLevelInfo.id,
        timeSeconds: Number(Math.max(0.1, elapsedSeconds).toFixed(1)),
      });
      setScoreSubmitted(true);
    },
    [scoreSubmitted, playerName, submitLeaderboardScore, currentLevelInfo.id, elapsedSeconds],
  );

  const isCelebration =
    gameStatus === 'won' && isCelebrationWorthy(earnedStars, isPB);

  const winnerText = resolveMultiplayerWinnerText(winnerPlayer);
  const crystalSummary = formatDefeatCrystalSummary(
    collectedCrystals.length,
    totalCrystals,
  );

  return {
    gameStatus,
    level,
    currentLevelInfo,
    elapsedSeconds,
    timeAttackLimit,
    totalCrystals,
    isPB,
    earnedStars,
    goalMessage,
    isCelebration,
    playerName,
    setPlayerName,
    scoreSubmitted,
    isMultiplayer,
    winnerPlayer,
    winnerText,
    crystalSummary,
    handleReset,
    handleSwitchMode,
    handleScoreSubmit,
    nextLevel,
  };
}

