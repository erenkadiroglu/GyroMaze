'use client';

import { Trophy, Star } from 'lucide-react';
import { cx } from '@/components/ui/primitives';
import type { CampaignProgressSummary } from '@/utils/levelProgressUtils';

interface LevelSelectCampaignSummaryProps {
  campaignProgress: CampaignProgressSummary;
}

/**
 * Bölüm seçici menüsü kampanya yıldız özeti ve Usta Labirentçi rozeti
 */
export function LevelSelectCampaignSummary({
  campaignProgress,
}: LevelSelectCampaignSummaryProps) {
  return (
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
  );
}
