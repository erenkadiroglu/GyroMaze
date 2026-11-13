'use client';

import { KeyboardHintItem } from './KeyboardHintItem';
import {
  getMultiplayerP1Hint,
  getMultiplayerP2Hint,
} from '@/utils/footerKeyboardHintUtils';

interface MultiplayerKeyboardHintsProps {
  showP1: boolean;
  showP2: boolean;
  showSeparator: boolean;
}

export function MultiplayerKeyboardHints({
  showP1,
  showP2,
  showSeparator,
}: MultiplayerKeyboardHintsProps) {
  const p1 = getMultiplayerP1Hint();
  const p2 = getMultiplayerP2Hint();

  return (
    <>
      {showP1 && (
        <KeyboardHintItem keyLabel={p1.key} actionLabel={p1.label} />
      )}
      {showSeparator && (
        <span className="text-line" aria-hidden="true">
          ·
        </span>
      )}
      {showP2 && (
        <KeyboardHintItem keyLabel={p2.key} actionLabel={p2.label} />
      )}
    </>
  );
}

