'use client';

import type { BallSkin } from '@gyromaze/shared';
import { FieldLabel, handleRadioGroupKeyDown } from '../../primitives';
import { BALL_SKIN_OPTIONS } from '@/utils/settingsUtils';
import {
  resolveBallSkinButtonClass,
  formatBallSkinAriaLabel,
} from '@/utils/appearanceUtils';

interface AppearanceBallSkinSelectorProps {
  ballSkin: BallSkin;
  onSetBallSkin: (skin: BallSkin) => void;
}

/**
 * 3B bilye görünümü ve kaplama seçici radyo grubu bileşeni.
 */
export function AppearanceBallSkinSelector({
  ballSkin,
  onSetBallSkin,
}: AppearanceBallSkinSelectorProps) {
  return (
    <div>
      <FieldLabel>Bilye görünümü</FieldLabel>
      <div
        role="radiogroup"
        aria-label="Bilye görünümü"
        className="grid grid-cols-4 gap-1.5"
      >
        {BALL_SKIN_OPTIONS.map((skin, idx) => {
          const active = ballSkin === skin.value;
          return (
            <button
              key={skin.value}
              type="button"
              role="radio"
              aria-checked={active}
              aria-label={formatBallSkinAriaLabel(skin.label, active)}
              tabIndex={active ? 0 : -1}
              onClick={() => onSetBallSkin(skin.value)}
              onKeyDown={(e) =>
                handleRadioGroupKeyDown(
                  e,
                  idx,
                  BALL_SKIN_OPTIONS.length,
                  (nextIdx) => onSetBallSkin(BALL_SKIN_OPTIONS[nextIdx].value),
                )
              }
              className={`flex cursor-pointer flex-col items-center gap-1.5 rounded-xl border py-2 text-xs font-medium transition-colors ${resolveBallSkinButtonClass(
                active,
              )}`}
            >
              <span
                aria-hidden="true"
                className={`h-4 w-4 rounded-full ring-1 ring-line ${skin.swatchClass}`}
              />
              <span>{skin.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
