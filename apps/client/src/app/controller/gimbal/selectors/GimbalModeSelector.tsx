'use client';

import { Smartphone, Hand } from 'lucide-react';
import { resolveGimbalModeButtonClass } from '@/utils/gimbalSelectorUtils';

interface GimbalModeSelectorProps {
  controllerTouchOverride: boolean;
  onToggleTouchOverride: (touch: boolean) => void;
}

/**
 * Kontrol Modu Seçici (Jiroskop / Dokunmatik)
 */
export function GimbalModeSelector({
  controllerTouchOverride,
  onToggleTouchOverride,
}: GimbalModeSelectorProps) {
  return (
    <div
      role="radiogroup"
      aria-label="Kontrol modu"
      className="mt-2.5 grid w-64 grid-cols-2 gap-1 rounded-2xl border border-line bg-surface p-1"
    >
      <button
        type="button"
        role="radio"
        aria-checked={!controllerTouchOverride}
        tabIndex={!controllerTouchOverride ? 0 : -1}
        onClick={() => onToggleTouchOverride(false)}
        className={resolveGimbalModeButtonClass(!controllerTouchOverride)}
      >
        <Smartphone className="h-3.5 w-3.5" aria-hidden="true" />
        <span>Jiroskop</span>
      </button>

      <button
        type="button"
        role="radio"
        aria-checked={controllerTouchOverride}
        tabIndex={controllerTouchOverride ? 0 : -1}
        onClick={() => onToggleTouchOverride(true)}
        className={resolveGimbalModeButtonClass(controllerTouchOverride)}
      >
        <Hand className="h-3.5 w-3.5" aria-hidden="true" />
        <span>Dokunmatik</span>
      </button>
    </div>
  );
}
