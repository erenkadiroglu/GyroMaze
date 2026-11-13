'use client';

import { Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/primitives';
import {
  resolvePairingButtonVariant,
  formatPairingButtonRoomCode,
  resolvePairingBadgeClass,
  formatPairingButtonAriaLabel,
} from '@/utils/headerActionUtils';

interface HeaderPairingButtonProps {
  isAnyPaired: boolean;
  roomId?: string | null;
  pairingBadge: { text: string; isLatency: boolean };
  onOpenPairing: () => void;
}

/**
 * Masaüstü HUD üst çubuğu telefon eşleştirme, oda kodu ve gecikme rozeti butonu.
 */
export function HeaderPairingButton({
  isAnyPaired,
  roomId,
  pairingBadge,
  onOpenPairing,
}: HeaderPairingButtonProps) {
  const variant = resolvePairingButtonVariant(isAnyPaired);
  const roomCodeText = formatPairingButtonRoomCode(roomId);
  const badgeClass = resolvePairingBadgeClass(pairingBadge.isLatency);
  const ariaLabel = formatPairingButtonAriaLabel(roomId, pairingBadge.text);

  return (
    <Button
      variant={variant}
      size="sm"
      icon={<Smartphone className="h-3.5 w-3.5" aria-hidden="true" />}
      onClick={onOpenPairing}
      title="Oda kodu ve QR bağlantı penceresini aç"
      aria-label={ariaLabel}
    >
      <span className="gm-num tracking-wider">{roomCodeText}</span>
      <span className={badgeClass}>{pairingBadge.text}</span>
    </Button>
  );
}
