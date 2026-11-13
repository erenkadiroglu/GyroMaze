'use client';

import { resolveHudNotificationTone } from '@/utils/hudUtils';
import { cx } from '../../primitives';

interface ToastContentProps {
  message: string;
  tone?: 'warn' | 'info' | 'success';
}

export function ToastContent({ message, tone }: ToastContentProps) {
  const toneClasses = resolveHudNotificationTone(tone);

  return (
    <div
      className={cx(
        'rounded-2xl border bg-surface/95 px-4 py-2 text-sm font-medium shadow-xl backdrop-blur-md',
        toneClasses.borderClass,
        toneClasses.textClass,
      )}
    >
      {message}
    </div>
  );
}

