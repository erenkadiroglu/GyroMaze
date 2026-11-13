'use client';

import { Smartphone, ArrowRight } from 'lucide-react';
import { Button } from '../primitives';

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
      <span className="font-medium text-warn">
        Kontrolcü bağlantısı koptu — oyun duraklatıldı
      </span>
      <div className="flex items-center gap-1.5">
        <Button
          variant="secondary"
          size="sm"
          icon={<Smartphone className="h-3.5 w-3.5" aria-hidden="true" />}
          onClick={onPairClick}
        >
          Bağla
        </Button>
        <Button
          variant="primary"
          size="sm"
          icon={<ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />}
          onClick={onResumeClick}
        >
          Devam et
        </Button>
      </div>
    </div>
  );
}
