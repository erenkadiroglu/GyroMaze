'use client';

import { resolveEmptyLeaderboardMessage } from '@/utils/leaderboardUtils';

export interface LeaderboardEmptyStateProps {
  selectedLevel: number | 'all';
  searchQuery: string;
}

/**
 * Liderlik tablosunda arama veya bölüm filtresine uygun kayıt bulunamadığında gösterilen boş durum kartı.
 */
export function LeaderboardEmptyState({
  selectedLevel,
  searchQuery,
}: LeaderboardEmptyStateProps) {
  const emptyInfo = resolveEmptyLeaderboardMessage(selectedLevel, searchQuery);

  return (
    <div
      className="rounded-2xl border border-line bg-surface-2/40 py-10 text-center text-xs text-muted"
      role="status"
      aria-live="polite"
    >
      {emptyInfo.title && (
        <p className="font-medium text-fg">{emptyInfo.title}</p>
      )}
      <p className={emptyInfo.title ? 'mt-1 text-[11px]' : ''}>
        {emptyInfo.message}
      </p>
    </div>
  );
}

