'use client';

import { Users } from 'lucide-react';
import { resolveMultiplayerBadgeAriaLabel } from '@/utils/headerReadoutUtils';

interface HeaderMultiplayerBadgeProps {
  isMultiplayer: boolean;
  multiplayerTooltip: string;
}

/**
 * Masaüstü HUD üst çubuğu çok oyunculu (2 Oyuncu) modu aktiflik rozeti.
 */
export function HeaderMultiplayerBadge({
  isMultiplayer,
  multiplayerTooltip,
}: HeaderMultiplayerBadgeProps) {
  if (!isMultiplayer) return null;

  const ariaLabel = resolveMultiplayerBadgeAriaLabel(isMultiplayer);

  return (
    <>
      <span className="h-4 w-px bg-line" aria-hidden="true" />
      <span
        role="status"
        aria-label={ariaLabel}
        className="inline-flex items-center gap-1 rounded-lg bg-brass/15 px-2 py-0.5 text-xs font-medium text-brass"
        title={multiplayerTooltip}
      >
        <Users className="h-3 w-3" aria-hidden="true" />
        2 Oyuncu
      </span>
    </>
  );
}
