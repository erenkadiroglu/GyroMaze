'use client';

import { LevelEditorModal } from '../LevelEditorModal';
import { SettingsModal } from '../SettingsModal';
import { HelpShortcutsModal } from '../HelpShortcutsModal';
import { PairingModal } from '../PairingModal';
import { LeaderboardModal } from '../LeaderboardModal';
import { GameOutcomeModals } from '../GameOutcomeModals';

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
      {/* YARDIMCI PANELLER */}
      <LevelEditorModal />
      <SettingsModal />
      <HelpShortcutsModal />

      {/* TELEFON EŞLEŞTİRME MODALI */}
      <PairingModal />

      {/* KÜRESEL SKOR TABLOSU MODALI */}
      <LeaderboardModal
        open={isLeaderboardOpen}
        onClose={onCloseLeaderboard}
        initialLevel={leaderboardInitialLevel}
      />

      {/* OYUN SONUCU MODALLARI (ZAFER VE SÜRE DOLDU) */}
      <GameOutcomeModals />
    </>
  );
}
