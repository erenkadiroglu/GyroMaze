'use client';

import { useMemo } from 'react';
import {
  resolveControllerFooterState,
  ResolvedControllerFooterState,
} from '@/utils/controllerFooterOrchestrationUtils';

export interface UseControllerFooterOptions {
  showGimbalSurface: boolean;
  isControllerPaired: boolean;
  isSocketConnected: boolean;
  onRecalibrate: () => void;
  onResetBall: () => void;
}

export interface UseControllerFooterResult {
  state: ResolvedControllerFooterState;
  containerProps: ResolvedControllerFooterState['containerProps'];
  isVisible: boolean;
  isResetDisabled: boolean;
  onRecalibrate: () => void;
  onResetBall: () => void;
  isControllerPaired: boolean;
  isSocketConnected: boolean;
}

/**
 * Mobil kontrolcü alt araç çubuğunun (merkez kalibrasyon ve bilye sıfırlama)
 * durum orkestrasyonunu sağlayan kanca.
 */
export function useControllerFooter({
  showGimbalSurface,
  isControllerPaired,
  isSocketConnected,
  onRecalibrate,
  onResetBall,
}: UseControllerFooterOptions): UseControllerFooterResult {
  const state = useMemo(
    () =>
      resolveControllerFooterState({
        showGimbalSurface,
        isControllerPaired,
        isSocketConnected,
      }),
    [showGimbalSurface, isControllerPaired, isSocketConnected],
  );

  return {
    state,
    containerProps: state.containerProps,
    isVisible: state.isVisible,
    isResetDisabled: state.isResetDisabled,
    onRecalibrate,
    onResetBall,
    isControllerPaired,
    isSocketConnected,
  };
}
