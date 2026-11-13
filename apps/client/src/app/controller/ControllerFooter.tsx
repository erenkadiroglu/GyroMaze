'use client';

import { RecalibrateButton } from './footer/RecalibrateButton';
import { ResetBallButton } from './footer/ResetBallButton';

interface ControllerFooterProps {
  showGimbalSurface: boolean;
  isControllerPaired: boolean;
  isSocketConnected: boolean;
  onRecalibrate: () => void;
  onResetBall: () => void;
}

/**
 * Mobil kontrolcü alt araç çubuğu: sol tarafta merkez kalibrasyon butonu,
 * sağ tarafta bilye sıfırlama butonu.
 */
export function ControllerFooter({
  showGimbalSurface,
  isControllerPaired,
  isSocketConnected,
  onRecalibrate,
  onResetBall,
}: ControllerFooterProps) {
  if (!showGimbalSurface) {
    return <div className="h-2" aria-hidden="true" />;
  }

  return (
    <footer className="grid grid-cols-2 gap-2.5">
      <RecalibrateButton onRecalibrate={onRecalibrate} />

      <ResetBallButton
        isControllerPaired={isControllerPaired}
        isSocketConnected={isSocketConnected}
        onResetBall={onResetBall}
      />
    </footer>
  );
}
