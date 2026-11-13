'use client';

import { Medal } from 'lucide-react';
import { IconButton } from '../../primitives';
import { getLeaderboardButtonConfig } from '@/utils/toolsControlsUtils';

interface ToolsLeaderboardButtonProps {
  onOpenLeaderboard: () => void;
}

export function ToolsLeaderboardButton({
  onOpenLeaderboard,
}: ToolsLeaderboardButtonProps) {
  const { label, shortcut } = getLeaderboardButtonConfig();

  return (
    <IconButton
      label={label}
      shortcut={shortcut}
      onClick={onOpenLeaderboard}
    >
      <Medal className="h-4 w-4" aria-hidden="true" />
    </IconButton>
  );
}

