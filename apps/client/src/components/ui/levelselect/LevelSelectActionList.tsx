'use client';

import { Sparkles } from 'lucide-react';
import type { MazeLevelDefinition } from '@/components/scene/mazeLevels';
import { cx } from '@/components/ui/primitives';
import {
  isProceduralActive,
  formatProceduralBadgeText,
} from '@/utils/levelMenuUtils';

interface LevelSelectActionListProps {
  level: number;
  shortLevelTag: string;
  customLevel: MazeLevelDefinition | null;
  onSelectLevel: (levelId: number) => void;
  onJumpProcedural: () => void;
}

/**
 * Sonsuz prosedürel bölüm ve özel harita aksiyon butonları
 */
export function LevelSelectActionList({
  level,
  shortLevelTag,
  customLevel,
  onSelectLevel,
  onJumpProcedural,
}: LevelSelectActionListProps) {
  const proceduralActive = isProceduralActive(level);
  const proceduralBadge = formatProceduralBadgeText(level, shortLevelTag);

  return (
    <div className="mt-3 border-t border-line pt-2.5 space-y-1.5">
      <button
        type="button"
        role="menuitem"
        onClick={onJumpProcedural}
        className={cx(
          'flex w-full cursor-pointer items-center justify-between rounded-xl border px-3 py-2 text-xs font-medium transition-colors',
          proceduralActive
            ? 'border-brass bg-brass/15 text-brass'
            : 'border-line bg-surface-2/70 text-fg hover:border-brass/60',
        )}
      >
        <span className="flex items-center gap-2">
          <Sparkles className="h-3.5 w-3.5 text-brass" aria-hidden="true" />
          Sonsuz prosedürel bölüm üret
        </span>
        <span
          className={cx(
            'gm-num font-mono text-[11px]',
            proceduralActive ? 'text-brass font-semibold' : 'text-muted',
          )}
        >
          {proceduralBadge}
        </span>
      </button>

      {customLevel && (
        <button
          type="button"
          role="menuitem"
          onClick={() => onSelectLevel(99)}
          className={cx(
            'flex w-full cursor-pointer items-center justify-between rounded-xl border px-3 py-2 text-xs font-medium transition-colors',
            level === 99
              ? 'border-brass bg-brass/15 text-brass'
              : 'border-line bg-surface-2/70 text-fg hover:border-muted/60',
          )}
        >
          <span className="truncate">{customLevel.title}</span>
          <span className="text-[11px] text-muted">Özel</span>
        </button>
      )}
    </div>
  );
}
