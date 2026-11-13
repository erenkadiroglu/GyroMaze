'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { IconButton } from '@/components/ui/primitives';
import { calculateLevelWindow } from '@/utils/leaderboardUtils';
import {
  resolvePrevLevelTarget,
  resolveNextLevelTarget,
} from '@/utils/leaderboardSelectorUtils';
import {
  LeaderboardAllLevelsTab,
  LeaderboardLevelTabsGrid,
  LeaderboardRefreshButton,
} from './selector';

export interface LeaderboardLevelSelectorProps {
  selectedLevel: number | 'all';
  onSelectLevel: (level: number | 'all') => void;
  activeLevelNumber: number;
  isRefreshing: boolean;
  onRefresh: () => void;
}

/**
 * Liderlik tablosu tümü/bölüm filtre sekmeleri, sayfalama okları ve yenileme butonu orkestratörü.
 */
export function LeaderboardLevelSelector({
  selectedLevel,
  onSelectLevel,
  activeLevelNumber,
  isRefreshing,
  onRefresh,
}: LeaderboardLevelSelectorProps) {
  const levelWindow = calculateLevelWindow(activeLevelNumber, 5);

  return (
    <div className="flex items-center gap-1.5 rounded-2xl border border-line bg-surface-2/70 p-1.5">
      {/* Tümü Sekmesi */}
      <LeaderboardAllLevelsTab
        isSelected={selectedLevel === 'all'}
        onSelect={() => onSelectLevel('all')}
      />

      <div className="h-4 w-px bg-line/80" aria-hidden="true" />

      {/* Önceki Bölüm Oku */}
      <IconButton
        size="sm"
        label="Önceki bölüm skorları"
        onClick={() => onSelectLevel(resolvePrevLevelTarget(activeLevelNumber))}
      >
        <ChevronLeft className="h-4 w-4" aria-hidden="true" />
      </IconButton>

      {/* 5'li Seviye Sekmeleri Gridi */}
      <LeaderboardLevelTabsGrid
        levelWindow={levelWindow}
        selectedLevel={selectedLevel}
        onSelectLevel={onSelectLevel}
      />

      {/* Sonraki Bölüm Oku */}
      <IconButton
        size="sm"
        label="Sonraki bölüm skorları"
        onClick={() => onSelectLevel(resolveNextLevelTarget(activeLevelNumber))}
      >
        <ChevronRight className="h-4 w-4" aria-hidden="true" />
      </IconButton>

      <div className="h-4 w-px bg-line/80" aria-hidden="true" />

      {/* Yenile Butonu */}
      <LeaderboardRefreshButton
        isRefreshing={isRefreshing}
        onRefresh={onRefresh}
      />
    </div>
  );
}
