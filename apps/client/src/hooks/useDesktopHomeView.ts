'use client';

import { useMemo } from 'react';
import { useAppPreferences } from '@/hooks/useAppPreferences';
import { useSocket } from '@/hooks/useSocket';
import { useKeyboardFallback } from '@/hooks/useKeyboardFallback';
import { useGameStore } from '@/store/useGameStore';
import {
  resolveDesktopHomeViewState,
  ResolvedDesktopHomeViewState,
} from '@/utils/desktopHomeOrchestrationUtils';

export interface UseDesktopHomeViewResult {
  state: ResolvedDesktopHomeViewState;
  containerProps: ResolvedDesktopHomeViewState['containerProps'];
}

/**
 * Masaüstü ana sayfa görünümünün (DesktopHomeView) yaşam döngüsü kancalarını,
 * Socket.IO ev sahibi bağlantısını, kalıcı tercihlerini ve sahne kapsayıcı özniteliklerini
 * tek merkezden koordine eden orkestratör kanca.
 */
export function useDesktopHomeView(): UseDesktopHomeViewResult {
  // Kalıcı kullanıcı tercihlerini localStorage'dan yükle
  useAppPreferences();

  const level = useGameStore((s) => s.level);
  const customLevel = useGameStore((s) => s.customLevel);
  const gameMode = useGameStore((s) => s.gameMode);
  const isMultiplayer = useGameStore((s) => s.isMultiplayer);
  const roomId = useGameStore((s) => s.roomId);

  const state = useMemo(
    () =>
      resolveDesktopHomeViewState({
        level,
        customLevel,
        gameMode,
        isMultiplayer,
        roomCode: roomId,
      }),
    [level, customLevel, gameMode, isMultiplayer, roomId],
  );

  // Ev sahibi Socket.io bağlantısını başlat ve yönet
  useSocket(state.socketConfig);

  // Masaüstü klavye yönlendirme desteğini dinle
  useKeyboardFallback();

  return {
    state,
    containerProps: state.containerProps,
  };
}
