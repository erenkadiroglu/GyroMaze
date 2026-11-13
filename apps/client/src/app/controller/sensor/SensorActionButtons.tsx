'use client';

import { Hand } from 'lucide-react';
import { resolveSensorActionAriaLabels } from '@/utils/sensorCardUtils';

interface SensorActionButtonsProps {
  onActivateSensors: () => void;
  onEnableTouchMode: () => void;
}

export function SensorActionButtons({
  onActivateSensors,
  onEnableTouchMode,
}: SensorActionButtonsProps) {
  const { activateSensorsLabel, touchModeLabel } = resolveSensorActionAriaLabels();

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={onActivateSensors}
        aria-label={activateSensorsLabel}
        className="min-h-[48px] w-full cursor-pointer rounded-2xl bg-brass text-sm font-semibold text-brass-fg transition-all active:scale-[0.98]"
      >
        Sensörleri başlat
      </button>

      <button
        type="button"
        onClick={onEnableTouchMode}
        aria-label={touchModeLabel}
        className="flex min-h-[44px] w-full cursor-pointer items-center justify-center gap-2 rounded-2xl border border-line bg-surface-2 text-xs font-medium text-fg transition-all active:scale-[0.98]"
      >
        <Hand className="h-4 w-4 text-signal" aria-hidden="true" />
        <span>Dokunmatik gimbal ile oyna</span>
      </button>
    </div>
  );
}

