'use client';

import { ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import { IconButton, cx } from '@/components/ui/primitives';

export interface LevelSelectTriggerProps {
  isOpen: boolean;
  onToggle: () => void;
  onPrevLevel: () => void;
  onNextLevel: () => void;
  prevDisabled: boolean;
  shortLevelTag: string;
  cleanTitle: string;
  subtitle?: string;
  completed: boolean;
  stars: number;
}

/**
 * Masaüstü HUD üst çubuğu bölüm seçici tetikleyicisi:
 * - Önceki bölüm oku
 * - Aktif bölüm etiketi, adı, yıldızları ve açılır chevron butonu
 * - Sonraki bölüm oku
 */
export function LevelSelectTrigger({
  isOpen,
  onToggle,
  onPrevLevel,
  onNextLevel,
  prevDisabled,
  shortLevelTag,
  cleanTitle,
  subtitle,
  completed,
  stars,
}: LevelSelectTriggerProps) {
  return (
    <>
      <IconButton
        size="sm"
        label="Önceki bölüm"
        onClick={onPrevLevel}
        disabled={prevDisabled}
      >
        <ChevronLeft className="h-4 w-4" aria-hidden="true" />
      </IconButton>

      <button
        type="button"
        aria-expanded={isOpen}
        aria-haspopup="menu"
        onClick={onToggle}
        className="flex h-8 cursor-pointer items-center gap-1.5 rounded-xl px-2.5 text-sm font-medium text-fg transition-colors hover:bg-surface-2"
        title={subtitle}
      >
        <span className="gm-num font-semibold text-brass">{shortLevelTag}</span>
        <span className="hidden max-w-[170px] truncate text-xs text-muted md:inline">
          {cleanTitle}
        </span>
        {completed && (
          <span className="hidden items-center gap-0.5 text-xs text-brass lg:inline-flex">
            {'★'.repeat(stars)}
          </span>
        )}
        <ChevronDown
          className={cx(
            'h-3.5 w-3.5 text-muted transition-transform',
            isOpen && 'rotate-180',
          )}
          aria-hidden="true"
        />
      </button>

      <IconButton
        size="sm"
        label="Sonraki bölüm"
        onClick={onNextLevel}
      >
        <ChevronRight className="h-4 w-4" aria-hidden="true" />
      </IconButton>
    </>
  );
}

