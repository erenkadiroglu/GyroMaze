'use client';

import { cx } from '@/components/ui/primitives';
import {
  getLevelProgress,
  resolveLevelItemAriaLabel,
  STANDARD_LEVEL_THRESHOLDS,
} from '@/utils/levelProgressUtils';
import {
  isStandardLevelActive,
  formatLevelBestTimeText,
  formatLevelStarsText,
} from '@/utils/levelMenuUtils';

interface LevelSelectStandardGridProps {
  currentLevelId: number;
  globalLevel: number;
  bestTimes: Record<number, number>;
  onSelectLevel: (levelId: number) => void;
}

/**
 * 1..5 Standart bölüm seçim kartları ızgarası
 */
export function LevelSelectStandardGrid({
  currentLevelId,
  globalLevel,
  bestTimes,
  onSelectLevel,
}: LevelSelectStandardGridProps) {
  return (
    <div className="grid grid-cols-5 gap-1.5">
      {[1, 2, 3, 4, 5].map((id) => {
        const active = isStandardLevelActive(currentLevelId, id, globalLevel);
        const progress = getLevelProgress(
          id,
          bestTimes,
          STANDARD_LEVEL_THRESHOLDS[id],
        );

        return (
          <button
            key={id}
            type="button"
            role="menuitem"
            onClick={() => onSelectLevel(id)}
            aria-label={resolveLevelItemAriaLabel(id, progress)}
            className={cx(
              'flex flex-col items-center justify-center rounded-xl border py-1.5 transition-colors cursor-pointer',
              active
                ? 'border-brass bg-brass text-brass-fg ring-2 ring-brass/30'
                : 'border-line bg-surface-2/60 text-fg hover:border-brass/60',
            )}
          >
            <span className="gm-num text-xs font-bold">0{id}</span>
            <span
              className={cx(
                'text-[10px] tracking-tighter',
                active
                  ? 'text-brass-fg font-semibold'
                  : progress.stars > 0
                    ? 'text-brass'
                    : 'text-muted/40',
              )}
            >
              {formatLevelStarsText(progress.completed, progress.stars)}
            </span>
            <span
              className={cx(
                'gm-num text-[9px] mt-0.5',
                active ? 'text-brass-fg/80' : 'text-muted',
              )}
            >
              {formatLevelBestTimeText(progress.completed, progress.bestTime)}
            </span>
          </button>
        );
      })}
    </div>
  );
}
