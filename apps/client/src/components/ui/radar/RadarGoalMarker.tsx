'use client';

import {
  calculateRadarPercentage,
  resolveGoalMarkerClasses,
} from '@/utils/radarUtils';

interface RadarGoalMarkerProps {
  goalPosition: [number, number, number];
  boardSize: number;
  isPortalUnlocked: boolean;
}

export function RadarGoalMarker({
  goalPosition,
  boardSize,
  isPortalUnlocked,
}: RadarGoalMarkerProps) {
  const goalLeft = calculateRadarPercentage(goalPosition[0], boardSize);
  const goalTop = calculateRadarPercentage(goalPosition[2], boardSize);
  const colorClass = resolveGoalMarkerClasses(isPortalUnlocked);

  return (
    <div
      style={{
        left: `${goalLeft}%`,
        top: `${goalTop}%`,
      }}
      className={`absolute h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full ${colorClass}`}
    />
  );
}

