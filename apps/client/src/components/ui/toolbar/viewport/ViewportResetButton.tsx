'use client';

import { RotateCcw } from 'lucide-react';
import { IconButton } from '../../primitives';
import { getViewportResetConfig } from '@/utils/viewportAudioUtils';

interface ViewportResetButtonProps {
  onResetClick: () => void;
}

export function ViewportResetButton({ onResetClick }: ViewportResetButtonProps) {
  const { label, shortcut } = getViewportResetConfig();

  return (
    <IconButton
      label={label}
      shortcut={shortcut}
      onClick={onResetClick}
    >
      <RotateCcw className="h-4 w-4" aria-hidden="true" />
    </IconButton>
  );
}

