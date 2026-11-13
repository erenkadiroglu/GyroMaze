'use client';

import { forwardRef } from 'react';
import { RadarGoalMarker } from './radar/RadarGoalMarker';
import { RadarCrystalMarkers } from './radar/RadarCrystalMarkers';
import { RadarPlayerMarkers } from './radar/RadarPlayerMarkers';

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
    return (
      <>
        <div className="h-11 w-px bg-line" aria-hidden="true" />
        <div
          className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl border border-line bg-base/80"
          title="Canlı 2B Labirent Radarı"
        >
          <RadarGoalMarker
            goalPosition={goalPosition}
            boardSize={boardSize}
            isPortalUnlocked={isPortalUnlocked}
          />

          <RadarCrystalMarkers
            remainingCrystals={remainingCrystals}
            boardSize={boardSize}
          />

          <RadarPlayerMarkers
            ref={ball1Ref}
            ball2Ref={ball2Ref}
            isMultiplayer={isMultiplayer}
          />
        </div>
      </>
    );
  },
);
