'use client';

import { useEffect, useRef } from 'react';
import { transientGyro, transientGyroP2 } from '@/store/useGameStore';

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
  const halfBoard = boardSize / 2;
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
        const clampedBeta = Math.max(-24, Math.min(24, beta));
        const clampedGamma = Math.max(-24, Math.min(24, gamma));
        const shiftY = (clampedBeta / 24) * 18;
        const rotDeg = (-clampedGamma * 1.1).toFixed(1);
        const key = `${shiftY.toFixed(1)}_${rotDeg}`;
        if (key !== lastHorizonKey) {
          lastHorizonKey = key;
          horizonRef.current.style.transform = `translate3d(0, ${shiftY.toFixed(1)}px, 0) rotate(${rotDeg}deg)`;
        }
      }

      const currentBoardSize = boardSizeRef.current;
      const currentHalfBoard = currentBoardSize / 2;

      if (miniMapBallRef.current) {
        // Aktif tahta boyutuna göre 44x44px radar içi koordinata dönüştür
        const rx = Math.max(
          3,
          Math.min(
            41,
            ((transientGyro.ballX + currentHalfBoard) / currentBoardSize) * 44,
          ),
        );
        const rz = Math.max(
          3,
          Math.min(
            41,
            ((transientGyro.ballZ + currentHalfBoard) / currentBoardSize) * 44,
          ),
        );
        miniMapBallRef.current.style.transform = `translate3d(${(rx - 4).toFixed(1)}px, ${(rz - 4).toFixed(1)}px, 0)`;
      }

      if (miniMapBall2Ref.current) {
        const rx2 = Math.max(
          3,
          Math.min(
            41,
            ((transientGyroP2.ballX + currentHalfBoard) / currentBoardSize) *
              44,
          ),
        );
        const rz2 = Math.max(
          3,
          Math.min(
            41,
            ((transientGyroP2.ballZ + currentHalfBoard) / currentBoardSize) *
              44,
          ),
        );
        miniMapBall2Ref.current.style.transform = `translate3d(${(rx2 - 4).toFixed(1)}px, ${(rz2 - 4).toFixed(1)}px, 0)`;
      }

      if (now - lastTextTime >= 100) {
        lastTextTime = now;
        if (pitchTextRef.current) {
          pitchTextRef.current.textContent = `${beta >= 0 ? '+' : ''}${beta.toFixed(1)}°`;
        }
        if (rollTextRef.current) {
          rollTextRef.current.textContent = `${gamma >= 0 ? '+' : ''}${gamma.toFixed(1)}°`;
        }
        if (speedTextRef.current) {
          speedTextRef.current.textContent = `${transientGyro.ballSpeed.toFixed(1)} m/s`;
        }
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
      <div
        className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full border border-line bg-surface-2 shadow-inner"
        title="Yapay Ufuk — Tabla eğim açısı"
      >
        {/* Hareketli gökyüzü / zemin ufuk diski */}
        <div
          ref={horizonRef}
          className="pointer-events-none absolute -inset-6 flex flex-col will-change-transform"
        >
          <div className="flex-1 bg-signal/14" />
          <div className="h-[1.5px] w-full bg-signal shadow-[0_0_8px_var(--gm-signal)]" />
          <div className="flex-1 bg-base/55" />
        </div>

        {/* Sabit kadran kertikleri */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-1.5 rounded-full border border-dashed border-line/70"
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute top-0.5 h-1.5 w-[1.5px] bg-brass"
        />

        {/* Merkez nişangah */}
        <div
          aria-hidden="true"
          className="pointer-events-none relative z-10 flex items-center gap-1"
        >
          <span className="h-[1.5px] w-2 bg-brass" />
          <span className="h-2 w-2 rounded-full border border-brass bg-surface" />
          <span className="h-[1.5px] w-2 bg-brass" />
        </div>
      </div>

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
        <>
          <div className="h-11 w-px bg-line" aria-hidden="true" />
          <div
            className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl border border-line bg-base/80"
            title="Canlı 2B Labirent Radarı"
          >
            {/* Hedef Portalı */}
            <div
              style={{
                left: `${((goalPosition[0] + halfBoard) / boardSize) * 100}%`,
                top: `${((goalPosition[2] + halfBoard) / boardSize) * 100}%`,
              }}
              className={`absolute h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full ${
                isPortalUnlocked
                  ? 'bg-ok shadow-[0_0_6px_var(--gm-ok)]'
                  : 'bg-brass'
              }`}
            />
            {/* Kalan Kristaller */}
            {remainingCrystals.map(([cx, cz], idx) => (
              <div
                key={`radar-c-${idx}`}
                style={{
                  left: `${((cx + halfBoard) / boardSize) * 100}%`,
                  top: `${((cz + halfBoard) / boardSize) * 100}%`,
                }}
                className="absolute h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-signal"
              />
            ))}
            {/* 1. Oyuncu */}
            <div
              ref={miniMapBallRef}
              className="absolute top-0 left-0 h-2 w-2 rounded-full bg-fg shadow-sm will-change-transform"
            />
            {/* 2. Oyuncu (Altın Bilye) */}
            {isMultiplayer && (
              <div
                ref={miniMapBall2Ref}
                className="absolute top-0 left-0 h-2 w-2 rounded-full bg-warn shadow-sm will-change-transform"
              />
            )}
          </div>
        </>
      )}
    </div>
  );
}
