'use client';

import { getPauseRecoveryMessage } from '@/utils/overlayBarUtils';

export function PauseRecoveryMessage() {
  const message = getPauseRecoveryMessage();

  return (
    <span className="font-medium text-warn">
      {message}
    </span>
  );
}

