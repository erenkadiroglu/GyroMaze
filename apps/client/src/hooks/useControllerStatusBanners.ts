'use client';

import { useMemo, useCallback } from 'react';
import {
  resolveControllerBannersState,
  ResolvedControllerBannersState,
} from '@/utils/controllerBannersOrchestrationUtils';

export interface UseControllerStatusBannersOptions {
  errorMessage: string | null;
  onOpenRoomEditor: () => void;
  isControllerPaired: boolean;
  isRoomEditorOpen: boolean;
  level: number;
  remoteCrystalsCollected: number;
  remoteCrystalsTotal: number;
  gameStatus: string;
  onChangeLevel: (direction: 'next' | 'prev') => void;
  onResetBall: () => void;
}

export interface UseControllerStatusBannersResult {
  state: ResolvedControllerBannersState;
  handlePrevLevel: () => void;
  handleNextLevel: () => void;
  onResetBall: () => void;
  onOpenRoomEditor: () => void;
  errorMessage: string | null;
  level: number;
  remoteCrystalsCollected: number;
  remoteCrystalsTotal: number;
  onChangeLevel: (direction: 'next' | 'prev') => void;
}

/**
 * Mobil kontrolcü durum şeritlerinin (hata, gezinme, zafer, yenilgi)
 * görünürlük ve eylem yönetimini koordine eden kanca.
 */
export function useControllerStatusBanners({
  errorMessage,
  onOpenRoomEditor,
  isControllerPaired,
  isRoomEditorOpen,
  level,
  remoteCrystalsCollected,
  remoteCrystalsTotal,
  gameStatus,
  onChangeLevel,
  onResetBall,
}: UseControllerStatusBannersOptions): UseControllerStatusBannersResult {
  const state = useMemo(
    () =>
      resolveControllerBannersState({
        errorMessage,
        isControllerPaired,
        isRoomEditorOpen,
        level,
        remoteCrystalsCollected,
        remoteCrystalsTotal,
        gameStatus,
      }),
    [
      errorMessage,
      isControllerPaired,
      isRoomEditorOpen,
      level,
      remoteCrystalsCollected,
      remoteCrystalsTotal,
      gameStatus,
    ],
  );

  const handlePrevLevel = useCallback(() => {
    onChangeLevel('prev');
  }, [onChangeLevel]);

  const handleNextLevel = useCallback(() => {
    onChangeLevel('next');
  }, [onChangeLevel]);

  return {
    state,
    handlePrevLevel,
    handleNextLevel,
    onResetBall,
    onOpenRoomEditor,
    errorMessage,
    level,
    remoteCrystalsCollected,
    remoteCrystalsTotal,
    onChangeLevel,
  };
}
