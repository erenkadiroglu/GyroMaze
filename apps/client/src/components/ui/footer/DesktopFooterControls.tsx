'use client';

import { useGameStore } from '@/store/useGameStore';
import { AttitudeGauge } from '@/components/ui/AttitudeGauge';
import { QuickControlsToolbar } from '@/components/ui/toolbar';
import { FooterKeyboardHints } from './FooterKeyboardHints';
import {
  getFooterAriaLabel,
  getFooterContainerClass,
} from '@/utils/desktopFooterUtils';

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
  const isControllerPaired = useGameStore((s) => s.isControllerPaired);
  const isSecondControllerPaired = useGameStore(
    (s) => s.isSecondControllerPaired,
  );
  const isMultiplayer = useGameStore((s) => s.isMultiplayer);
  const showMiniMap = useGameStore((s) => s.showMiniMap);

  return (
    <footer
      role="contentinfo"
      aria-label={getFooterAriaLabel()}
      className={getFooterContainerClass()}
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

