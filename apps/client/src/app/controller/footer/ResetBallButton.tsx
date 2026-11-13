'use client';

import { RotateCcw } from 'lucide-react';
import {
  isResetBallDisabled,
  resolveResetBallAriaLabel,
} from '@/utils/controllerFooterUtils';

interface ResetBallButtonProps {
  isControllerPaired: boolean;
  isSocketConnected: boolean;
  onResetBall: () => void;
}

/**
 * 3B sahnedeki bilyeyi başlangıç noktasına döndüren sıfırlama butonu.
 */
export function ResetBallButton({
  isControllerPaired,
  isSocketConnected,
  onResetBall,
}: ResetBallButtonProps) {
  const disabled = isResetBallDisabled(isControllerPaired, isSocketConnected);
  const ariaLabel = resolveResetBallAriaLabel(disabled);

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onResetBall}
      aria-label={ariaLabel}
      className="flex min-h-[48px] cursor-pointer items-center justify-center gap-2 rounded-2xl border border-line bg-surface text-xs font-semibold text-fg active:scale-95 disabled:pointer-events-none disabled:opacity-45"
    >
      <RotateCcw className="h-4 w-4 text-muted" aria-hidden="true" />
      <span>Topu sıfırla</span>
    </button>
  );
}
