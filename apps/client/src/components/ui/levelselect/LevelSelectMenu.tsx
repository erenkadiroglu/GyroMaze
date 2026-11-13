'use client';

import { Sparkles, Star, Trophy } from 'lucide-react';
import { motion } from 'framer-motion';
import type { MazeLevelDefinition } from '@/components/scene/mazeLevels';
import { cx } from '@/components/ui/primitives';
import {
  getLevelProgress,
  resolveLevelItemAriaLabel,
  STANDARD_LEVEL_THRESHOLDS,
  type CampaignProgressSummary,
} from '@/utils/levelProgressUtils';

export interface LevelSelectMenuProps {
  currentLevelInfo: MazeLevelDefinition;
  level: number;
  bestTimes: Record<number, number>;
  campaignProgress: CampaignProgressSummary;
  shortLevelTag: string;
  customLevel: MazeLevelDefinition | null;
  onSelectLevel: (levelId: number) => void;
  onJumpProcedural: () => void;
}

/**
 * Masaüstü HUD bölüm seçici açılır menü içeriği:
 * - Standart bölümler kampanya yıldız özeti (Usta Labirentçi rozeti)
 * - 1..5 standart bölüm kartları (numara, yıldızlar, rekor süresi)
 * - Sonsuz prosedürel bölüm üretme ve özel harita kısayol butonları
 */
export function LevelSelectMenu({
  currentLevelInfo,
  level,
  bestTimes,
  campaignProgress,
  shortLevelTag,
  customLevel,
  onSelectLevel,
  onJumpProcedural,
}: LevelSelectMenuProps) {
  return (
    <motion.div
      role="menu"
      aria-label="Bölüm listesi"
      initial={{ opacity: 0, y: 6, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 6, scale: 0.98 }}
      transition={{ duration: 0.14 }}
      className="absolute top-[calc(100%+8px)] left-0 z-40 w-80 rounded-2xl border border-line bg-surface p-3.5 shadow-2xl"
    >
      {/* Kampanya Yıldız Özeti */}
      <div className="mb-2.5 flex items-center justify-between border-b border-line pb-2.5 px-0.5">
        <span className="text-xs font-semibold text-fg">Standart bölümler</span>
        <div
          className={cx(
            'flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold',
            campaignProgress.isMaster
              ? 'border-brass/50 bg-brass/20 text-brass'
              : 'border-line bg-surface-2 text-muted',
          )}
          title={`${campaignProgress.completedCount}/5 bölüm tamamlandı (%${campaignProgress.percentage})`}
        >
          {campaignProgress.isMaster ? (
            <>
              <Trophy className="h-3 w-3 text-brass" aria-hidden="true" />
              <span>Usta Labirentçi (15/15)</span>
            </>
          ) : (
            <>
              <Star className="h-3 w-3 fill-brass text-brass" aria-hidden="true" />
              <span className="gm-num text-fg">
                {campaignProgress.totalStars}/{campaignProgress.maxStars}
              </span>
              <span>Yıldız</span>
            </>
          )}
        </div>
      </div>

      {/* 1..5 Bölüm Kartları */}
      <div className="grid grid-cols-5 gap-1.5">
        {[1, 2, 3, 4, 5].map((id) => {
          const active = currentLevelInfo.id === id && level !== 99;
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
                {progress.completed ? '★'.repeat(progress.stars) : '···'}
              </span>
              <span
                className={cx(
                  'gm-num text-[9px] mt-0.5',
                  active ? 'text-brass-fg/80' : 'text-muted',
                )}
              >
                {progress.completed && progress.bestTime !== undefined
                  ? `${progress.bestTime.toFixed(0)}s`
                  : '--'}
              </span>
            </button>
          );
        })}
      </div>

      {/* Prosedürel ve Özel Harita Seçenekleri */}
      <div className="mt-3 border-t border-line pt-2.5 space-y-1.5">
        <button
          type="button"
          role="menuitem"
          onClick={onJumpProcedural}
          className={cx(
            'flex w-full cursor-pointer items-center justify-between rounded-xl border px-3 py-2 text-xs font-medium transition-colors',
            level >= 6 && level !== 99
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
              level >= 6 && level !== 99
                ? 'text-brass font-semibold'
                : 'text-muted',
            )}
          >
            {level >= 6 && level !== 99 ? `${shortLevelTag} +1` : '06+'}
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
    </motion.div>
  );
}

