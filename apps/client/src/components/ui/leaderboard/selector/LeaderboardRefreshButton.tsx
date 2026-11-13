'use client';

import { RefreshCw } from 'lucide-react';
import { IconButton, cx } from '@/components/ui/primitives';
import { getLeaderboardRefreshLabel } from '@/utils/leaderboardSelectorUtils';

export interface LeaderboardRefreshButtonProps {
  isRefreshing: boolean;
  onRefresh: () => void;
}

/**
 * Liderlik tablosu kayıtlarını yeniden sunucudan çeken durum animasyonlu yenileme butonu.
 */
export function LeaderboardRefreshButton({
  isRefreshing,
  onRefresh,
}: LeaderboardRefreshButtonProps) {
  const label = getLeaderboardRefreshLabel(isRefreshing);

  return (
    <IconButton
      size="sm"
      label={label}
      onClick={onRefresh}
      disabled={isRefreshing}
    >
      <RefreshCw
        className={cx(
          'h-3.5 w-3.5 transition-transform',
          isRefreshing && 'animate-spin text-brass',
        )}
        aria-hidden="true"
      />
    </IconButton>
  );
}

