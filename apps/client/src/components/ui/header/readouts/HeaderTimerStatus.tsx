'use client';

import { Timer, Trophy } from 'lucide-react';
import { cx } from '@/components/ui/primitives';
import {
  formatRecordBadgeText,
  resolveTimerStatusTitle,
} from '@/utils/headerReadoutUtils';

interface HeaderTimerStatusProps {
  isTimeAttack: boolean;
  timerColorClass: string;
  visibleTimerText: string;
  currentBestTime?: number;
}

/**
 * Masaüstü HUD üst çubuğu oyun süresi (veya süreye karşı geri sayım) ve bölüm rekoru göstergesi.
 */
export function HeaderTimerStatus({
  isTimeAttack,
  timerColorClass,
  visibleTimerText,
  currentBestTime,
}: HeaderTimerStatusProps) {
  const containerTitle = resolveTimerStatusTitle(isTimeAttack, currentBestTime);

  return (
    <div
      className="flex items-center gap-1.5 px-1 text-sm"
      title={containerTitle}
    >
      {isTimeAttack && (
        <Timer
          className={cx('h-3.5 w-3.5', timerColorClass)}
          aria-label="Geri sayım"
        />
      )}
      <span className={cx('gm-num font-semibold', timerColorClass)}>
        {visibleTimerText}
      </span>
      {currentBestTime !== undefined && !isTimeAttack && (
        <span
          className="gm-num hidden items-center gap-1 text-xs text-brass sm:inline-flex"
          title="Bölüm rekorun"
        >
          <Trophy className="h-3 w-3" aria-hidden="true" />
          {formatRecordBadgeText(currentBestTime)}
        </span>
      )}
    </div>
  );
}
