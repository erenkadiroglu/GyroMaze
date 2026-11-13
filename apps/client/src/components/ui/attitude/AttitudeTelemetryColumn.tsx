'use client';

import { forwardRef } from 'react';

export interface AttitudeTelemetryColumnProps {
  pitchRef: React.RefObject<HTMLSpanElement | null>;
  rollRef: React.RefObject<HTMLSpanElement | null>;
  speedRef: React.RefObject<HTMLSpanElement | null>;
}

/**
 * Kokpit telemetri kümesindeki sayısal Eğim (Pitch), Yatış (Roll)
 * ve Bilye Hızı (Speed) gösterge sütunu.
 */
export const AttitudeTelemetryColumn = forwardRef<
  HTMLDListElement,
  AttitudeTelemetryColumnProps
>(function AttitudeTelemetryColumn({ pitchRef, rollRef, speedRef }, ref) {
  return (
    <dl
      ref={ref}
      className="grid grid-cols-[auto_auto] items-baseline gap-x-3 gap-y-0.5 text-xs"
    >
      <dt className="text-muted">Eğim</dt>
      <dd className="text-right">
        <span ref={pitchRef} className="gm-num text-sm text-signal">
          +0.0°
        </span>
      </dd>
      <dt className="text-muted">Yatış</dt>
      <dd className="text-right">
        <span ref={rollRef} className="gm-num text-sm text-signal">
          +0.0°
        </span>
      </dd>
      <dt className="text-muted">Hız</dt>
      <dd className="text-right">
        <span ref={speedRef} className="gm-num text-sm text-brass">
          0.0 m/s
        </span>
      </dd>
    </dl>
  );
});
