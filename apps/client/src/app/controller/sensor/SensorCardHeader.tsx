'use client';

import { ShieldCheck } from 'lucide-react';

export function SensorCardHeader() {
  return (
    <>
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-brass/30 bg-brass/10 text-brass">
        <ShieldCheck className="h-6 w-6" aria-hidden="true" />
      </div>
      <div className="space-y-1.5">
        <h2 className="text-lg font-semibold">Jiroskop sensörlerini başlat</h2>
        <p className="text-xs leading-relaxed text-muted">
          Telefonunu rahat bir açıyla tut ve sıfır gecikmeli hareket kontrolünü etkinleştir.
        </p>
      </div>
    </>
  );
}

