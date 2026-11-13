'use client';

import type { LeaderboardEntry } from '@gyromaze/shared';
import { LeaderboardEmptyState, LeaderboardRowItem } from './list';

export interface LeaderboardListProps {
  entries: LeaderboardEntry[];
  selectedLevel: number | 'all';
  searchQuery: string;
}

/**
 * Liderlik tablosu sıralı skor kayıtları listesi ve boş arama/bölüm durumu kartı orkestratörü.
 */
export function LeaderboardList({
  entries,
  selectedLevel,
  searchQuery,
}: LeaderboardListProps) {
  if (entries.length === 0) {
    return (
      <LeaderboardEmptyState
        selectedLevel={selectedLevel}
        searchQuery={searchQuery}
      />
    );
  }

  return (
    <div
      role="list"
      aria-label="Skor listesi"
      className="gm-scroll max-h-80 space-y-2 overflow-y-auto pr-0.5"
    >
      {entries.map((item, idx) => (
        <LeaderboardRowItem
          key={item.id}
          item={item}
          idx={idx}
          selectedLevel={selectedLevel}
        />
      ))}
    </div>
  );
}
