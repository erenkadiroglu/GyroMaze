'use client';

import { useQuickControls } from '@/hooks/useQuickControls';
import { ViewportAudioControls } from './ViewportAudioControls';
import { ToolsControls } from './ToolsControls';

export interface QuickControlsToolbarProps {
  onResetClick: () => void;
}

/**
 * Masaüstü HUD sağ alt hızlı eylemler araç çubuğu:
 * Görünüm/kamera/ses kontrolleri ile harita editörü ve skor tablosu butonlarını koordine eder.
 */
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
    toolbarAriaLabel,
    toolbarClass,
    separatorClass,
  } = useQuickControls();

  return (
    <div
      role="toolbar"
      aria-label={toolbarAriaLabel}
      className={toolbarClass}
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
        className={separatorClass}
      />

      <ToolsControls
        onOpenEditor={openEditor}
        onOpenLeaderboard={openLeaderboard}
      />
    </div>
  );
}

