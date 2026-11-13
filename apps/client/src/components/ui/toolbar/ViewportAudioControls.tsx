'use client';

import {
  RotateCcw,
  Camera,
  Sun,
  Moon,
  Volume2,
  VolumeX,
} from 'lucide-react';
import type { ColorScheme } from '@/utils/quickControlsUtils';
import { IconButton } from '../primitives';

interface ViewportAudioControlsProps {
  onResetClick: () => void;
  cameraLabel: string;
  onCycleCamera: () => void;
  colorScheme: ColorScheme;
  themeLabel: string;
  onToggleColorScheme: () => void;
  isSoundMuted: boolean;
  soundLabel: string;
  onToggleSound: () => void;
}

export function ViewportAudioControls({
  onResetClick,
  cameraLabel,
  onCycleCamera,
  colorScheme,
  themeLabel,
  onToggleColorScheme,
  isSoundMuted,
  soundLabel,
  onToggleSound,
}: ViewportAudioControlsProps) {
  return (
    <div role="group" aria-label="Görünüm ve ses" className="flex items-center gap-0.5">
      <IconButton
        label="Topu başa al"
        shortcut="R"
        onClick={onResetClick}
      >
        <RotateCcw className="h-4 w-4" aria-hidden="true" />
      </IconButton>

      <IconButton
        label={cameraLabel}
        shortcut="C"
        onClick={onCycleCamera}
      >
        <Camera className="h-4 w-4" aria-hidden="true" />
      </IconButton>

      <IconButton
        label={themeLabel}
        shortcut="L"
        pressed={colorScheme === 'light'}
        onClick={onToggleColorScheme}
      >
        {colorScheme === 'light' ? (
          <Sun className="h-4 w-4" aria-hidden="true" />
        ) : (
          <Moon className="h-4 w-4" aria-hidden="true" />
        )}
      </IconButton>

      <IconButton
        label={soundLabel}
        shortcut="M"
        pressed={isSoundMuted}
        onClick={onToggleSound}
      >
        {isSoundMuted ? (
          <VolumeX className="h-4 w-4 text-danger" aria-hidden="true" />
        ) : (
          <Volume2 className="h-4 w-4" aria-hidden="true" />
        )}
      </IconButton>
    </div>
  );
}
