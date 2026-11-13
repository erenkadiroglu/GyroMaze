'use client';

import { HeaderCrystalStatus } from './readouts/HeaderCrystalStatus';
import { HeaderTimerStatus } from './readouts/HeaderTimerStatus';
import { HeaderMultiplayerBadge } from './readouts/HeaderMultiplayerBadge';

export interface HeaderStatusReadoutsProps {
  portalTooltip: string;
  ratioText: string;
  isPortalUnlocked: boolean;
  isTimeAttack: boolean;
  timerColorClass: string;
  visibleTimerText: string;
  currentBestTime?: number;
  isMultiplayer: boolean;
  multiplayerTooltip: string;
}

/**
 * Masaüstü HUD sağ kapsülü içindeki oyun durumu okuma göstergeleri:
 * - Kristal toplama oranı ve portal açılma kilidi
 * - Aktif oyun süresi (veya süreye karşı geri sayım) ve bölüm rekoru
 * - Çok oyunculu mod aktiflik rozeti
 */
export function HeaderStatusReadouts({
  portalTooltip,
  ratioText,
  isPortalUnlocked,
  isTimeAttack,
  timerColorClass,
  visibleTimerText,
  currentBestTime,
  isMultiplayer,
  multiplayerTooltip,
}: HeaderStatusReadoutsProps) {
  return (
    <>
      <HeaderCrystalStatus
        portalTooltip={portalTooltip}
        ratioText={ratioText}
        isPortalUnlocked={isPortalUnlocked}
      />

      <span className="h-4 w-px bg-line" aria-hidden="true" />

      <HeaderTimerStatus
        isTimeAttack={isTimeAttack}
        timerColorClass={timerColorClass}
        visibleTimerText={visibleTimerText}
        currentBestTime={currentBestTime}
      />

      <HeaderMultiplayerBadge
        isMultiplayer={isMultiplayer}
        multiplayerTooltip={multiplayerTooltip}
      />
    </>
  );
}
