'use client';

import { useDesktopFooter } from '@/hooks/useDesktopFooter';
import { AttitudeGauge } from '@/components/ui/AttitudeGauge';
import { QuickControlsToolbar } from '@/components/ui/toolbar';
import { FooterKeyboardHints } from './FooterKeyboardHints';

export interface DesktopFooterControlsProps {
  boardSize: number;
  goalPosition: [number, number, number];
  remainingCrystals: Array<[number, number]>;
  isPortalUnlocked: boolean;
  onResetClick: () => void;
}

/**
 * Masaüstü HUD alt paneli:
 * - Sol: Kokpit tutum göstergesi (AttitudeGauge) & mini harita
 * - Orta: 1P ve 2P klavye kontrol ipuçları (FooterKeyboardHints)
 * - Sağ: Hızlı eylem ikon araç çubuğu (QuickControlsToolbar)
 */
export function DesktopFooterControls({
  boardSize,
  goalPosition,
  remainingCrystals,
  isPortalUnlocked,
  onResetClick,
}: DesktopFooterControlsProps) {
  const {
    isControllerPaired,
    isSecondControllerPaired,
    isMultiplayer,
    showMiniMap,
    footerContainerClass,
    footerAriaLabel,
  } = useDesktopFooter();

  return (
    <footer
      role="contentinfo"
      aria-label={footerAriaLabel}
      className={footerContainerClass}
    >
      <AttitudeGauge
        boardSize={boardSize}
        goalPosition={goalPosition}
        remainingCrystals={remainingCrystals}
        isPortalUnlocked={isPortalUnlocked}
        isMultiplayer={isMultiplayer}
        showMiniMap={showMiniMap}
      />

      <FooterKeyboardHints
        isControllerPaired={isControllerPaired}
        isSecondControllerPaired={isSecondControllerPaired}
        isMultiplayer={isMultiplayer}
      />

      {/* Sağ Alt Hızlı İkon Araç Çubuğu */}
      <QuickControlsToolbar onResetClick={onResetClick} />
    </footer>
  );
}

