'use client';

import { Trophy, Medal } from 'lucide-react';
import { cx } from '@/components/ui/primitives';
import { resolveRankAriaDescription } from '@/utils/leaderboardListUtils';

export interface LeaderboardRankBadgeProps {
  rankIndex: number;
  badgeClass: string;
  medalType?: 'gold' | 'silver' | 'bronze';
}

/**
 * Liderlik tablosu podyum madalyası veya sıra numarası göstergesi rozeti.
 */
export function LeaderboardRankBadge({
  rankIndex,
  badgeClass,
  medalType,
}: LeaderboardRankBadgeProps) {
  const ariaLabel = resolveRankAriaDescription(rankIndex);

  return (
    <span
      className={cx(
        'gm-num flex h-7 w-7 items-center justify-center rounded-xl text-xs font-semibold',
        badgeClass,
      )}
      aria-label={ariaLabel}
      title={ariaLabel}
    >
      {medalType === 'gold' ? (
        <Trophy className="h-3.5 w-3.5" aria-hidden="true" />
      ) : medalType === 'silver' || medalType === 'bronze' ? (
        <Medal className="h-3.5 w-3.5" aria-hidden="true" />
      ) : (
        rankIndex + 1
      )}
    </span>
  );
}

