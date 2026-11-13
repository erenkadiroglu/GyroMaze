'use client';

import { Activity } from 'lucide-react';
import { cx } from '@/components/ui/primitives';
import {
  resolveHapticButtonLabel,
  resolveHapticButtonClass,
} from '@/utils/controllerHeaderUtils';

interface ControllerHapticButtonProps {
  isHapticEnabled: boolean;
  onToggleHaptic: () => void;
}

/**
 * Mobil kontrolcü haptik titreşim açma/kapama eylem butonu.
 */
export function ControllerHapticButton({
  isHapticEnabled,
  onToggleHaptic,
}: ControllerHapticButtonProps) {
  const hapticLabels = resolveHapticButtonLabel(isHapticEnabled);
  const statusClass = resolveHapticButtonClass(isHapticEnabled);

  return (
    <button
      type="button"
      onClick={onToggleHaptic}
      aria-label={hapticLabels.ariaLabel}
      title={hapticLabels.title}
      className={cx(
        'flex min-h-[40px] min-w-[40px] cursor-pointer items-center justify-center rounded-xl border border-line bg-surface-2 active:scale-95',
        statusClass,
      )}
    >
      <Activity className="h-4 w-4" aria-hidden="true" />
    </button>
  );
}
