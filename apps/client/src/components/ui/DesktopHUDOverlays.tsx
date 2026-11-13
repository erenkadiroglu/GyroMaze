'use client';

import { useGameStore } from '@/store/useGameStore';
import { shouldShowPauseRecoveryBar } from '@/utils/overlayBarUtils';
import { PauseRecoveryBar } from './overlays/PauseRecoveryBar';
import { HudNotificationToast } from './overlays/HudNotificationToast';

export interface DesktopHUDOverlaysProps {
  isAnyOverlayOpen: boolean;
}

/**
 * Masaüstü HUD sahne üzeri duraklatma/bağlantı kurtarma çubuğu ve
 * geçici durum bildirim kartları (HUD Notifications).
 */
export function DesktopHUDOverlays({
  isAnyOverlayOpen,
}: DesktopHUDOverlaysProps) {
  const gameStatus = useGameStore((s) => s.gameStatus);
  const setGameStatus = useGameStore((s) => s.setGameStatus);
  const setPairingModalOpen = useGameStore((s) => s.setPairingModalOpen);
  const hudNotification = useGameStore((s) => s.hudNotification);

  const showRecoveryBar = shouldShowPauseRecoveryBar(gameStatus, isAnyOverlayOpen);

  return (
    <>
      <PauseRecoveryBar
        open={showRecoveryBar}
        onPairClick={() => setPairingModalOpen(true)}
        onResumeClick={() => setGameStatus('playing')}
      />

      <HudNotificationToast notification={hudNotification} />
    </>
  );
}
