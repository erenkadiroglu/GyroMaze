'use client';

import { cx, handleRadioGroupKeyDown } from '@/components/ui/primitives';
import { formatPairingSlotLabel } from '@/utils/pairingUtils';

export interface PairingSlotSelectorProps {
  pairingSlot: 1 | 2;
  onSelectSlot: (slot: 1 | 2) => void;
  isControllerPaired: boolean;
  isSecondControllerPaired: boolean;
}

/**
 * Çok oyunculu modda 1. veya 2. oyuncu için mobil kontrolcü yuvası seçimi
 * sunan erişilebilir (WAI-ARIA RadioGroup) sekme kontrolü.
 */
export function PairingSlotSelector({
  pairingSlot,
  onSelectSlot,
  isControllerPaired,
  isSecondControllerPaired,
}: PairingSlotSelectorProps) {
  return (
    <div
      role="radiogroup"
      aria-label="Eşleştirilecek oyuncu"
      className="grid grid-cols-2 gap-1 rounded-xl border border-line bg-surface-2 p-1"
    >
      {([1, 2] as const).map((slot, idx) => {
        const active = pairingSlot === slot;
        return (
          <button
            key={slot}
            type="button"
            role="radio"
            aria-checked={active}
            tabIndex={active ? 0 : -1}
            onClick={() => onSelectSlot(slot)}
            onKeyDown={(e) =>
              handleRadioGroupKeyDown(e, idx, 2, (nextIdx) =>
                onSelectSlot(nextIdx === 0 ? 1 : 2),
              )
            }
            className={cx(
              'h-9 cursor-pointer rounded-lg text-xs font-semibold transition-colors',
              active ? 'bg-surface text-fg shadow-sm' : 'text-muted',
            )}
          >
            {formatPairingSlotLabel(
              slot,
              isControllerPaired,
              isSecondControllerPaired,
            )}
          </button>
        );
      })}
    </div>
  );
}

