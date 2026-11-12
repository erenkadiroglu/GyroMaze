'use client';

import { ShieldCheck, Hand } from 'lucide-react';

interface ControllerSensorCardProps {
  isInsecureContext: boolean;
  onActivateSensors: () => void;
  onEnableTouchMode: () => void;
}

export function ControllerSensorCard({
  isInsecureContext,
  onActivateSensors,
  onEnableTouchMode,
}: ControllerSensorCardProps) {
  return (
    <div className="w-full max-w-sm space-y-4 rounded-3xl border border-line bg-surface p-6 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-brass/30 bg-brass/10 text-brass">
        <ShieldCheck className="h-6 w-6" aria-hidden="true" />
      </div>
      <div className="space-y-1.5">
        <h2 className="text-lg font-semibold">Jiroskop sensörlerini başlat</h2>
        <p className="text-xs leading-relaxed text-muted">
          Telefonunu rahat bir açıyla tut ve sıfır gecikmeli hareket kontrolünü etkinleştir.
        </p>
      </div>

      {isInsecureContext && (
        <p
          role="note"
          className="rounded-2xl border border-warn/30 bg-warn/10 px-3 py-2 text-left text-[11px] leading-relaxed text-warn"
        >
          Bu sayfa HTTP üzerinden açıldığı için mobil tarayıcı jiroskop
          sensörlerini kısıtlayabilir. Sensör yanıt vermezse aşağıdaki{' '}
          <strong className="font-semibold">Dokunmatik gimbal ile oyna</strong> seçeneğini kullan.
        </p>
      )}

      <button
        type="button"
        onClick={onActivateSensors}
        className="min-h-[48px] w-full cursor-pointer rounded-2xl bg-brass text-sm font-semibold text-brass-fg active:scale-[0.98]"
      >
        Sensörleri başlat
      </button>

      <button
        type="button"
        onClick={onEnableTouchMode}
        className="flex min-h-[44px] w-full cursor-pointer items-center justify-center gap-2 rounded-2xl border border-line bg-surface-2 text-xs font-medium text-fg active:scale-[0.98]"
      >
        <Hand className="h-4 w-4 text-signal" aria-hidden="true" />
        <span>Dokunmatik gimbal ile oyna</span>
      </button>
    </div>
  );
}

