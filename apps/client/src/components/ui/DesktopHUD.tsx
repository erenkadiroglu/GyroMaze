'use client';

import { useDesktopHUD } from '@/hooks/useDesktopHUD';
import { DesktopHeader } from './DesktopHeader';
import { DesktopHUDOverlays } from './DesktopHUDOverlays';
import { DesktopFooterControls } from './DesktopFooterControls';
import { DesktopModalsLayer } from './hud/DesktopModalsLayer';

/**
 * Masaüstü 3B sahne üzerindeki düzenli, tek odaklı HUD orkestratörü:
 * - Üst çubuk: DesktopHeader (marka, seviye seçici, kristal, süre, oda ve ayarlar)
 * - Sahne üstü bildirimler & kurtarma çubuğu: DesktopHUDOverlays
 * - Alt bölge: Kokpit göstergesi, klavye ipuçları ve araç çubuğu (DesktopFooterControls)
 * - Modallar: Eşleştirme, skor tablosu, ayarlar, editör, yardım ve oyun sonu (DesktopModalsLayer)
 */
export function DesktopHUD() {
  const {
    currentLevelInfo,
    remainingCrystals,
    isPortalUnlocked,
    isAnyOverlayOpen,
    handleResetClick,
    isLeaderboardOpen,
    setLeaderboardOpen,
    leaderboardInitialLevel,
  } = useDesktopHUD();

  return (
    <div className="pointer-events-none fixed inset-0 z-10 flex flex-col justify-between p-4 sm:p-5">
      {/* ÜST ÇUBUK (MARKA, SEVİYE SEÇİCİ, DURUM OKUMALARI VE ANA EYLEMLER) */}
      <DesktopHeader />

      {/* SAHNE ÜSTÜ BİLDİRİMLER VE DURAKLATMA ÇUBUĞU */}
      <DesktopHUDOverlays isAnyOverlayOpen={isAnyOverlayOpen} />

      {/* ALT BÖLGE: KOKPİT GÖSTERGESİ, İPUCU VE HIZLI ARAÇ ÇUBUĞU */}
      <DesktopFooterControls
        boardSize={currentLevelInfo.boardSize}
        goalPosition={currentLevelInfo.goalPosition}
        remainingCrystals={remainingCrystals}
        isPortalUnlocked={isPortalUnlocked}
        onResetClick={handleResetClick}
      />

      {/* MODALLAR VE YARDIMCI PANELLER KATMANI */}
      <DesktopModalsLayer
        isLeaderboardOpen={isLeaderboardOpen}
        onCloseLeaderboard={() => setLeaderboardOpen(false)}
        leaderboardInitialLevel={leaderboardInitialLevel}
      />
    </div>
  );
}
