'use client';

import { Gem, Lock, Unlock, Timer, Trophy, Users } from 'lucide-react';
import { cx } from '@/components/ui/primitives';

export interface HeaderStatusReadoutsProps {
  portalTooltip: string;
  ratioText: string;
  isPortalUnlocked: boolean;
  isTimeAttack: boolean;
  timerColorClass: string;
  visibleTimerText: string;
  currentBestTime?: number;
  isMultiplayer: boolean;
  multiplayerTooltip: string;
}

/**
 * Masaüstü HUD sağ kapsülü içindeki oyun durumu okuma göstergeleri:
 * - Kristal toplama oranı ve portal açılma kilidi
 * - Aktif oyun süresi (veya süreye karşı geri sayım) ve bölüm rekoru
 * - Çok oyunculu mod aktiflik rozeti
 */
export function HeaderStatusReadouts({
  portalTooltip,
  ratioText,
  isPortalUnlocked,
  isTimeAttack,
  timerColorClass,
  visibleTimerText,
  currentBestTime,
  isMultiplayer,
  multiplayerTooltip,
}: HeaderStatusReadoutsProps) {
  return (
    <>
      {/* Kristal ve Portal Durumu */}
      <div
        className="flex items-center gap-1.5 px-1 text-sm"
        title={portalTooltip}
      >
        <Gem className="h-3.5 w-3.5 text-signal" aria-hidden="true" />
        <span className="gm-num font-semibold text-fg">{ratioText}</span>
        {isPortalUnlocked ? (
          <Unlock className="h-3.5 w-3.5 text-ok" aria-label="Portal açık" />
        ) : (
          <Lock className="h-3.5 w-3.5 text-muted" aria-label="Portal kilitli" />
        )}
      </div>

      <span className="h-4 w-px bg-line" aria-hidden="true" />

      {/* Süre (veya Süreye Karşı geri sayım) */}
      <div className="flex items-center gap-1.5 px-1 text-sm">
        {isTimeAttack && (
          <Timer
            className={cx('h-3.5 w-3.5', timerColorClass)}
            aria-label="Geri sayım"
          />
        )}
        <span className={cx('gm-num font-semibold', timerColorClass)}>
          {visibleTimerText}
        </span>
        {currentBestTime !== undefined && !isTimeAttack && (
          <span
            className="gm-num hidden items-center gap-1 text-xs text-brass sm:inline-flex"
            title="Bölüm rekorun"
          >
            <Trophy className="h-3 w-3" aria-hidden="true" />
            {currentBestTime.toFixed(1)}
          </span>
        )}
      </div>

      {/* Çok Oyunculu Rozeti */}
      {isMultiplayer && (
        <>
          <span className="h-4 w-px bg-line" aria-hidden="true" />
          <span
            className="inline-flex items-center gap-1 rounded-lg bg-brass/15 px-2 py-0.5 text-xs font-medium text-brass"
            title={multiplayerTooltip}
          >
            <Users className="h-3 w-3" aria-hidden="true" />
            2 Oyuncu
          </span>
        </>
      )}
    </>
  );
}

