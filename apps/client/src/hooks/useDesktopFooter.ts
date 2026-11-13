'use client';

import { useMemo } from 'react';
import { useGameStore } from '@/store/useGameStore';
import { resolveDesktopFooterState } from '@/utils/desktopFooterOrchestrationUtils';

/**
 * Masaüstü HUD alt paneli (DesktopFooterControls) için durum ve görünürlük kancası.
 */
export function useDesktopFooter() {
  const isControllerPaired = useGameStore((s) => s.isControllerPaired);
  const isSecondControllerPaired = useGameStore(
    (s) => s.isSecondControllerPaired,
  );
  const isMultiplayer = useGameStore((s) => s.isMultiplayer);
  const showMiniMap = useGameStore((s) => s.showMiniMap);

  const state = useMemo(
    () =>
      resolveDesktopFooterState({
        isControllerPaired,
        isSecondControllerPaired,
        isMultiplayer,
        showMiniMap,
      }),
    [
      isControllerPaired,
      isSecondControllerPaired,
      isMultiplayer,
      showMiniMap,
    ],
  );

  return state;
}
