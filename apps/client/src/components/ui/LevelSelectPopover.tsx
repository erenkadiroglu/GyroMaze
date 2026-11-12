'use client';

import { useState, useRef, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Sparkles,
  Star,
  Trophy,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/useGameStore';
import { getMazeLevel } from '@/components/scene/mazeLevels';
import {
  calculateCampaignProgress,
  getLevelProgress,
  STANDARD_LEVEL_THRESHOLDS,
} from '@/utils/levelProgressUtils';
import { soundEngine } from '@/utils/soundEngine';
import { IconButton, cx } from './primitives';

/**
 * Masaüstü HUD üst çubuğunda yer alan, 5 standart bölümün yıldız ilerlemesini,
 * kişisel rekorlarını ve prosedürel/özel harita geçişlerini sunan modüler popover.
 */
export function LevelSelectPopover() {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement | null>(null);

  const level = useGameStore((s) => s.level);
  const setLevel = useGameStore((s) => s.setLevel);
  const prevLevel = useGameStore((s) => s.prevLevel);
  const nextLevel = useGameStore((s) => s.nextLevel);
  const bestTimes = useGameStore((s) => s.bestTimes);
  const customLevel = useGameStore((s) => s.customLevel);
  const showHudNotification = useGameStore((s) => s.showHudNotification);
  const isSoundMuted = useGameStore((s) => s.isSoundMuted);

  const currentLevelInfo = getMazeLevel(level, customLevel);
  const activeNumericLevel = level === 99 ? 1 : Math.max(1, level);

  const shortLevelTag =
    level === 99
      ? 'Özel'
      : `Bölüm ${currentLevelInfo.id < 10 ? `0${currentLevelInfo.id}` : currentLevelInfo.id}`;

  const currentProgress = getLevelProgress(
    currentLevelInfo.id,
    bestTimes,
    currentLevelInfo.starThresholds,
  );

  const campaignProgress = calculateCampaignProgress(
    bestTimes,
    STANDARD_LEVEL_THRESHOLDS,
    5,
  );

  // Menü dışına tıklanınca veya Esc basılınca kapat
  useEffect(() => {
    if (!isOpen) return;
    const onMouseDown = (e: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [isOpen]);

  const handleJumpProceduralLevel = () => {
    const nextProc = level < 6 || level === 99 ? 6 : level + 1;
    setLevel(nextProc);
    setIsOpen(false);
    if (!isSoundMuted) soundEngine.playCalibrate();
    showHudNotification(
      `Prosedürel Bölüm ${nextProc < 10 ? `0${nextProc}` : nextProc} oluşturuldu`,
      'info',
    );
  };

  const handleSelectLevel = (targetLevel: number) => {
    setLevel(targetLevel);
    setIsOpen(false);
    if (!isSoundMuted) soundEngine.playUIClick();
  };

  return (
    <div ref={popoverRef} className="relative flex items-center">
      <IconButton
        size="sm"
        label="Önceki bölüm"
        onClick={() => {
          prevLevel();
          if (!isSoundMuted) soundEngine.playUIClick();
        }}
        disabled={activeNumericLevel <= 1 && level !== 99}
      >
        <ChevronLeft className="h-4 w-4" aria-hidden="true" />
      </IconButton>

      <button
        type="button"
        aria-expanded={isOpen}
        aria-haspopup="menu"
        onClick={() => {
          setIsOpen((v) => !v);
          if (!isSoundMuted) soundEngine.playUIClick();
        }}
        className="flex h-8 cursor-pointer items-center gap-1.5 rounded-xl px-2.5 text-sm font-medium text-fg transition-colors hover:bg-surface-2"
        title={currentLevelInfo.subtitle}
      >
        <span className="gm-num font-semibold text-brass">{shortLevelTag}</span>
        <span className="hidden max-w-[170px] truncate text-xs text-muted md:inline">
          {currentLevelInfo.title.replace(/^Bölüm \d+\s*[—-]\s*/, '')}
        </span>
        {currentProgress.completed && (
          <span className="hidden items-center gap-0.5 text-xs text-brass lg:inline-flex">
            {'★'.repeat(currentProgress.stars)}
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
        onClick={() => {
          nextLevel();
          if (!isSoundMuted) soundEngine.playUIClick();
        }}
      >
        <ChevronRight className="h-4 w-4" aria-hidden="true" />
      </IconButton>

      {/* Açılır Bölüm Seçici Menüsü */}
      <AnimatePresence>
        {isOpen && (
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
              <span className="text-xs font-semibold text-fg">
                Standart bölümler
              </span>
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
                    onClick={() => handleSelectLevel(id)}
                    aria-label={`Bölüm 0${id}: ${progress.completed ? `${progress.stars} yıldız, en iyi ${progress.bestTime?.toFixed(1)} saniye` : 'oynanmadı'}`}
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
                onClick={handleJumpProceduralLevel}
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
                  onClick={() => handleSelectLevel(99)}
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
        )}
      </AnimatePresence>
    </div>
  );
}

