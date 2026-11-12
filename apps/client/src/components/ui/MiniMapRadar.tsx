'use client';

import { forwardRef } from 'react';
import { calculateRadarPercentage } from '@/utils/radarUtils';

interface MiniMapRadarProps {
  boardSize: number;
  goalPosition: [number, number, number];
  remainingCrystals: Array<[number, number]>;
  isPortalUnlocked: boolean;
  isMultiplayer: boolean;
  ball2Ref?: React.Ref<HTMLDivElement>;
}

/**
 * 2B Labirent mini-harita radarı bileşeni.
 * Bilyelerin konumu 60 FPS doğrudan DOM `translate3d` ile güncellenir.
 */
export const MiniMapRadar = forwardRef<HTMLDivElement, MiniMapRadarProps>(
  function MiniMapRadar(
    {
      boardSize,
      goalPosition,
      remainingCrystals,
      isPortalUnlocked,
      isMultiplayer,
      ball2Ref,
    },
    ball1Ref,
  ) {
    const goalLeft = calculateRadarPercentage(goalPosition[0], boardSize);
    const goalTop = calculateRadarPercentage(goalPosition[2], boardSize);

    return (
      <>
        <div className="h-11 w-px bg-line" aria-hidden="true" />
        <div
          className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl border border-line bg-base/80"
          title="Canlı 2B Labirent Radarı"
        >
          {/* Hedef Portalı */}
          <div
            style={{
              left: `${goalLeft}%`,
              top: `${goalTop}%`,
            }}
            className={`absolute h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full ${
              isPortalUnlocked
                ? 'bg-ok shadow-[0_0_6px_var(--gm-ok)]'
                : 'bg-brass'
            }`}
          />
          {/* Kalan Kristaller */}
          {remainingCrystals.map(([cx, cz], idx) => {
            const cLeft = calculateRadarPercentage(cx, boardSize);
            const cTop = calculateRadarPercentage(cz, boardSize);
            return (
              <div
                key={`radar-c-${idx}`}
                style={{
                  left: `${cLeft}%`,
                  top: `${cTop}%`,
                }}
                className="absolute h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-signal"
              />
            );
          })}
          {/* 1. Oyuncu */}
          <div
            ref={ball1Ref}
            className="absolute top-0 left-0 h-2 w-2 rounded-full bg-fg shadow-sm will-change-transform"
          />
          {/* 2. Oyuncu (Altın Bilye) */}
          {isMultiplayer && (
            <div
              ref={ball2Ref}
              className="absolute top-0 left-0 h-2 w-2 rounded-full bg-warn shadow-sm will-change-transform"
            />
          )}
        </div>
      </>
    );
  },
);

