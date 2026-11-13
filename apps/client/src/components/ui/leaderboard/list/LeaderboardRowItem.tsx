'use client';

import { Clock } from 'lucide-react';
import type { LeaderboardEntry } from '@gyromaze/shared';
import { cx } from '@/components/ui/primitives';
import {
  formatRecordTime,
  formatRecordDate,
  resolveRankBadgeStyle,
  formatLevelBadge,
} from '@/utils/leaderboardUtils';
import {
  resolveScoreTimeColorClass,
  shouldShowLevelBadge,
  shouldShowRecordDate,
  formatRowAriaLabel,
} from '@/utils/leaderboardListUtils';
import { LeaderboardRankBadge } from './LeaderboardRankBadge';

export interface LeaderboardRowItemProps {
  item: LeaderboardEntry;
  idx: number;
  selectedLevel: number | 'all';
}

/**
 * Liderlik tablosunda tekil bir oyuncu derecesini, seviyesini ve süresini temsil eden kart satırı.
 */
export function LeaderboardRowItem({
  item,
  idx,
  selectedLevel,
}: LeaderboardRowItemProps) {
  const rankStyle = resolveRankBadgeStyle(idx);
  const isFirst = idx === 0;
  const timeFormatted = formatRecordTime(item.timeSeconds);
  const showLevel = shouldShowLevelBadge(selectedLevel);
  const showDate = shouldShowRecordDate(item.createdAt);
  const levelBadgeText = showLevel ? formatLevelBadge(item.levelId) : undefined;
  const rowAriaLabel = formatRowAriaLabel(
    idx,
    item.playerName,
    timeFormatted,
    levelBadgeText,
  );

  return (
    <div
      role="listitem"
      aria-label={rowAriaLabel}
      className={cx(
        'flex items-center justify-between rounded-2xl border px-3.5 py-2.5 transition-colors',
        rankStyle.rowClass,
      )}
    >
      <div className="flex items-center gap-3">
        {/* Podyum Madalyası veya Sıra Rozeti */}
        <LeaderboardRankBadge
          rankIndex={idx}
          badgeClass={rankStyle.badgeClass}
          medalType={rankStyle.medalType}
        />

        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-fg">
              {item.playerName}
            </span>
            {showLevel && (
              <span className="gm-num rounded-md border border-line bg-surface px-1.5 py-0.5 text-[10px] font-semibold text-brass">
                {levelBadgeText}
              </span>
            )}
          </div>

          {showDate && (
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
            resolveScoreTimeColorClass(isFirst),
          )}
        >
          {timeFormatted}
        </span>
      </div>
    </div>
  );
}

