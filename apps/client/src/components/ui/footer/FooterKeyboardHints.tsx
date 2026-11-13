'use client';

import {
  shouldShowKeyboardHints,
  resolveMultiplayerSlotHints,
} from '@/utils/footerControlsUtils';
import { formatKeyboardHintAriaLabel } from '@/utils/footerKeyboardHintUtils';
import { MultiplayerKeyboardHints, SoloKeyboardHints } from './hints';

interface FooterKeyboardHintsProps {
  isControllerPaired: boolean;
  isSecondControllerPaired: boolean;
  isMultiplayer: boolean;
}

/**
 * Masaüstü sahnesi alt orta kısımda aktif kontrol moduna göre klavye yönlendirme ve eylem ipuçlarını sunar.
 */
export function FooterKeyboardHints({
  isControllerPaired,
  isSecondControllerPaired,
  isMultiplayer,
}: FooterKeyboardHintsProps) {
  if (
    !shouldShowKeyboardHints(
      isControllerPaired,
      isMultiplayer,
      isSecondControllerPaired,
    )
  ) {
    return null;
  }

  const { showP1, showP2, showSeparator } = resolveMultiplayerSlotHints(
    isControllerPaired,
    isSecondControllerPaired,
  );

  const ariaLabel = formatKeyboardHintAriaLabel(
    isMultiplayer,
    showP1,
    showP2,
  );

  return (
    <div
      role="note"
      aria-label={ariaLabel}
      className="gm-panel hidden items-center gap-2 rounded-xl px-3 py-1.5 text-xs text-muted lg:flex"
    >
      {isMultiplayer ? (
        <MultiplayerKeyboardHints
          showP1={showP1}
          showP2={showP2}
          showSeparator={showSeparator}
        />
      ) : (
        <SoloKeyboardHints />
      )}
    </div>
  );
}

