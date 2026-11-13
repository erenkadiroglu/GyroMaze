'use client';

import { Trophy, Medal, Clock } from 'lucide-react';
import type { LeaderboardEntry } from '@gyromaze/shared';
import { cx } from '@/components/ui/primitives';
import {
  formatRecordTime,
  formatRecordDate,
  resolveRankBadgeStyle,
  formatLevelBadge,
  resolveEmptyLeaderboardMessage,
} from '@/utils/leaderboardUtils';

export interface LeaderboardListProps {
  entries: LeaderboardEntry[];
  selectedLevel: number | 'all';
  searchQuery: string;
}

/**
 * Liderlik tablosu sıralı skor kayıtları listesi ve boş arama/bölüm durumu kartı.
 */
export function LeaderboardList({
  entries,
  selectedLevel,
  searchQuery,
}: LeaderboardListProps) {
  if (entries.length === 0) {
    const emptyInfo = resolveEmptyLeaderboardMessage(
      selectedLevel,
      searchQuery,
    );
    return (
      <div className="rounded-2xl border border-line bg-surface-2/40 py-10 text-center text-xs text-muted">
        {emptyInfo.title && (
          <p className="font-medium text-fg">{emptyInfo.title}</p>
        )}
        <p className={emptyInfo.title ? 'mt-1 text-[11px]' : ''}>
          {emptyInfo.message}
        </p>
      </div>
    );
  }

  return (
    <div className="gm-scroll max-h-80 space-y-2 overflow-y-auto pr-0.5">
      {entries.map((item, idx) => {
        const rankStyle = resolveRankBadgeStyle(idx);
        const isFirst = idx === 0;

        return (
          <div
            key={item.id}
            className={cx(
              'flex items-center justify-between rounded-2xl border px-3.5 py-2.5 transition-colors',
              rankStyle.rowClass,
            )}
          >
            <div className="flex items-center gap-3">
              <span
                className={cx(
                  'gm-num flex h-7 w-7 items-center justify-center rounded-xl text-xs font-semibold',
                  rankStyle.badgeClass,
                )}
              >
                {rankStyle.medalType === 'gold' ? (
                  <Trophy className="h-3.5 w-3.5" aria-hidden="true" />
                ) : rankStyle.medalType === 'silver' ||
                  rankStyle.medalType === 'bronze' ? (
                  <Medal className="h-3.5 w-3.5" aria-hidden="true" />
                ) : (
                  idx + 1
                )}
              </span>

              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-fg">
                    {item.playerName}
                  </span>
                  {selectedLevel === 'all' && (
                    <span className="gm-num rounded-md border border-line bg-surface px-1.5 py-0.5 text-[10px] font-semibold text-brass">
                      {formatLevelBadge(item.levelId)}
                    </span>
                  )}
                </div>

                {item.createdAt > 0 && (
                  <span className="flex items-center gap-1 text-[10px] text-muted">
                    <Clock className="h-2.5 w-2.5" aria-hidden="true" />
                    <span>{formatRecordDate(item.createdAt)}</span>
                  </span>
                )}
              </div>
            </div>

            <div className="text-right">
              <span
                className={cx(
                  'gm-num text-sm font-semibold',
                  isFirst ? 'text-brass' : 'text-ok',
                )}
              >
                {formatRecordTime(item.timeSeconds)}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

