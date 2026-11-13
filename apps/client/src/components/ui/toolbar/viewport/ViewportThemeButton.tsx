'use client';

import { Sun, Moon } from 'lucide-react';
import type { ColorScheme } from '@/utils/quickControlsUtils';
import { IconButton } from '../../primitives';
import {
  isLightTheme,
  getViewportThemeShortcut,
} from '@/utils/viewportAudioUtils';

interface ViewportThemeButtonProps {
  colorScheme: ColorScheme;
  themeLabel: string;
  onToggleColorScheme: () => void;
}

export function ViewportThemeButton({
  colorScheme,
  themeLabel,
  onToggleColorScheme,
}: ViewportThemeButtonProps) {
  const isLight = isLightTheme(colorScheme);
  const shortcut = getViewportThemeShortcut();

  return (
    <IconButton
      label={themeLabel}
      shortcut={shortcut}
      pressed={isLight}
      onClick={onToggleColorScheme}
    >
      {isLight ? (
        <Sun className="h-4 w-4" aria-hidden="true" />
      ) : (
        <Moon className="h-4 w-4" aria-hidden="true" />
      )}
    </IconButton>
  );
}

