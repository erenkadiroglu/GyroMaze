'use client';

import { forwardRef } from 'react';
import { resolvePlayerMarkerClasses } from '@/utils/radarUtils';

interface RadarPlayerMarkersProps {
  isMultiplayer: boolean;
  ball2Ref?: React.Ref<HTMLDivElement>;
}

export const RadarPlayerMarkers = forwardRef<HTMLDivElement, RadarPlayerMarkersProps>(
  function RadarPlayerMarkers({ isMultiplayer, ball2Ref }, ball1Ref) {
    const p1Classes = resolvePlayerMarkerClasses(1);
    const p2Classes = resolvePlayerMarkerClasses(2);

    return (
      <>
        {/* 1. Oyuncu */}
        <div ref={ball1Ref} className={p1Classes} />

        {/* 2. Oyuncu (Altın Bilye) */}
        {isMultiplayer && <div ref={ball2Ref} className={p2Classes} />}
      </>
    );
  },
);

