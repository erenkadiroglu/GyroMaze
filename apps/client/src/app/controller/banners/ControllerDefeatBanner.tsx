'use client';

import { AlertCircle, RotateCcw } from 'lucide-react';

interface ControllerDefeatBannerProps {
  onResetBall: () => void;
}

/**
 * Süreye Karşı modunda süre dolduğunda beliren uyarı ve bilyeyi başa alma ("Tekrar dene") şeridi.
 */
export function ControllerDefeatBanner({
  onResetBall,
}: ControllerDefeatBannerProps) {
  return (
    <div className="mt-2.5 flex items-center justify-between gap-3 rounded-2xl border border-danger/40 bg-surface px-4 py-3">
      <div className="flex items-center gap-2.5">
        <AlertCircle
          className="h-5 w-5 shrink-0 text-danger"
          aria-hidden="true"
        />
        <div>
          <p className="text-sm font-semibold text-danger">Süre doldu</p>
          <p className="text-xs text-muted">
            Yeniden denemek için bilyeyi başa alabilirsin
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={onResetBall}
        className="flex min-h-[44px] shrink-0 cursor-pointer items-center gap-1.5 rounded-xl bg-brass px-3.5 text-xs font-semibold text-brass-fg active:scale-95"
      >
        <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
        <span>Tekrar dene</span>
      </button>
    </div>
  );
}
