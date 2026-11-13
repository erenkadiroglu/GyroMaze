'use client';

import type {
  BallSkin,
  BoardTheme,
  CameraMode,
  ColorScheme,
} from '@gyromaze/shared';
import { SettingsSection } from '../primitives';
import { AppearanceColorSchemeSelector } from './appearance/AppearanceColorSchemeSelector';
import { AppearanceBoardThemeSelector } from './appearance/AppearanceBoardThemeSelector';
import { AppearanceCameraModeSelector } from './appearance/AppearanceCameraModeSelector';
import { AppearanceBallSkinSelector } from './appearance/AppearanceBallSkinSelector';

interface SettingsAppearanceSectionProps {
  colorScheme: ColorScheme;
  onSetColorScheme: (scheme: ColorScheme) => void;
  boardTheme: BoardTheme;
  onSetBoardTheme: (theme: BoardTheme) => void;
  cameraMode: CameraMode;
  onSetCameraMode: (mode: CameraMode) => void;
  ballSkin: BallSkin;
  onSetBallSkin: (skin: BallSkin) => void;
}

/**
 * Ayarlar çekmecesi görünüm, sahne atmosferi, kamera açısı ve bilye kaplaması bölümü.
 */
export function SettingsAppearanceSection({
  colorScheme,
  onSetColorScheme,
  boardTheme,
  onSetBoardTheme,
  cameraMode,
  onSetCameraMode,
  ballSkin,
  onSetBallSkin,
}: SettingsAppearanceSectionProps) {
  return (
    <SettingsSection title="Görünüm ve sahne">
      <AppearanceColorSchemeSelector
        colorScheme={colorScheme}
        onSetColorScheme={onSetColorScheme}
      />

      <AppearanceBoardThemeSelector
        boardTheme={boardTheme}
        onSetBoardTheme={onSetBoardTheme}
      />

      <AppearanceCameraModeSelector
        cameraMode={cameraMode}
        onSetCameraMode={onSetCameraMode}
      />

      <AppearanceBallSkinSelector
        ballSkin={ballSkin}
        onSetBallSkin={onSetBallSkin}
      />
    </SettingsSection>
  );
}
