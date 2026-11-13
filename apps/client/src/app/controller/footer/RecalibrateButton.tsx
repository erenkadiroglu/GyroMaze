'use client';

import { Crosshair } from 'lucide-react';
import { resolveRecalibrateAriaLabel } from '@/utils/controllerFooterUtils';

interface RecalibrateButtonProps {
  onRecalibrate: () => void;
}

/**
 * Mobil kontrolcü jiroskop merkezini sıfırlayan kalibrasyon butonu.
 */
export function RecalibrateButton({ onRecalibrate }: RecalibrateButtonProps) {
  const ariaLabel = resolveRecalibrateAriaLabel();

  return (
    <button
      type="button"
      onClick={onRecalibrate}
      aria-label={ariaLabel}
      className="flex min-h-[48px] cursor-pointer items-center justify-center gap-2 rounded-2xl border border-brass/40 bg-brass/15 text-xs font-semibold text-brass active:scale-95"
    >
      <Crosshair className="h-4 w-4" aria-hidden="true" />
      <span>Merkezi kalibre et</span>
    </button>
  );
}
