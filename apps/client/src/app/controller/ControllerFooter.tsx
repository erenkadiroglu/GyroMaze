'use client';

import { useControllerFooter } from '@/hooks/useControllerFooter';
import { RecalibrateButton } from './footer/RecalibrateButton';
import { ResetBallButton } from './footer/ResetBallButton';

export interface ControllerFooterProps {
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
export function ControllerFooter(props: ControllerFooterProps) {
  const {
    containerProps,
    isVisible,
    isControllerPaired,
    isSocketConnected,
    onRecalibrate,
    onResetBall,
  } = useControllerFooter(props);

  if (!isVisible) {
    return <div {...containerProps} />;
  }

  return (
    <footer {...containerProps}>
      <RecalibrateButton onRecalibrate={onRecalibrate} />

      <ResetBallButton
        isControllerPaired={isControllerPaired}
        isSocketConnected={isSocketConnected}
        onResetBall={onResetBall}
      />
    </footer>
  );
}
