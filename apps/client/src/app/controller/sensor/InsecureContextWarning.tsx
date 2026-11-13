'use client';

import { shouldShowInsecureWarning } from '@/utils/sensorCardUtils';

interface InsecureContextWarningProps {
  isInsecureContext: boolean;
}

export function InsecureContextWarning({
  isInsecureContext,
}: InsecureContextWarningProps) {
  if (!shouldShowInsecureWarning(isInsecureContext)) return null;

  return (
    <p
      role="note"
      className="rounded-2xl border border-warn/30 bg-warn/10 px-3 py-2 text-left text-[11px] leading-relaxed text-warn"
    >
      Bu sayfa HTTP üzerinden açıldığı için mobil tarayıcı jiroskop
      sensörlerini kısıtlayabilir. Sensör yanıt vermezse aşağıdaki{' '}
      <strong className="font-semibold">Dokunmatik gimbal ile oyna</strong> seçeneğini kullan.
    </p>
  );
}

