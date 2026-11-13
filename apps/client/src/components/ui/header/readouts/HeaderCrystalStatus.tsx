'use client';

import { Gem, Lock, Unlock } from 'lucide-react';
import { resolvePortalLockAriaLabel } from '@/utils/headerReadoutUtils';

interface HeaderCrystalStatusProps {
  portalTooltip: string;
  ratioText: string;
  isPortalUnlocked: boolean;
}

/**
 * Masaüstü HUD üst çubuğu kristal toplama oranı ve hedef portalı kilit durumu göstergesi.
 */
export function HeaderCrystalStatus({
  portalTooltip,
  ratioText,
  isPortalUnlocked,
}: HeaderCrystalStatusProps) {
  const lockAriaLabel = resolvePortalLockAriaLabel(isPortalUnlocked);

  return (
    <div
      className="flex items-center gap-1.5 px-1 text-sm"
      title={portalTooltip}
    >
      <Gem className="h-3.5 w-3.5 text-signal" aria-hidden="true" />
      <span className="gm-num font-semibold text-fg">{ratioText}</span>
      {isPortalUnlocked ? (
        <Unlock className="h-3.5 w-3.5 text-ok" aria-label={lockAriaLabel} />
      ) : (
        <Lock className="h-3.5 w-3.5 text-muted" aria-label={lockAriaLabel} />
      )}
    </div>
  );
}
