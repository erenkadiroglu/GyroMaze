'use client';

import { GameOutcomeModals } from '../GameOutcomeModals';
import { UtilityModalsGroup, SocialModalsGroup } from './modals';

interface DesktopModalsLayerProps {
  isLeaderboardOpen: boolean;
  onCloseLeaderboard: () => void;
  leaderboardInitialLevel: number;
}

/**
 * Masaüstü sahnesi üzerindeki tüm etkileşimli modalları, çekmeceleri ve sonuç pencerelerini tek bir katmanda toplar.
 */
export function DesktopModalsLayer({
  isLeaderboardOpen,
  onCloseLeaderboard,
  leaderboardInitialLevel,
}: DesktopModalsLayerProps) {
  return (
    <>
      <UtilityModalsGroup />
      <SocialModalsGroup
        isLeaderboardOpen={isLeaderboardOpen}
        onCloseLeaderboard={onCloseLeaderboard}
        leaderboardInitialLevel={leaderboardInitialLevel}
      />
      <GameOutcomeModals />
    </>
  );
}
