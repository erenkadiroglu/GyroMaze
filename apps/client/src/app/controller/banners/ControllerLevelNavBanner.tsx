'use client';

import { ChevronLeft, ChevronRight, Gem } from 'lucide-react';
import {
  formatControllerLevelLabel,
  formatCrystalRatio,
} from '@/utils/controllerUtils';
import { isPrevLevelDisabled } from '@/utils/controllerBannerUtils';

interface ControllerLevelNavBannerProps {
  level: number;
  remoteCrystalsCollected: number;
  remoteCrystalsTotal: number;
  onChangeLevel: (direction: 'next' | 'prev') => void;
}

/**
 * Mobil kontrolcü eşleştiğinde bölüm numarası, kristal toplama oranı ve Önceki/Sonraki gezinme butonları.
 */
export function ControllerLevelNavBanner({
  level,
  remoteCrystalsCollected,
  remoteCrystalsTotal,
  onChangeLevel,
}: ControllerLevelNavBannerProps) {
  const levelLabel = formatControllerLevelLabel(level);
  const crystalRatio = formatCrystalRatio(
    remoteCrystalsCollected,
    remoteCrystalsTotal,
  );
  const prevDisabled = isPrevLevelDisabled(level);

  return (
    <div className="mt-2.5 flex items-center justify-between rounded-2xl border border-line bg-surface px-2.5 py-2">
      <button
        type="button"
        disabled={prevDisabled}
        onClick={() => onChangeLevel('prev')}
        className="flex min-h-[40px] cursor-pointer items-center gap-1 rounded-xl border border-line bg-surface-2 px-3 text-xs font-medium text-fg active:scale-95 disabled:pointer-events-none disabled:opacity-40"
      >
        <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        <span>Önceki</span>
      </button>

      <div className="flex items-center gap-2.5 text-sm">
        <span className="gm-num font-semibold text-brass">{levelLabel}</span>
        <span className="text-line" aria-hidden="true">
          ·
        </span>
        <span className="gm-num flex items-center gap-1 font-semibold text-signal">
          <Gem className="h-3.5 w-3.5" aria-hidden="true" />
          {crystalRatio}
        </span>
      </div>

      <button
        type="button"
        onClick={() => onChangeLevel('next')}
        className="flex min-h-[40px] cursor-pointer items-center gap-1 rounded-xl border border-line bg-surface-2 px-3 text-xs font-medium text-fg active:scale-95"
      >
        <span>Sonraki</span>
        <ChevronRight className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  );
}
