'use client';

import { Layers } from 'lucide-react';
import { cx } from '@/components/ui/primitives';
import { resolveTabActiveClasses } from '@/utils/leaderboardSelectorUtils';

export interface LeaderboardAllLevelsTabProps {
  isSelected: boolean;
  onSelect: () => void;
}

/**
 * Liderlik tablosunda tüm bölümlerin filtrelenmesini sağlayan genel sekme butonu.
 */
export function LeaderboardAllLevelsTab({
  isSelected,
  onSelect,
}: LeaderboardAllLevelsTabProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cx(
        'flex h-8 cursor-pointer items-center gap-1.5 rounded-xl px-2.5 text-xs font-semibold transition-colors',
        resolveTabActiveClasses(isSelected),
      )}
      aria-label={isSelected ? 'Tüm bölümler, seçili' : 'Tüm bölümler'}
    >
      <Layers className="h-3.5 w-3.5" aria-hidden="true" />
      <span>Tümü</span>
    </button>
  );
}

