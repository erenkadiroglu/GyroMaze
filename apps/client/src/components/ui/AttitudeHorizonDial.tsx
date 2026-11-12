'use client';

import { forwardRef } from 'react';

/**
 * Havacılık yapay ufuk (attitude horizon) kadranı bileşeni.
 * 60 FPS doğrudan DOM transformasyonu için ref alarak React yeniden render'ı tetiklemez.
 */
export const AttitudeHorizonDial = forwardRef<HTMLDivElement>(
  function AttitudeHorizonDial(_props, ref) {
    return (
      <div
        className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full border border-line bg-surface-2 shadow-inner"
        title="Yapay Ufuk — Tabla eğim açısı"
      >
        {/* Hareketli gökyüzü / zemin ufuk diski */}
        <div
          ref={ref}
          className="pointer-events-none absolute -inset-6 flex flex-col will-change-transform"
        >
          <div className="flex-1 bg-signal/14" />
          <div className="h-[1.5px] w-full bg-signal shadow-[0_0_8px_var(--gm-signal)]" />
          <div className="flex-1 bg-base/55" />
        </div>

        {/* Sabit kadran kertikleri */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-1.5 rounded-full border border-dashed border-line/70"
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute top-0.5 h-1.5 w-[1.5px] bg-brass"
        />

        {/* Merkez nişangah */}
        <div
          aria-hidden="true"
          className="pointer-events-none relative z-10 flex items-center gap-1"
        >
          <span className="h-[1.5px] w-2 bg-brass" />
          <span className="h-2 w-2 rounded-full border border-brass bg-surface" />
          <span className="h-[1.5px] w-2 bg-brass" />
        </div>
      </div>
    );
  },
);

