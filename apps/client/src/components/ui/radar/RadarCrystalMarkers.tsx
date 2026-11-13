'use client';

import { calculateCrystalPercentages } from '@/utils/radarUtils';

interface RadarCrystalMarkersProps {
  remainingCrystals: Array<[number, number]>;
  boardSize: number;
}

export function RadarCrystalMarkers({
  remainingCrystals,
  boardSize,
}: RadarCrystalMarkersProps) {
  const crystals = calculateCrystalPercentages(remainingCrystals, boardSize);

  return (
    <>
      {crystals.map(({ left, top, id }) => (
        <div
          key={id}
          style={{
            left: `${left}%`,
            top: `${top}%`,
          }}
          className="absolute h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-signal"
        />
      ))}
    </>
  );
}

