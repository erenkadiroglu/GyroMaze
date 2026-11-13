'use client';

import type { ColorScheme } from '@/utils/quickControlsUtils';
import {
  ViewportResetButton,
  ViewportCameraButton,
  ViewportThemeButton,
  ViewportSoundButton,
} from './viewport';

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
      <ViewportResetButton onResetClick={onResetClick} />

      <ViewportCameraButton
        label={cameraLabel}
        onCycleCamera={onCycleCamera}
      />

      <ViewportThemeButton
        colorScheme={colorScheme}
        themeLabel={themeLabel}
        onToggleColorScheme={onToggleColorScheme}
      />

      <ViewportSoundButton
        isSoundMuted={isSoundMuted}
        soundLabel={soundLabel}
        onToggleSound={onToggleSound}
      />
    </div>
  );
}
