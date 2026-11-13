'use client';

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useGameStore } from '@/store/useGameStore';
import {
  resolveLevelSelectState,
  shouldClosePopoverOnKeyDown,
  shouldClosePopoverOnMouseDown,
} from '@/utils/desktopHeaderOrchestrationUtils';
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

  const state = useMemo(
    () =>
      resolveLevelSelectState({
        level,
        customLevel,
        bestTimes,
      }),
    [level, customLevel, bestTimes],
  );

  // Menü dışına tıklanınca veya Esc basılınca kapat
  useEffect(() => {
    if (!isOpen) return;
    const onMouseDown = (e: MouseEvent) => {
      if (shouldClosePopoverOnMouseDown(popoverRef.current, e.target)) {
        setIsOpen(false);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (shouldClosePopoverOnKeyDown(e.key)) {
        setIsOpen(false);
      }
    };
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [isOpen]);

  const handleJumpProceduralLevel = useCallback(() => {
    setLevel(state.nextProceduralLevel);
    setIsOpen(false);
    if (!isSoundMuted) soundEngine.playCalibrate();
    showHudNotification(state.proceduralNotificationText, 'info');
  }, [setLevel, isSoundMuted, showHudNotification, state]);

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
    currentLevelInfo: state.currentLevelInfo,
    activeNumericLevel: state.activeNumericLevel,
    shortLevelTag: state.shortLevelTag,
    cleanTitle: state.cleanTitle,
    currentProgress: state.currentProgress,
    campaignProgress: state.campaignProgress,
    bestTimes,
    handleJumpProceduralLevel,
    handleSelectLevel,
    handlePrevLevel,
    handleNextLevel,
  };
}
