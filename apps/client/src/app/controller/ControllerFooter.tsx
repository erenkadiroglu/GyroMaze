'use client';

import { Crosshair, RotateCcw } from 'lucide-react';

interface ControllerFooterProps {
  showGimbalSurface: boolean;
  isControllerPaired: boolean;
  isSocketConnected: boolean;
  onRecalibrate: () => void;
  onResetBall: () => void;
}

export function ControllerFooter({
  showGimbalSurface,
  isControllerPaired,
  isSocketConnected,
  onRecalibrate,
  onResetBall,
}: ControllerFooterProps) {
  if (!showGimbalSurface) {
    return <div className="h-2" aria-hidden="true" />;
  }

  return (
    <footer className="grid grid-cols-2 gap-2.5">
      <button
        type="button"
        onClick={onRecalibrate}
        className="flex min-h-[48px] cursor-pointer items-center justify-center gap-2 rounded-2xl border border-brass/40 bg-brass/15 text-xs font-semibold text-brass active:scale-95"
      >
        <Crosshair className="h-4 w-4" aria-hidden="true" />
        <span>Merkezi kalibre et</span>
      </button>

      <button
        type="button"
        disabled={!isControllerPaired || !isSocketConnected}
        onClick={onResetBall}
        className="flex min-h-[48px] cursor-pointer items-center justify-center gap-2 rounded-2xl border border-line bg-surface text-xs font-semibold text-fg active:scale-95 disabled:pointer-events-none disabled:opacity-45"
      >
        <RotateCcw className="h-4 w-4 text-muted" aria-hidden="true" />
        <span>Topu sıfırla</span>
      </button>
    </footer>
  );
}
