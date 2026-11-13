'use client';

import type { RefObject } from 'react';
import { cx } from '@/components/ui/primitives';
import { resolveGimbalDotClasses } from '@/utils/gimbalPadUtils';

interface GimbalTouchSurfaceProps {
  gimbalPadRef: RefObject<HTMLDivElement | null>;
  gimbalDotRef: RefObject<HTMLDivElement | null>;
  playerSlot: 1 | 2;
  onPointerDown: (e: React.PointerEvent<HTMLDivElement>) => void;
  onPointerMove: (e: React.PointerEvent<HTMLDivElement>) => void;
  onPointerEnd: (e: React.PointerEvent<HTMLDivElement>) => void;
}

/**
 * 2B Sanal Ufuk ve dokunmatik eğim tablası dairesi.
 */
export function GimbalTouchSurface({
  gimbalPadRef,
  gimbalDotRef,
  playerSlot,
  onPointerDown,
  onPointerMove,
  onPointerEnd,
}: GimbalTouchSurfaceProps) {
  const { dotOuterClass, dotInnerClass } = resolveGimbalDotClasses(playerSlot);

  return (
    <div
      ref={gimbalPadRef}
      role="application"
      aria-label="Dokunmatik sanal eğim tablası; parmağını sürükleyerek bilyeyi yönlendirebilirsin"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerEnd}
      onPointerCancel={onPointerEnd}
      onLostPointerCapture={onPointerEnd}
      className="relative flex h-60 w-60 touch-none items-center justify-center rounded-full border-2 border-line bg-surface shadow-inner"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute h-40 w-40 rounded-full border border-dashed border-line"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute h-20 w-20 rounded-full border border-line"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute h-px w-full bg-line/70"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute h-full w-px bg-line/70"
      />

      <div
        ref={gimbalDotRef}
        className={cx(
          'pointer-events-none relative flex h-11 w-11 items-center justify-center rounded-full border will-change-transform',
          dotOuterClass,
        )}
      >
        <div className={cx('h-3.5 w-3.5 rounded-full', dotInnerClass)} />
      </div>
    </div>
  );
}

