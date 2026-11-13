'use client';

import { handleRadioGroupKeyDown } from '@/components/ui/primitives';
import { PLAYER_SLOT_OPTIONS } from '@/utils/gimbalPadUtils';
import { resolveSlotButtonClass } from '@/utils/gimbalSelectorUtils';

interface GimbalSlotSelectorProps {
  playerSlot: 1 | 2;
  onSelectSlot: (slot: 1 | 2) => void;
}

/**
 * Çok Oyunculu Oyuncu Yuvası Seçici (1. Oyuncu / 2. Oyuncu)
 */
export function GimbalSlotSelector({
  playerSlot,
  onSelectSlot,
}: GimbalSlotSelectorProps) {
  return (
    <div
      role="radiogroup"
      aria-label="Oyuncu yuvası"
      className="mt-2 grid w-64 grid-cols-2 gap-1 rounded-2xl border border-line bg-surface p-1"
    >
      {PLAYER_SLOT_OPTIONS.map((entry, idx, list) => {
        const active = playerSlot === entry.slot;
        return (
          <button
            key={entry.slot}
            type="button"
            role="radio"
            aria-checked={active}
            tabIndex={active ? 0 : -1}
            onClick={() => onSelectSlot(entry.slot)}
            onKeyDown={(e) =>
              handleRadioGroupKeyDown(e, idx, list.length, (nextIdx) =>
                onSelectSlot(list[nextIdx].slot),
              )
            }
            className={resolveSlotButtonClass(active, entry.slot)}
          >
            {entry.label}
          </button>
        );
      })}
    </div>
  );
}
