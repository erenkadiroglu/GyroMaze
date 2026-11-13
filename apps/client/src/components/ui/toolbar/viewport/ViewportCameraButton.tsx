'use client';

import { Camera } from 'lucide-react';
import { IconButton } from '../../primitives';
import { getViewportCameraShortcut } from '@/utils/viewportAudioUtils';

interface ViewportCameraButtonProps {
  label: string;
  onCycleCamera: () => void;
}

export function ViewportCameraButton({
  label,
  onCycleCamera,
}: ViewportCameraButtonProps) {
  const shortcut = getViewportCameraShortcut();

  return (
    <IconButton
      label={label}
      shortcut={shortcut}
      onClick={onCycleCamera}
    >
      <Camera className="h-4 w-4" aria-hidden="true" />
    </IconButton>
  );
}

