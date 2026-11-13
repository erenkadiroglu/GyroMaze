'use client';

import { useGameStore } from '@/store/useGameStore';
import { AttitudeGauge } from './AttitudeGauge';
import { QuickControlsToolbar } from './QuickControlsToolbar';
import { Kbd } from './primitives';

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
 * - Orta: 1P ve 2P klavye kontrol ipuçları (WASD, Oklar, R, L)
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
    <footer className="flex flex-wrap items-end justify-between gap-4">
      <AttitudeGauge
        boardSize={boardSize}
        goalPosition={goalPosition}
        remainingCrystals={remainingCrystals}
        isPortalUnlocked={isPortalUnlocked}
        isMultiplayer={isMultiplayer}
        showMiniMap={showMiniMap}
      />

      {(!isControllerPaired ||
        (isMultiplayer && !isSecondControllerPaired)) && (
        <div className="gm-panel hidden items-center gap-2 rounded-xl px-3 py-1.5 text-xs text-muted lg:flex">
          {isMultiplayer ? (
            <>
              {!isControllerPaired && (
                <>
                  <Kbd>WASD</Kbd>
                  <span>1. Bilye</span>
                </>
              )}
              {!isControllerPaired && !isSecondControllerPaired && (
                <span className="text-line">·</span>
              )}
              {!isSecondControllerPaired && (
                <>
                  <Kbd>Oklar</Kbd>
                  <span>2. Bilye</span>
                </>
              )}
            </>
          ) : (
            <>
              <Kbd>WASD</Kbd>
              <span>Eğim</span>
              <span className="text-line">·</span>
              <Kbd>R</Kbd>
              <span>Sıfırla</span>
              <span className="text-line">·</span>
              <Kbd>L</Kbd>
              <span>Gece/Gündüz</span>
            </>
          )}
        </div>
      )}

      {/* Sağ Alt Hızlı İkon Araç Çubuğu */}
      <QuickControlsToolbar onResetClick={onResetClick} />
    </footer>
  );
}

