'use client';

import { Volume2, VolumeX } from 'lucide-react';
import { IconButton } from '../../primitives';
import {
  getViewportSoundShortcut,
  getViewportSoundIconConfig,
} from '@/utils/viewportAudioUtils';

interface ViewportSoundButtonProps {
  isSoundMuted: boolean;
  soundLabel: string;
  onToggleSound: () => void;
}

export function ViewportSoundButton({
  isSoundMuted,
  soundLabel,
  onToggleSound,
}: ViewportSoundButtonProps) {
  const shortcut = getViewportSoundShortcut();
  const { iconClassName } = getViewportSoundIconConfig(isSoundMuted);

  return (
    <IconButton
      label={soundLabel}
      shortcut={shortcut}
      pressed={isSoundMuted}
      onClick={onToggleSound}
    >
      {isSoundMuted ? (
        <VolumeX className={iconClassName} aria-hidden="true" />
      ) : (
        <Volume2 className={iconClassName} aria-hidden="true" />
      )}
    </IconButton>
  );
}

