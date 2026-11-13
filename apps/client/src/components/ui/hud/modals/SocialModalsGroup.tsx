'use client';

import { PairingModal } from '../../PairingModal';
import { LeaderboardModal } from '../../LeaderboardModal';

interface SocialModalsGroupProps {
  isLeaderboardOpen: boolean;
  onCloseLeaderboard: () => void;
  leaderboardInitialLevel: number;
}

/**
 * Masaüstü sahnesindeki eşleştirme ve sosyal etkileşim modallarını gruplar:
 * - Mobil telefon QR eşleştirme modalı (PairingModal)
 * - Küresel ve bölüm bazlı skor tablosu modalı (LeaderboardModal)
 */
export function SocialModalsGroup({
  isLeaderboardOpen,
  onCloseLeaderboard,
  leaderboardInitialLevel,
}: SocialModalsGroupProps) {
  return (
    <>
      <PairingModal />
      <LeaderboardModal
        open={isLeaderboardOpen}
        onClose={onCloseLeaderboard}
        initialLevel={leaderboardInitialLevel}
      />
    </>
  );
}

