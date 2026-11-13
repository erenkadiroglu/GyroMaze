'use client';

import { Smartphone, SlidersHorizontal, HelpCircle } from 'lucide-react';
import { Button, IconButton } from '@/components/ui/primitives';

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

      {/* Oda Kodu & Eşleştir Düğmesi */}
      <Button
        variant={isAnyPaired ? 'secondary' : 'primary'}
        size="sm"
        icon={<Smartphone className="h-3.5 w-3.5" aria-hidden="true" />}
        onClick={onOpenPairing}
        title="Oda kodu ve QR bağlantı penceresini aç"
      >
        <span className="gm-num tracking-wider">
          {roomId ?? '......'}
        </span>
        {pairingBadge.isLatency ? (
          <span className="gm-num hidden text-xs text-ok sm:inline">
            {pairingBadge.text}
          </span>
        ) : (
          <span className="hidden sm:inline">{pairingBadge.text}</span>
        )}
      </Button>

      {/* Ayarlar Paneli Düğmesi */}
      <Button
        variant="secondary"
        size="sm"
        icon={<SlidersHorizontal className="h-3.5 w-3.5" aria-hidden="true" />}
        onClick={onOpenSettings}
      >
        Ayarlar
      </Button>

      {/* Kısayollar ve Yardım Rehberi */}
      <IconButton
        label="Klavye kısayolları ve yardım rehberi"
        shortcut="H"
        onClick={onToggleHelp}
      >
        <HelpCircle className="h-4 w-4 text-brass" aria-hidden="true" />
      </IconButton>
    </>
  );
}

