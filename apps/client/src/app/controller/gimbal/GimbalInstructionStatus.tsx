'use client';

import {
  resolveGimbalInstructionText,
  shouldShowPairingStatus,
  shouldShowSensorTimeoutStatus,
} from '@/utils/gimbalPadUtils';

interface GimbalInstructionStatusProps {
  controllerTouchOverride: boolean;
  isControllerPaired: boolean;
  errorMessage: string | null;
  sensorSignalTimedOut: boolean;
  hasSensorSignal: boolean;
}

/**
 * Gimbal pad altındaki yönlendirme metni ve eşleşme/sensör zaman aşımı durum etiketleri.
 */
export function GimbalInstructionStatus({
  controllerTouchOverride,
  isControllerPaired,
  errorMessage,
  sensorSignalTimedOut,
  hasSensorSignal,
}: GimbalInstructionStatusProps) {
  const instructionText = resolveGimbalInstructionText(controllerTouchOverride);
  const showPairing = shouldShowPairingStatus(isControllerPaired, errorMessage);
  const showTimeout = shouldShowSensorTimeoutStatus(
    sensorSignalTimedOut,
    controllerTouchOverride,
    hasSensorSignal,
  );

  return (
    <>
      <p className="mt-2.5 text-center text-xs text-muted">
        {instructionText}
      </p>

      {showPairing && (
        <p
          role="status"
          className="mt-1.5 rounded-xl border border-brass/30 bg-brass/10 px-3 py-1.5 text-center text-[11px] text-brass"
        >
          Masaüstü eşleşmesi bekleniyor — oda kodunu kontrol et
        </p>
      )}

      {showTimeout && (
        <p
          role="status"
          className="mt-1.5 rounded-xl border border-warn/30 bg-warn/10 px-3 py-1.5 text-center text-[11px] text-warn"
        >
          Donanım sensör sinyali alınamadı — daireyi parmağınla sürükleyebilirsin
        </p>
      )}
    </>
  );
}

