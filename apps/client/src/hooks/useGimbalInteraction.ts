'use client';

import { useRef, useEffect, useCallback } from 'react';
import type { GyroData } from '@gyromaze/shared';
import {
  calculateGimbalTouchAngles,
  calculateGimbalDotOffset,
  formatGimbalAngle,
  calculateGimbalBounds,
  shouldUpdateGimbalDotOffset,
  shouldUpdateAngleText,
  isPointerEventMatching,
  shouldResetPointerDrag,
} from '@/utils/controllerUtils';

export interface UseGimbalInteractionOptions {
  showGimbalSurface: boolean;
  liveGyroRef: React.MutableRefObject<GyroData>;
  pushGyroSample: (beta: number, gamma: number) => void;
}

/**
 * Mobil kontrolcü sanal gimbal dokunmatik etkileşim ve 60 FPS GPU animasyon kancası.
 * Dokunmatik sürüklemeyi, işaretçi yakalamayı, ufuk küresi piksel ofsetini ve 8Hz açı göstergelerini yönetir.
 */
export function useGimbalInteraction({
  showGimbalSurface,
  liveGyroRef,
  pushGyroSample,
}: UseGimbalInteractionOptions) {
  const gimbalPadRef = useRef<HTMLDivElement | null>(null);
  const gimbalDotRef = useRef<HTMLDivElement | null>(null);
  const pitchValueRef = useRef<HTMLSpanElement | null>(null);
  const rollValueRef = useRef<HTMLSpanElement | null>(null);

  const isPointerDraggingRef = useRef<boolean>(false);
  const activePointerIdRef = useRef<number | null>(null);
  const gimbalBoundsRef = useRef<{
    centerX: number;
    centerY: number;
    maxRadius: number;
  }>({
    centerX: 0,
    centerY: 0,
    maxRadius: 100,
  });

  const wasGimbalVisibleRef = useRef(false);

  // Gimbal yüzeyi kapandığında, sekme gizlendiğinde veya pencere odağı kaybedildiğinde takılı sürüklemeyi ve eğimi sıfırla
  useEffect(() => {
    const resetActiveDrag = () => {
      if (
        shouldResetPointerDrag(
          isPointerDraggingRef.current,
          activePointerIdRef.current,
        )
      ) {
        isPointerDraggingRef.current = false;
        activePointerIdRef.current = null;
        pushGyroSample(0, 0);
      }
    };

    if (!showGimbalSurface) {
      if (wasGimbalVisibleRef.current) {
        wasGimbalVisibleRef.current = false;
        resetActiveDrag();
      }
      return;
    }

    wasGimbalVisibleRef.current = true;
    const onVisibilityChange = () => {
      if (document.hidden) {
        resetActiveDrag();
      }
    };
    window.addEventListener('blur', resetActiveDrag);
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => {
      window.removeEventListener('blur', resetActiveDrag);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [showGimbalSurface, pushGyroSample]);

  // 60 FPS GPU-hızlandırmalı mobil ufuk küresi ve 8Hz sayısal açı güncellemesi
  useEffect(() => {
    if (!showGimbalSurface) return;

    let rafId = 0;
    let lastRenderedX = 999;
    let lastRenderedY = 999;
    let lastTextUpdateTime = 0;
    let lastPitchStr = '';
    let lastRollStr = '';

    const updateMobileUI = (now: number) => {
      const beta = liveGyroRef.current.beta;
      const gamma = liveGyroRef.current.gamma;

      if (gimbalDotRef.current) {
        const { offsetX, offsetY } = calculateGimbalDotOffset(beta, gamma, 68, 35);

        if (
          shouldUpdateGimbalDotOffset(
            offsetX,
            offsetY,
            lastRenderedX,
            lastRenderedY,
            0.2,
          )
        ) {
          lastRenderedX = offsetX;
          lastRenderedY = offsetY;
          gimbalDotRef.current.style.transform = `translate3d(${offsetX.toFixed(1)}px, ${offsetY.toFixed(1)}px, 0)`;
        }
      }

      if (shouldUpdateAngleText(now, lastTextUpdateTime, 120)) {
        lastTextUpdateTime = now;
        const nextPitchStr = formatGimbalAngle(beta);
        const nextRollStr = formatGimbalAngle(gamma);

        if (pitchValueRef.current && nextPitchStr !== lastPitchStr) {
          lastPitchStr = nextPitchStr;
          pitchValueRef.current.textContent = nextPitchStr;
        }
        if (rollValueRef.current && nextRollStr !== lastRollStr) {
          lastRollStr = nextRollStr;
          rollValueRef.current.textContent = nextRollStr;
        }
      }

      rafId = window.requestAnimationFrame(updateMobileUI);
    };

    rafId = window.requestAnimationFrame(updateMobileUI);
    return () => window.cancelAnimationFrame(rafId);
  }, [showGimbalSurface, liveGyroRef]);

  const updatePointerSample = useCallback(
    (clientX: number, clientY: number) => {
      const { beta, gamma } = calculateGimbalTouchAngles(
        clientX,
        clientY,
        gimbalBoundsRef.current,
        28,
      );
      pushGyroSample(beta, gamma);
    },
    [pushGyroSample],
  );

  const handlePointerDownOnGimbal = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!gimbalPadRef.current || activePointerIdRef.current !== null) return;
      activePointerIdRef.current = e.pointerId;
      isPointerDraggingRef.current = true;
      const rect = gimbalPadRef.current.getBoundingClientRect();
      gimbalBoundsRef.current = calculateGimbalBounds(rect, 24, 40);

      e.currentTarget.setPointerCapture(e.pointerId);
      updatePointerSample(e.clientX, e.clientY);
    },
    [updatePointerSample],
  );

  const handlePointerMoveOnGimbal = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (
        !isPointerDraggingRef.current ||
        !isPointerEventMatching(activePointerIdRef.current, e.pointerId)
      ) {
        return;
      }
      updatePointerSample(e.clientX, e.clientY);
    },
    [updatePointerSample],
  );

  const handlePointerEndOnGimbal = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (
        !isPointerDraggingRef.current ||
        !isPointerEventMatching(activePointerIdRef.current, e.pointerId)
      ) {
        return;
      }
      isPointerDraggingRef.current = false;
      activePointerIdRef.current = null;
      pushGyroSample(0, 0);
    },
    [pushGyroSample],
  );

  return {
    gimbalPadRef,
    gimbalDotRef,
    pitchValueRef,
    rollValueRef,
    isPointerDraggingRef,
    handlePointerDownOnGimbal,
    handlePointerMoveOnGimbal,
    handlePointerEndOnGimbal,
  };
}

