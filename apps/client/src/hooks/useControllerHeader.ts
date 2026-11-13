'use client';

import { useMemo } from 'react';
import {
  resolveControllerHeaderState,
  ResolvedControllerHeaderState,
} from '@/utils/controllerHeaderOrchestrationUtils';

export interface UseControllerHeaderOptions {
  activeRoomCode: string;
  playerSlot: 1 | 2;
  isHapticEnabled: boolean;
  onToggleHaptic: () => void;
  colorScheme: 'dark' | 'light';
  onToggleColorScheme: () => void;
  isRoomEditorOpen: boolean;
  onOpenRoomEditor: () => void;
  onCloseRoomEditor: () => void;
  isControllerPaired: boolean;
  isSocketConnected: boolean;
  latencyMs: number;
}

export interface UseControllerHeaderResult {
  state: ResolvedControllerHeaderState;
  containerProps: ResolvedControllerHeaderState['containerProps'];
  activeRoomCode: string;
  playerSlot: 1 | 2;
  isHapticEnabled: boolean;
  onToggleHaptic: () => void;
  colorScheme: 'dark' | 'light';
  onToggleColorScheme: () => void;
  isRoomEditorOpen: boolean;
  onOpenRoomEditor: () => void;
  onCloseRoomEditor: () => void;
  isControllerPaired: boolean;
  isSocketConnected: boolean;
  latencyMs: number;
}

/**
 * Mobil kontrolcü üst başlık çubuğunun (marka, oda kodu, P1/P2 rozeti, hızlı eylemler,
 * tema, titreşim ve bağlantı telemetrisi) durum orkestrasyonunu sağlayan kanca.
 */
export function useControllerHeader(
  options: UseControllerHeaderOptions,
): UseControllerHeaderResult {
  const {
    activeRoomCode,
    playerSlot,
    isHapticEnabled,
    onToggleHaptic,
    colorScheme,
    onToggleColorScheme,
    isRoomEditorOpen,
    onOpenRoomEditor,
    onCloseRoomEditor,
    isControllerPaired,
    isSocketConnected,
    latencyMs,
  } = options;

  const state = useMemo(
    () =>
      resolveControllerHeaderState({
        activeRoomCode,
        playerSlot,
        isHapticEnabled,
        colorScheme,
        isRoomEditorOpen,
        isControllerPaired,
        isSocketConnected,
        latencyMs,
      }),
    [
      activeRoomCode,
      playerSlot,
      isHapticEnabled,
      colorScheme,
      isRoomEditorOpen,
      isControllerPaired,
      isSocketConnected,
      latencyMs,
    ],
  );

  return {
    state,
    containerProps: state.containerProps,
    activeRoomCode,
    playerSlot,
    isHapticEnabled,
    onToggleHaptic,
    colorScheme,
    onToggleColorScheme,
    isRoomEditorOpen,
    onOpenRoomEditor,
    onCloseRoomEditor,
    isControllerPaired,
    isSocketConnected,
    latencyMs,
  };
}
