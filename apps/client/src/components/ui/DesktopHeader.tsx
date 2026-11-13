'use client';

import { useDesktopHeader } from '@/hooks/useDesktopHeader';
import { HeaderBrandCapsule } from './header/HeaderBrandCapsule';
import { HeaderStatusReadouts } from './header/HeaderStatusReadouts';
import { HeaderActionButtons } from './header/HeaderActionButtons';

/**
 * Masaüstü HUD üst çubuğu:
 * Sol kapsülde marka ve bölüm seçici popover'ı;
 * Sağ kapsülde kristal/süre durumu ve eşleştirme/ayarlar eylemlerini koordine eden orkestratör bileşen.
 */
export function DesktopHeader() {
  const {
    dotColor,
    isPortalUnlocked,
    portalTooltip,
    ratioText,
    isTimeAttack,
    timerColorClass,
    visibleTimerText,
    currentBestTime,
    isMultiplayer,
    multiplayerTooltip,
    isAnyPaired,
    roomId,
    pairingBadge,
    handleOpenPairing,
    handleOpenSettings,
    handleToggleHelp,
  } = useDesktopHeader();

  return (
    <header className="flex flex-wrap items-center justify-between gap-3">
      {/* Sol Kapsül: Marka ve Bölüm Seçici */}
      <HeaderBrandCapsule dotColor={dotColor} />

      {/* Sağ Kapsül: Durum Okumaları ve Ana Eylemler */}
      <div className="gm-panel pointer-events-auto flex flex-wrap items-center gap-2.5 rounded-2xl px-3.5 py-2 shadow-lg">
        <HeaderStatusReadouts
          portalTooltip={portalTooltip}
          ratioText={ratioText}
          isPortalUnlocked={isPortalUnlocked}
          isTimeAttack={isTimeAttack}
          timerColorClass={timerColorClass}
          visibleTimerText={visibleTimerText}
          currentBestTime={currentBestTime}
          isMultiplayer={isMultiplayer}
          multiplayerTooltip={multiplayerTooltip}
        />

        <HeaderActionButtons
          isAnyPaired={isAnyPaired}
          roomId={roomId}
          pairingBadge={pairingBadge}
          onOpenPairing={handleOpenPairing}
          onOpenSettings={handleOpenSettings}
          onToggleHelp={handleToggleHelp}
        />
      </div>
    </header>
  );
}
