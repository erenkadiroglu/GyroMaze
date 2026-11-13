'use client';

import { useGameStore } from '@/store/useGameStore';
import { getMazeLevel } from '@/components/scene/mazeLevels';
import { useGameTimer } from '@/hooks/useGameTimer';
import { useDesktopKeyboardShortcuts } from '@/hooks/useDesktopKeyboardShortcuts';
import { LevelEditorModal } from './LevelEditorModal';
import { SettingsModal } from './SettingsModal';
import { HelpShortcutsModal } from './HelpShortcutsModal';
import { LeaderboardModal } from './LeaderboardModal';
import { PairingModal } from './PairingModal';
import { GameOutcomeModals } from './GameOutcomeModals';
import { DesktopHeader } from './DesktopHeader';
import { DesktopHUDOverlays } from './DesktopHUDOverlays';
import { DesktopFooterControls } from './DesktopFooterControls';

/**
 * Masaüstü 3B sahne üzerindeki düzenli, tek odaklı HUD orkestratörü:
 * - Üst çubuk: DesktopHeader (marka, seviye seçici, kristal, süre, oda ve ayarlar)
 * - Sahne üstü bildirimler & kurtarma çubuğu: DesktopHUDOverlays
 * - Alt bölge: Kokpit göstergesi, klavye ipuçları ve araç çubuğu (DesktopFooterControls)
 * - Modallar: Eşleştirme, skor tablosu, ayarlar, editör, yardım ve oyun sonu
 */
export function DesktopHUD() {
  const isPairingModalOpen = useGameStore((s) => s.isPairingModalOpen);
  const isLeaderboardOpen = useGameStore((s) => s.isLeaderboardOpen);
  const setLeaderboardOpen = useGameStore((s) => s.setLeaderboardOpen);
  const isEditorOpen = useGameStore((s) => s.isEditorOpen);
  const isSettingsOpen = useGameStore((s) => s.isSettingsOpen);
  const isHelpOpen = useGameStore((s) => s.isHelpOpen);
  const level = useGameStore((s) => s.level);
  const customLevel = useGameStore((s) => s.customLevel);
  const collectedCrystals = useGameStore((s) => s.collectedCrystals);

  const currentLevelInfo = getMazeLevel(level, customLevel);
  const totalCrystals = currentLevelInfo.crystals.length;
  const remainingCrystals = currentLevelInfo.crystals.filter(
    (_, idx) => !collectedCrystals.includes(idx),
  );
  const isPortalUnlocked = collectedCrystals.length >= totalCrystals;

  const isAnyOverlayOpen =
    isPairingModalOpen ||
    isSettingsOpen ||
    isEditorOpen ||
    isLeaderboardOpen ||
    isHelpOpen;

  // Oyun saati ve Süreye Karşı modu kancası
  const { handleResetClick } = useGameTimer({
    starThresholds: currentLevelInfo.starThresholds,
    isAnyOverlayOpen,
  });

  // Global masaüstü klavye kısayolları kancası
  useDesktopKeyboardShortcuts({
    isAnyOverlayOpen,
    isHelpOpen,
  });

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

      {/* YARDIMCI PANELLER */}
      <LevelEditorModal />
      <SettingsModal />
      <HelpShortcutsModal />

      {/* TELEFON EŞLEŞTİRME MODALI */}
      <PairingModal />

      {/* KÜRESEL SKOR TABLOSU MODALI */}
      <LeaderboardModal
        open={isLeaderboardOpen}
        onClose={() => setLeaderboardOpen(false)}
        initialLevel={currentLevelInfo.id === 99 ? 1 : currentLevelInfo.id}
      />

      {/* OYUN SONUCU MODALLARI (ZAFER VE SÜRE DOLDU) */}
      <GameOutcomeModals />
    </div>
  );
}
