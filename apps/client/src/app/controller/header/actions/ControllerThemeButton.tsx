'use client';

import { Sun, Moon } from 'lucide-react';
import { resolveThemeButtonLabel } from '@/utils/controllerHeaderUtils';

interface ControllerThemeButtonProps {
  colorScheme: 'dark' | 'light';
  onToggleColorScheme: () => void;
}

/**
 * Mobil kontrolcü tema geçiş butonu (Gündüz / Gece).
 */
export function ControllerThemeButton({
  colorScheme,
  onToggleColorScheme,
}: ControllerThemeButtonProps) {
  const label = resolveThemeButtonLabel(colorScheme);

  return (
    <button
      type="button"
      onClick={onToggleColorScheme}
      aria-label={label}
      className="flex min-h-[40px] min-w-[40px] cursor-pointer items-center justify-center rounded-xl border border-line bg-surface-2 active:scale-95"
    >
      {colorScheme === 'light' ? (
        <Sun className="h-4 w-4 text-brass" aria-hidden="true" />
      ) : (
        <Moon className="h-4 w-4 text-signal" aria-hidden="true" />
      )}
    </button>
  );
}
