'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useGameStore } from '@/store/useGameStore';
import { getMazeLevel } from '@/components/scene/mazeLevels';
import {
  calculateCampaignProgress,
  getLevelProgress,
  formatShortLevelTag,
  cleanLevelTitle,
  calculateNextProceduralLevel,
  STANDARD_LEVEL_THRESHOLDS,
} from '@/utils/levelProgressUtils';
import { soundEngine } from '@/utils/soundEngine';

/**
 * Masaüstü HUD bölüm seçici (LevelSelectPopover) açılır menü yaşam döngüsü,
 * dışarı tıklama/Esc denetleyicisi, kampanya ilerlemesi ve bölüm geçiş kancası.
 */
export function useLevelSelect() {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement | null>(null);

  const level = useGameStore((s) => s.level);
  const setLevel = useGameStore((s) => s.setLevel);
  const prevLevel = useGameStore((s) => s.prevLevel);
  const nextLevel = useGameStore((s) => s.nextLevel);
  const bestTimes = useGameStore((s) => s.bestTimes);
  const customLevel = useGameStore((s) => s.customLevel);
  const showHudNotification = useGameStore((s) => s.showHudNotification);
  const isSoundMuted = useGameStore((s) => s.isSoundMuted);

  const currentLevelInfo = getMazeLevel(level, customLevel);
  const activeNumericLevel = level === 99 ? 1 : Math.max(1, level);

  const shortLevelTag = formatShortLevelTag(level, currentLevelInfo.id);
  const cleanTitle = cleanLevelTitle(currentLevelInfo.title);

  const currentProgress = getLevelProgress(
    currentLevelInfo.id,
    bestTimes,
    currentLevelInfo.starThresholds,
  );

  const campaignProgress = calculateCampaignProgress(
    bestTimes,
    STANDARD_LEVEL_THRESHOLDS,
    5,
  );

  // Menü dışına tıklanınca veya Esc basılınca kapat
  useEffect(() => {
    if (!isOpen) return;
    const onMouseDown = (e: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [isOpen]);

  const handleJumpProceduralLevel = useCallback(() => {
    const nextProc = calculateNextProceduralLevel(level);
    setLevel(nextProc);
    setIsOpen(false);
    if (!isSoundMuted) soundEngine.playCalibrate();
    showHudNotification(
      `Prosedürel Bölüm ${nextProc < 10 ? `0${nextProc}` : nextProc} oluşturuldu`,
      'info',
    );
  }, [level, setLevel, isSoundMuted, showHudNotification]);

  const handleSelectLevel = useCallback(
    (targetLevel: number) => {
      setLevel(targetLevel);
      setIsOpen(false);
      if (!isSoundMuted) soundEngine.playUIClick();
    },
    [setLevel, isSoundMuted],
  );

  const handlePrevLevel = useCallback(() => {
    prevLevel();
    if (!isSoundMuted) soundEngine.playUIClick();
  }, [prevLevel, isSoundMuted]);

  const handleNextLevel = useCallback(() => {
    nextLevel();
    if (!isSoundMuted) soundEngine.playUIClick();
  }, [nextLevel, isSoundMuted]);

  const toggleOpen = useCallback(() => {
    setIsOpen((v) => !v);
    if (!isSoundMuted) soundEngine.playUIClick();
  }, [isSoundMuted]);

  return {
    isOpen,
    setIsOpen,
    toggleOpen,
    popoverRef,
    level,
    customLevel,
    currentLevelInfo,
    activeNumericLevel,
    shortLevelTag,
    cleanTitle,
    currentProgress,
    campaignProgress,
    bestTimes,
    handleJumpProceduralLevel,
    handleSelectLevel,
    handlePrevLevel,
    handleNextLevel,
  };
}

