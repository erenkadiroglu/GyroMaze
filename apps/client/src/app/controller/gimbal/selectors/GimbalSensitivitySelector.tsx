'use client';

import { handleRadioGroupKeyDown } from '@/components/ui/primitives';
import { SENSITIVITY_OPTIONS } from '@/utils/gimbalPadUtils';
import { resolveSensitivityButtonClass } from '@/utils/gimbalSelectorUtils';

interface GimbalSensitivitySelectorProps {
  controllerSensitivity: 0.75 | 1 | 1.35;
  onSelectSensitivity: (mult: 0.75 | 1 | 1.35) => void;
}

/**
 * Hassasiyet Seçici (0.75x, 1.0x, 1.35x)
 */
export function GimbalSensitivitySelector({
  controllerSensitivity,
  onSelectSensitivity,
}: GimbalSensitivitySelectorProps) {
  return (
    <div
      role="radiogroup"
      aria-label="Jiroskop hassasiyeti"
      className="mt-2 grid w-64 grid-cols-3 gap-1 rounded-2xl border border-line bg-surface p-1"
    >
      {SENSITIVITY_OPTIONS.map((item, idx, list) => {
        const active = controllerSensitivity === item.mult;
        return (
          <button
            key={item.mult}
            type="button"
            role="radio"
            aria-checked={active}
            tabIndex={active ? 0 : -1}
            onClick={() => onSelectSensitivity(item.mult)}
            onKeyDown={(e) =>
              handleRadioGroupKeyDown(e, idx, list.length, (nextIdx) =>
                onSelectSensitivity(list[nextIdx].mult),
              )
            }
            className={resolveSensitivityButtonClass(active)}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
