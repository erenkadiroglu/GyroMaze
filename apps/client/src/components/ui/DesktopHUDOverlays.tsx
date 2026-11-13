'use client';

import { useDesktopHUDOverlays } from '@/hooks/useDesktopHUDOverlays';
import { PauseRecoveryBar, HudNotificationToast } from './overlays';

export interface DesktopHUDOverlaysProps {
  isAnyOverlayOpen: boolean;
}

/**
 * Masaüstü HUD sahne üzeri duraklatma/bağlantı kurtarma çubuğu ve
 * geçici durum bildirim kartlarını (HUD Notifications) sunan deklaratif katman bileşeni.
 */
export function DesktopHUDOverlays({
  isAnyOverlayOpen,
}: DesktopHUDOverlaysProps) {
  const {
    showRecoveryBar,
    handlePairClick,
    handleResumeClick,
    hudNotification,
    containerProps,
  } = useDesktopHUDOverlays({ isAnyOverlayOpen });

  return (
    <div {...containerProps}>
      <PauseRecoveryBar
        open={showRecoveryBar}
        onPairClick={handlePairClick}
        onResumeClick={handleResumeClick}
      />

      <HudNotificationToast notification={hudNotification} />
    </div>
  );
}
