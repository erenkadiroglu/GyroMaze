'use client';

import { useQuickControls } from '@/hooks/useQuickControls';
import { ViewportAudioControls } from './toolbar/ViewportAudioControls';
import { ToolsControls } from './toolbar/ToolsControls';

interface QuickControlsToolbarProps {
  onResetClick: () => void;
}

export function QuickControlsToolbar({ onResetClick }: QuickControlsToolbarProps) {
  const {
    cameraLabel,
    cycleCameraMode,
    colorScheme,
    themeLabel,
    toggleColorScheme,
    isSoundMuted,
    soundLabel,
    toggleSoundMuted,
    openEditor,
    openLeaderboard,
  } = useQuickControls();

  return (
    <div
      role="toolbar"
      aria-label="Hızlı sahne kontrolleri"
      className="gm-panel pointer-events-auto flex items-center gap-1 rounded-2xl p-1.5 shadow-lg"
    >
      <ViewportAudioControls
        onResetClick={onResetClick}
        cameraLabel={cameraLabel}
        onCycleCamera={cycleCameraMode}
        colorScheme={colorScheme}
        themeLabel={themeLabel}
        onToggleColorScheme={toggleColorScheme}
        isSoundMuted={isSoundMuted}
        soundLabel={soundLabel}
        onToggleSound={toggleSoundMuted}
      />

      <span
        role="separator"
        aria-orientation="vertical"
        className="mx-1 h-5 w-px bg-line"
      />

      <ToolsControls
        onOpenEditor={openEditor}
        onOpenLeaderboard={openLeaderboard}
      />
    </div>
  );
}
