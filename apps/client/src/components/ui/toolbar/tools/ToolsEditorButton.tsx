'use client';

import { Wrench } from 'lucide-react';
import { IconButton } from '../../primitives';
import { getEditorButtonConfig } from '@/utils/toolsControlsUtils';

interface ToolsEditorButtonProps {
  onOpenEditor: () => void;
}

export function ToolsEditorButton({ onOpenEditor }: ToolsEditorButtonProps) {
  const { label, shortcut } = getEditorButtonConfig();

  return (
    <IconButton
      label={label}
      shortcut={shortcut}
      onClick={onOpenEditor}
    >
      <Wrench className="h-4 w-4" aria-hidden="true" />
    </IconButton>
  );
}

