'use client';

import { Trophy, ArrowRight } from 'lucide-react';

interface ControllerVictoryBannerProps {
  onChangeLevel: (direction: 'next' | 'prev') => void;
}

/**
 * Mobil kontrolcüde bölüm tamamlandığında beliren zafer kutlaması ve "Sonraki bölüm" eylem şeridi.
 */
export function ControllerVictoryBanner({
  onChangeLevel,
}: ControllerVictoryBannerProps) {
  return (
    <div className="mt-2.5 flex items-center justify-between gap-3 rounded-2xl border border-ok/40 bg-surface px-4 py-3">
      <div className="flex items-center gap-2.5">
        <Trophy className="h-5 w-5 shrink-0 text-brass" aria-hidden="true" />
        <div>
          <p className="text-sm font-semibold text-ok">Bölüm tamamlandı</p>
          <p className="text-xs text-muted">
            Telefondan sıradaki bölüme geçebilirsin
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={() => onChangeLevel('next')}
        className="flex min-h-[44px] shrink-0 cursor-pointer items-center gap-1.5 rounded-xl bg-brass px-3.5 text-xs font-semibold text-brass-fg active:scale-95"
      >
        <span>Sonraki bölüm</span>
        <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
      </button>
    </div>
  );
}
