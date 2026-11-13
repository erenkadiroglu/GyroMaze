'use client';

import { useEffect, useRef } from 'react';
import { transientGyro, transientGyroP2 } from '@/store/useGameStore';
import {
  calculateAttitudeHorizonTransform,
  resolveAttitudeTransformStyle,
  calculateRadarDotTransform,
  shouldThrottleTelemetryText,
  formatAttitudeTelemetry,
} from '@/utils/radarUtils';

/**
 * Havacılık yapay ufuk göstergesi ve 2B radar için 60 FPS doğrudan DOM
 * güncelleme (RAF) döngüsü kancası. Sıfır React re-render ile telemetriyi akıtır.
 */
export function useAttitudeTelemetryLoop(boardSize: number) {
  const boardSizeRef = useRef<number>(boardSize);
  boardSizeRef.current = boardSize;

  const horizonRef = useRef<HTMLDivElement | null>(null);
  const pitchTextRef = useRef<HTMLSpanElement | null>(null);
  const rollTextRef = useRef<HTMLSpanElement | null>(null);
  const speedTextRef = useRef<HTMLSpanElement | null>(null);
  const miniMapBallRef = useRef<HTMLDivElement | null>(null);
  const miniMapBall2Ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let animationFrameId = 0;
    let lastHorizonKey = '';
    let lastTextTime = 0;

    const tick = (now: number) => {
      const beta = transientGyro.beta;
      const gamma = transientGyro.gamma;

      // 1. Yapay Ufuk Diski (60 FPS doğrudan DOM transform)
      if (horizonRef.current) {
        const { shiftY, rotDeg } = calculateAttitudeHorizonTransform(
          beta,
          gamma,
          24,
          18,
        );
        const key = `${shiftY}_${rotDeg}`;
        if (key !== lastHorizonKey) {
          lastHorizonKey = key;
          horizonRef.current.style.transform = resolveAttitudeTransformStyle(
            shiftY,
            rotDeg,
          );
        }
      }

      // 2. 2B Canlı Mini-Harita Bilye Noktaları
      const currentBoardSize = boardSizeRef.current;
      if (miniMapBallRef.current) {
        miniMapBallRef.current.style.transform = calculateRadarDotTransform(
          transientGyro.ballX,
          transientGyro.ballZ,
          currentBoardSize,
          42,
          4,
        );
      }
      if (miniMapBall2Ref.current) {
        miniMapBall2Ref.current.style.transform = calculateRadarDotTransform(
          transientGyroP2.ballX,
          transientGyroP2.ballZ,
          currentBoardSize,
          42,
          4,
        );
      }

      // 3. Sayısal Açı ve Hız Telemetrisi (100ms / 10 Hz throttle)
      if (shouldThrottleTelemetryText(now, lastTextTime, 100)) {
        lastTextTime = now;
        const { pitchStr, rollStr, speedStr } = formatAttitudeTelemetry(
          beta,
          gamma,
          transientGyro.ballSpeed,
        );
        if (pitchTextRef.current) pitchTextRef.current.textContent = pitchStr;
        if (rollTextRef.current) rollTextRef.current.textContent = rollStr;
        if (speedTextRef.current) speedTextRef.current.textContent = speedStr;
      }

      animationFrameId = window.requestAnimationFrame(tick);
    };

    animationFrameId = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(animationFrameId);
  }, []);

  return {
    horizonRef,
    pitchTextRef,
    rollTextRef,
    speedTextRef,
    miniMapBallRef,
    miniMapBall2Ref,
  };
}
