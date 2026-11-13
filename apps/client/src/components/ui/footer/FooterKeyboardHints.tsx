'use client';

import { Kbd } from '../primitives';
import {
  shouldShowKeyboardHints,
  resolveMultiplayerSlotHints,
} from '@/utils/footerControlsUtils';

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

  return (
    <div
      role="note"
      aria-label="Klavye kontrol ipuçları"
      className="gm-panel hidden items-center gap-2 rounded-xl px-3 py-1.5 text-xs text-muted lg:flex"
    >
      {isMultiplayer ? (
        <>
          {showP1 && (
            <>
              <Kbd>WASD</Kbd>
              <span>1. Bilye</span>
            </>
          )}
          {showSeparator && <span className="text-line" aria-hidden="true">·</span>}
          {showP2 && (
            <>
              <Kbd>Oklar</Kbd>
              <span>2. Bilye</span>
            </>
          )}
        </>
      ) : (
        <>
          <Kbd>WASD</Kbd>
          <span>Eğim</span>
          <span className="text-line" aria-hidden="true">·</span>
          <Kbd>R</Kbd>
          <span>Sıfırla</span>
          <span className="text-line" aria-hidden="true">·</span>
          <Kbd>L</Kbd>
          <span>Gece/Gündüz</span>
        </>
      )}
    </div>
  );
}
