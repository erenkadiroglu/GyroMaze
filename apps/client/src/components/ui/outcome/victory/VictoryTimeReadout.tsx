'use client';

import { Sparkles } from 'lucide-react';
import { formatRecordTime } from '@/utils/leaderboardUtils';

interface VictoryTimeReadoutProps {
  elapsedSeconds: number;
  isPB: boolean;
  goalMessage: string;
}

/**
 * Zafer modalında tamamlanma süresi, PB rozeti ve hedef mesajı
 */
export function VictoryTimeReadout({
  elapsedSeconds,
  isPB,
  goalMessage,
}: VictoryTimeReadoutProps) {
  return (
    <div className="mt-3.5 flex flex-col items-center justify-center gap-1">
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted">Süre:</span>
        <strong className="gm-num text-xl font-bold text-ok">
          {formatRecordTime(elapsedSeconds)}
        </strong>
        {isPB && (
          <span className="flex items-center gap-1 rounded-md border border-brass/40 bg-brass/15 px-1.5 py-0.5 text-[10px] font-semibold text-brass">
            <Sparkles className="h-2.5 w-2.5" aria-hidden="true" />
            <span>Yeni Rekor!</span>
          </span>
        )}
      </div>

      <p className="text-xs text-muted leading-relaxed">{goalMessage}</p>
    </div>
  );
}
