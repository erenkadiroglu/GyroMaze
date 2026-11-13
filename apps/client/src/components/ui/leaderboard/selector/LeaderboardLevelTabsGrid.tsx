'use client';

import { cx } from '@/components/ui/primitives';
import {
  formatLevelTabLabel,
  resolveLevelTabAriaLabel,
  resolveTabActiveClasses,
} from '@/utils/leaderboardSelectorUtils';

export interface LeaderboardLevelTabsGridProps {
  levelWindow: number[];
  selectedLevel: number | 'all';
  onSelectLevel: (level: number) => void;
}

/**
 * Liderlik tablosunda mevcut bölüm etrafındaki 5 seviyeyi listeleyen dinamik buton gridi.
 */
export function LeaderboardLevelTabsGrid({
  levelWindow,
  selectedLevel,
  onSelectLevel,
}: LeaderboardLevelTabsGridProps) {
  return (
    <div className="grid flex-1 grid-cols-5 gap-1" role="tablist" aria-label="Bölüm sekmeleri">
      {levelWindow.map((tabLvl) => {
        const active = selectedLevel === tabLvl;
        return (
          <button
            key={tabLvl}
            type="button"
            role="tab"
            aria-selected={active}
            aria-label={resolveLevelTabAriaLabel(tabLvl, active)}
            onClick={() => onSelectLevel(tabLvl)}
            className={cx(
              'gm-num h-8 cursor-pointer rounded-xl text-xs font-semibold transition-colors',
              resolveTabActiveClasses(active),
            )}
          >
            {formatLevelTabLabel(tabLvl)}
          </button>
        );
      })}
    </div>
  );
}

