'use client';

import { Wifi, WifiOff } from 'lucide-react';
import { cx } from '@/components/ui/primitives';
import { resolveControllerConnectionBadge } from '@/utils/controllerUtils';
import { resolveConnectionAriaLabel } from '@/utils/controllerHeaderUtils';

interface ControllerConnectionBadgeProps {
  isControllerPaired: boolean;
  isSocketConnected: boolean;
  latencyMs: number;
}

/**
 * Mobil kontrolcü ağ bağlantı durumu ve ping gecikme göstergesi rozeti.
 */
export function ControllerConnectionBadge({
  isControllerPaired,
  isSocketConnected,
  latencyMs,
}: ControllerConnectionBadgeProps) {
  const connectionBadge = resolveControllerConnectionBadge(
    isControllerPaired,
    isSocketConnected,
    latencyMs,
  );
  const connectionAriaLabel = resolveConnectionAriaLabel(
    isControllerPaired,
    isSocketConnected,
    latencyMs,
  );

  return (
    <div
      aria-label={connectionAriaLabel}
      className="flex min-h-[40px] items-center gap-1.5 rounded-xl border border-line bg-surface-2 px-3 text-xs font-semibold"
    >
      {connectionBadge.state === 'paired' ? (
        <>
          <Wifi className="h-3.5 w-3.5 text-ok" aria-hidden="true" />
          <span className="text-ok">Bağlı</span>
          {latencyMs > 0 && (
            <span className={cx('gm-num font-mono text-[11px]', connectionBadge.latencyClass)}>
              {latencyMs}ms
            </span>
          )}
        </>
      ) : connectionBadge.state === 'ready' ? (
        <>
          <span className="h-2 w-2 rounded-full bg-brass" aria-hidden="true" />
          <span className="text-brass">Hazır</span>
        </>
      ) : (
        <>
          <WifiOff className="h-3.5 w-3.5 text-danger" aria-hidden="true" />
          <span className="text-danger">Kopuk</span>
        </>
      )}
    </div>
  );
}
