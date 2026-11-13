'use client';

import { motion } from 'framer-motion';
import type { MazeLevelDefinition } from '@/components/scene/mazeLevels';
import type { CampaignProgressSummary } from '@/utils/levelProgressUtils';
import { LevelSelectCampaignSummary } from './LevelSelectCampaignSummary';
import { LevelSelectStandardGrid } from './LevelSelectStandardGrid';
import { LevelSelectActionList } from './LevelSelectActionList';

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
      <LevelSelectCampaignSummary campaignProgress={campaignProgress} />

      {/* 1..5 Bölüm Kartları */}
      <LevelSelectStandardGrid
        currentLevelId={currentLevelInfo.id}
        globalLevel={level}
        bestTimes={bestTimes}
        onSelectLevel={onSelectLevel}
      />

      {/* Prosedürel ve Özel Harita Seçenekleri */}
      <LevelSelectActionList
        level={level}
        shortLevelTag={shortLevelTag}
        customLevel={customLevel}
        onSelectLevel={onSelectLevel}
        onJumpProcedural={onJumpProcedural}
      />
    </motion.div>
  );
}
