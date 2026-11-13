'use client';

import { getToolsGroupAriaLabel } from '@/utils/toolsControlsUtils';
import { ToolsEditorButton, ToolsLeaderboardButton } from './tools';

interface ToolsControlsProps {
  onOpenEditor: () => void;
  onOpenLeaderboard: () => void;
}

export function ToolsControls({
  onOpenEditor,
  onOpenLeaderboard,
}: ToolsControlsProps) {
  const groupAriaLabel = getToolsGroupAriaLabel();

  return (
    <div role="group" aria-label={groupAriaLabel} className="flex items-center gap-0.5">
      <ToolsEditorButton onOpenEditor={onOpenEditor} />
      <ToolsLeaderboardButton onOpenLeaderboard={onOpenLeaderboard} />
    </div>
  );
}
