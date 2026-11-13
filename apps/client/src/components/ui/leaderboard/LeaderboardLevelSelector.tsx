'use client';

import { Layers, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import { IconButton, cx } from '@/components/ui/primitives';
import { calculateLevelWindow } from '@/utils/leaderboardUtils';

export interface LeaderboardLevelSelectorProps {
  selectedLevel: number | 'all';
  onSelectLevel: (level: number | 'all') => void;
  activeLevelNumber: number;
  isRefreshing: boolean;
  onRefresh: () => void;
}

/**
 * Liderlik tablosu tümü/bölüm filtre sekmeleri, sayfalama okları ve yenileme butonu.
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
      <button
        type="button"
        onClick={() => onSelectLevel('all')}
        className={cx(
          'flex h-8 cursor-pointer items-center gap-1.5 rounded-xl px-2.5 text-xs font-semibold transition-colors',
          selectedLevel === 'all'
            ? 'bg-brass text-brass-fg shadow-sm'
            : 'text-muted hover:text-fg',
        )}
      >
        <Layers className="h-3.5 w-3.5" aria-hidden="true" />
        <span>Tümü</span>
      </button>

      <div className="h-4 w-px bg-line/80" aria-hidden="true" />

      <IconButton
        size="sm"
        label="Önceki bölüm skorları"
        onClick={() => onSelectLevel(Math.max(1, activeLevelNumber - 1))}
      >
        <ChevronLeft className="h-4 w-4" aria-hidden="true" />
      </IconButton>

      <div className="grid flex-1 grid-cols-5 gap-1">
        {levelWindow.map((tabLvl) => {
          const active = selectedLevel === tabLvl;
          return (
            <button
              key={tabLvl}
              type="button"
              onClick={() => onSelectLevel(tabLvl)}
              className={cx(
                'gm-num h-8 cursor-pointer rounded-xl text-xs font-semibold transition-colors',
                active
                  ? 'bg-brass text-brass-fg shadow-sm'
                  : 'text-muted hover:text-fg',
              )}
            >
              {tabLvl < 10 ? `0${tabLvl}` : tabLvl}
            </button>
          );
        })}
      </div>

      <IconButton
        size="sm"
        label="Sonraki bölüm skorları"
        onClick={() => onSelectLevel(activeLevelNumber + 1)}
      >
        <ChevronRight className="h-4 w-4" aria-hidden="true" />
      </IconButton>

      <div className="h-4 w-px bg-line/80" aria-hidden="true" />

      <IconButton
        size="sm"
        label={isRefreshing ? 'Yenileniyor...' : 'Skorları yenile'}
        onClick={onRefresh}
        disabled={isRefreshing}
      >
        <RefreshCw
          className={cx(
            'h-3.5 w-3.5 transition-transform',
            isRefreshing && 'animate-spin text-brass',
          )}
          aria-hidden="true"
        />
      </IconButton>
    </div>
  );
}

