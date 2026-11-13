'use client';

import { SensorCardHeader } from './sensor/SensorCardHeader';
import { InsecureContextWarning } from './sensor/InsecureContextWarning';
import { SensorActionButtons } from './sensor/SensorActionButtons';

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
      <SensorCardHeader />

      <InsecureContextWarning isInsecureContext={isInsecureContext} />

      <SensorActionButtons
        onActivateSensors={onActivateSensors}
        onEnableTouchMode={onEnableTouchMode}
      />
    </div>
  );
}
