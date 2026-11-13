'use client';

import { HeaderPairingButton } from './actions/HeaderPairingButton';
import { HeaderSettingsButton } from './actions/HeaderSettingsButton';
import { HeaderHelpButton } from './actions/HeaderHelpButton';

export interface HeaderActionButtonsProps {
  isAnyPaired: boolean;
  roomId?: string | null;
  pairingBadge: { text: string; isLatency: boolean };
  onOpenPairing: () => void;
  onOpenSettings: () => void;
  onToggleHelp: () => void;
}

/**
 * Masaüstü HUD sağ üst aksiyon düğmeleri:
 * - Mobil telefon eşleştirme modalı ve oda kodu/gecikme rozeti
 * - Oyun ayarları modalı
 * - Klavye kısayolları ve yardım rehberi (H)
 */
export function HeaderActionButtons({
  isAnyPaired,
  roomId,
  pairingBadge,
  onOpenPairing,
  onOpenSettings,
  onToggleHelp,
}: HeaderActionButtonsProps) {
  return (
    <>
      <span className="h-4 w-px bg-line" aria-hidden="true" />

      <HeaderPairingButton
        isAnyPaired={isAnyPaired}
        roomId={roomId}
        pairingBadge={pairingBadge}
        onOpenPairing={onOpenPairing}
      />

      <HeaderSettingsButton onOpenSettings={onOpenSettings} />

      <HeaderHelpButton onToggleHelp={onToggleHelp} />
    </>
  );
}
