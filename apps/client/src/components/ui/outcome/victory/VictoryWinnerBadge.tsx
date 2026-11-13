'use client';

import { Users } from 'lucide-react';
import { shouldShowMultiplayerWinner } from '@/utils/victoryModalUtils';

interface VictoryWinnerBadgeProps {
  isMultiplayer: boolean;
  winnerPlayer: 1 | 2 | null;
  winnerText: string;
}

/**
 * Çok oyunculu zafer durumunda kazanan oyuncuyu gösteren rozet
 */
export function VictoryWinnerBadge({
  isMultiplayer,
  winnerPlayer,
  winnerText,
}: VictoryWinnerBadgeProps) {
  if (!shouldShowMultiplayerWinner(isMultiplayer, winnerPlayer)) {
    return null;
  }

  return (
    <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-brass/40 bg-brass/15 px-3 py-1 text-xs font-semibold text-brass">
      <Users className="h-3.5 w-3.5" aria-hidden="true" />
      <span>{winnerText}</span>
    </div>
  );
}
