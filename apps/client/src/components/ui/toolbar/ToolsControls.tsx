'use client';

import { Wrench, Medal } from 'lucide-react';
import { IconButton } from '../primitives';

interface ToolsControlsProps {
  onOpenEditor: () => void;
  onOpenLeaderboard: () => void;
}

export function ToolsControls({
  onOpenEditor,
  onOpenLeaderboard,
}: ToolsControlsProps) {
  return (
    <div role="group" aria-label="Araçlar" className="flex items-center gap-0.5">
      <IconButton
        label="Harita editörü"
        onClick={onOpenEditor}
      >
        <Wrench className="h-4 w-4" aria-hidden="true" />
      </IconButton>

      <IconButton
        label="Skor tablosu"
        onClick={onOpenLeaderboard}
      >
        <Medal className="h-4 w-4" aria-hidden="true" />
      </IconButton>
    </div>
  );
}
