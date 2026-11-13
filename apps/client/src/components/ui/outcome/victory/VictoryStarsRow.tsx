'use client';

import { Star } from 'lucide-react';
import { cx } from '@/components/ui/primitives';
import { formatOutcomeStarAriaLabel } from '@/utils/gameOutcomeUtils';
import { isStarFilled } from '@/utils/victoryModalUtils';

interface VictoryStarsRowProps {
  earnedStars: 1 | 2 | 3;
}

/**
 * Zafer modalında kazanılan yıldızları gösteren satır
 */
export function VictoryStarsRow({ earnedStars }: VictoryStarsRowProps) {
  return (
    <div
      className="mt-1 flex items-center justify-center gap-2"
      aria-label={formatOutcomeStarAriaLabel(earnedStars)}
    >
      {[1, 2, 3].map((starIdx) => {
        const filled = isStarFilled(starIdx, earnedStars);
        return (
          <Star
            key={starIdx}
            className={cx(
              'h-8 w-8 transition-transform duration-300',
              filled
                ? 'fill-brass text-brass drop-shadow-sm scale-105'
                : 'text-line opacity-40',
            )}
          />
        );
      })}
    </div>
  );
}

