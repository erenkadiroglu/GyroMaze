'use client';

import type { RefObject } from 'react';

interface GimbalPitchRollReadoutProps {
  pitchValueRef: RefObject<HTMLSpanElement | null>;
  rollValueRef: RefObject<HTMLSpanElement | null>;
}

/**
 * Sayısal Eğim (Pitch) ve Yatış (Roll) açı değerlerini doğrudan DOM ref ile gösteren telemetri paneli.
 */
export function GimbalPitchRollReadout({
  pitchValueRef,
  rollValueRef,
}: GimbalPitchRollReadoutProps) {
  return (
    <div className="mt-3 grid w-64 grid-cols-2 gap-2.5">
      <div className="rounded-2xl border border-line bg-surface p-2.5 text-center">
        <span className="block text-xs text-muted">Eğim (Pitch)</span>
        <span
          ref={pitchValueRef}
          className="gm-num mt-0.5 block text-lg font-semibold text-signal"
        >
          +0.0°
        </span>
      </div>
      <div className="rounded-2xl border border-line bg-surface p-2.5 text-center">
        <span className="block text-xs text-muted">Yatış (Roll)</span>
        <span
          ref={rollValueRef}
          className="gm-num mt-0.5 block text-lg font-semibold text-signal"
        >
          +0.0°
        </span>
      </div>
    </div>
  );
}

