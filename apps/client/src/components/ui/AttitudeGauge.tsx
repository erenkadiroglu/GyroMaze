'use client';

import { useEffect, useRef } from 'react';
import { transientGyro, transientGyroP2 } from '@/store/useGameStore';
import {
  calculateRadarCoords,
  calculateAttitudeHorizonTransform,
  formatAttitudeTelemetry,
} from '@/utils/radarUtils';
import { AttitudeHorizonDial } from './AttitudeHorizonDial';
import { MiniMapRadar } from './MiniMapRadar';

interface AttitudeGaugeProps {
  /** Labirent tahtasının genişlik/uzunluk boyutu (varsayılan 12) */
  boardSize?: number;
  /** Hedef portalının koordinatı [x, y, z] */
  goalPosition: [number, number, number];
  /** Kalan kristallerin 2B tahta üzerindeki koordinatları */
  remainingCrystals: Array<[number, number]>;
  /** Portalın kilidinin açık olup olmadığı */
  isPortalUnlocked: boolean;
  /** Çok oyunculu modun aktif olup olmadığı */
  isMultiplayer: boolean;
  /** 2B mini-harita radarının gösterilip gösterilmeyeceği */
  showMiniMap: boolean;
}

/**
 * Dünya koordinatını mini-harita (radar) piksel ofsetlerine dönüştürür.
 */
function updateRadarDot(
  el: HTMLDivElement | null,
  worldX: number,
  worldZ: number,
  boardSize: number,
): void {
  if (!el) return;
  const { rx, rz } = calculateRadarCoords(worldX, worldZ, boardSize, 42, 4);
  el.style.transform = `translate3d(${(rx - 4).toFixed(1)}px, ${(rz - 4).toFixed(1)}px, 0)`;
}

/**
 * Havacılık yapay ufuk göstergesinden (attitude indicator) esinlenen,
 * 60 FPS doğrudan DOM transformlarıyla güncellenen kokpit telemetri kümesi.
 * React yeniden render'ı tetiklemeden bilye hızı, eğim açıları ve 2B radarı gösterir.
 */
export function AttitudeGauge({
  boardSize = 12,
  goalPosition,
  remainingCrystals,
  isPortalUnlocked,
  isMultiplayer,
  showMiniMap,
}: AttitudeGaugeProps) {
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

      if (horizonRef.current) {
        const { shiftY, rotDeg } = calculateAttitudeHorizonTransform(beta, gamma, 24, 18);
        const key = `${shiftY}_${rotDeg}`;
        if (key !== lastHorizonKey) {
          lastHorizonKey = key;
          horizonRef.current.style.transform = `translate3d(0, ${shiftY.toFixed(1)}px, 0) rotate(${rotDeg}deg)`;
        }
      }

      const currentBoardSize = boardSizeRef.current;
      updateRadarDot(
        miniMapBallRef.current,
        transientGyro.ballX,
        transientGyro.ballZ,
        currentBoardSize,
      );
      updateRadarDot(
        miniMapBall2Ref.current,
        transientGyroP2.ballX,
        transientGyroP2.ballZ,
        currentBoardSize,
      );

      if (now - lastTextTime >= 100) {
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

  return (
    <div
      className="gm-panel pointer-events-auto flex items-center gap-4 rounded-2xl px-3.5 py-2.5 shadow-lg"
      aria-label="Canlı uçuş ve hız göstergesi"
    >
      {/* Yapay Ufuk Kadranı */}
      <AttitudeHorizonDial ref={horizonRef} />

      {/* Sayısal Telemetri Sütunu */}
      <dl className="grid grid-cols-[auto_auto] items-baseline gap-x-3 gap-y-0.5 text-xs">
        <dt className="text-muted">Eğim</dt>
        <dd className="text-right">
          <span ref={pitchTextRef} className="gm-num text-sm text-signal">
            +0.0°
          </span>
        </dd>
        <dt className="text-muted">Yatış</dt>
        <dd className="text-right">
          <span ref={rollTextRef} className="gm-num text-sm text-signal">
            +0.0°
          </span>
        </dd>
        <dt className="text-muted">Hız</dt>
        <dd className="text-right">
          <span ref={speedTextRef} className="gm-num text-sm text-brass">
            0.0 m/s
          </span>
        </dd>
      </dl>

      {/* Kompakt 2B Canlı Radar */}
      {showMiniMap && (
        <MiniMapRadar
          ref={miniMapBallRef}
          ball2Ref={miniMapBall2Ref}
          boardSize={boardSize}
          goalPosition={goalPosition}
          remainingCrystals={remainingCrystals}
          isPortalUnlocked={isPortalUnlocked}
          isMultiplayer={isMultiplayer}
        />
      )}
    </div>
  );
}
