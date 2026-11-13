'use client';

import type { CameraMode } from '@gyromaze/shared';
import { FieldLabel, Segmented } from '../../primitives';
import { CAMERA_MODE_OPTIONS } from '@/utils/appearanceUtils';

interface AppearanceCameraModeSelectorProps {
  cameraMode: CameraMode;
  onSetCameraMode: (mode: CameraMode) => void;
}

/**
 * 3B kamera açısı (İzometrik, Üstten, Takip) seçici bileşeni.
 */
export function AppearanceCameraModeSelector({
  cameraMode,
  onSetCameraMode,
}: AppearanceCameraModeSelectorProps) {
  return (
    <div>
      <FieldLabel>Kamera açısı</FieldLabel>
      <Segmented<CameraMode>
        label="Kamera açısı"
        value={cameraMode}
        options={CAMERA_MODE_OPTIONS}
        onChange={onSetCameraMode}
      />
    </div>
  );
}
