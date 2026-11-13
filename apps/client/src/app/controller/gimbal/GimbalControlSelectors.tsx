'use client';

import { Smartphone, Hand } from 'lucide-react';
import { cx, handleRadioGroupKeyDown } from '@/components/ui/primitives';
import {
  SENSITIVITY_OPTIONS,
  PLAYER_SLOT_OPTIONS,
} from '@/utils/gimbalPadUtils';

interface GimbalControlSelectorsProps {
  controllerTouchOverride: boolean;
  onToggleTouchOverride: (touch: boolean) => void;
  controllerSensitivity: 0.75 | 1 | 1.35;
  onSelectSensitivity: (mult: 0.75 | 1 | 1.35) => void;
  playerSlot: 1 | 2;
  onSelectSlot: (slot: 1 | 2) => void;
}

/**
 * Kontrol modu (Jiroskop/Dokunmatik), hassasiyet çarpanı ve oyuncu yuvası radyo buton grupları.
 */
export function GimbalControlSelectors({
  controllerTouchOverride,
  onToggleTouchOverride,
  controllerSensitivity,
  onSelectSensitivity,
  playerSlot,
  onSelectSlot,
}: GimbalControlSelectorsProps) {
  return (
    <>
      {/* Kontrol Modu Seçici (Jiroskop / Dokunmatik) */}
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
          className={cx(
            'flex min-h-[38px] cursor-pointer items-center justify-center gap-1.5 rounded-xl text-xs font-semibold transition-colors',
            !controllerTouchOverride
              ? 'bg-brass text-brass-fg'
              : 'text-muted hover:text-fg',
          )}
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
          className={cx(
            'flex min-h-[38px] cursor-pointer items-center justify-center gap-1.5 rounded-xl text-xs font-semibold transition-colors',
            controllerTouchOverride
              ? 'bg-brass text-brass-fg'
              : 'text-muted hover:text-fg',
          )}
        >
          <Hand className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Dokunmatik</span>
        </button>
      </div>

      {/* Hassasiyet Seçici */}
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
              className={cx(
                'min-h-[38px] cursor-pointer rounded-xl text-xs font-semibold transition-colors',
                active
                  ? 'bg-brass text-brass-fg'
                  : 'text-muted hover:text-fg',
              )}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      {/* Çok Oyunculu Yuva Seçici */}
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
              className={cx(
                'min-h-[38px] cursor-pointer rounded-xl text-xs font-semibold transition-colors',
                active
                  ? entry.slot === 1
                    ? 'bg-surface-2 text-brass ring-1 ring-brass/60'
                    : 'bg-surface-2 text-warn ring-1 ring-warn/60'
                  : 'text-muted hover:text-fg',
              )}
            >
              {entry.label}
            </button>
          );
        })}
      </div>
    </>
  );
}

