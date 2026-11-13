'use client';

import { PauseRecoveryMessage, PauseRecoveryActions } from './recovery';

interface PauseRecoveryBarProps {
  open: boolean;
  onPairClick: () => void;
  onResumeClick: () => void;
}

/**
 * Kontrolcü bağlantısı koptuğunda oyun duraklatılınca sahne üzerinde beliren kurtarma ve devam etme çubuğu.
 */
export function PauseRecoveryBar({
  open,
  onPairClick,
  onResumeClick,
}: PauseRecoveryBarProps) {
  if (!open) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-auto fixed top-20 left-1/2 z-20 flex -translate-x-1/2 items-center gap-3 rounded-2xl border border-warn/45 bg-surface/95 px-4 py-2 text-sm shadow-xl backdrop-blur-md"
    >
      <PauseRecoveryMessage />
      <PauseRecoveryActions
        onPairClick={onPairClick}
        onResumeClick={onResumeClick}
      />
    </div>
  );
}
