'use client';

import { useDesktopModals } from '@/hooks/useDesktopModals';
import { GameOutcomeModals } from '../GameOutcomeModals';
import { UtilityModalsGroup, SocialModalsGroup } from './modals';

export interface DesktopModalsLayerProps {
  isLeaderboardOpen: boolean;
  onCloseLeaderboard: () => void;
  leaderboardInitialLevel: number;
}

/**
 * Masaüstü sahnesi üzerindeki tüm etkileşimli modalları, çekmeceleri ve sonuç pencerelerini
 * tek bir erişilebilir ve öncelik odaklı katmanda toplayan orkestratör bileşen.
 */
export function DesktopModalsLayer({
  isLeaderboardOpen,
  onCloseLeaderboard,
  leaderboardInitialLevel,
}: DesktopModalsLayerProps) {
  const { state } = useDesktopModals({
    isLeaderboardOpen,
    onCloseLeaderboard,
    leaderboardInitialLevel,
  });

  return (
    <div {...state.containerAria}>
      <UtilityModalsGroup />
      <SocialModalsGroup
        isLeaderboardOpen={isLeaderboardOpen}
        onCloseLeaderboard={onCloseLeaderboard}
        leaderboardInitialLevel={leaderboardInitialLevel}
      />
      <GameOutcomeModals />
    </div>
  );
}
