'use client';

import { AnimatePresence } from 'framer-motion';
import { useLevelSelect } from '@/hooks/useLevelSelect';
import {
  getLevelSelectContainerAriaLabel,
  isPrevLevelDisabled,
} from '@/utils/levelSelectPopoverUtils';
import {
  LevelSelectTrigger,
  LevelSelectMenu,
} from './levelselect';

/**
 * Masaüstü HUD üst çubuğunda yer alan, 5 standart bölümün yıldız ilerlemesini,
 * kişisel rekorlarını ve prosedürel/özel harita geçişlerini sunan modüler popover.
 */
export function LevelSelectPopover() {
  const {
    isOpen,
    toggleOpen,
    popoverRef,
    level,
    customLevel,
    currentLevelInfo,
    activeNumericLevel,
    shortLevelTag,
    cleanTitle,
    currentProgress,
    campaignProgress,
    bestTimes,
    handleJumpProceduralLevel,
    handleSelectLevel,
    handlePrevLevel,
    handleNextLevel,
  } = useLevelSelect();

  return (
    <div
      ref={popoverRef}
      className="relative flex items-center"
      role="region"
      aria-label={getLevelSelectContainerAriaLabel()}
    >
      {/* Üst Çubuk Tetikleyici ve Bölüm Değiştirme Okları */}
      <LevelSelectTrigger
        isOpen={isOpen}
        onToggle={toggleOpen}
        onPrevLevel={handlePrevLevel}
        onNextLevel={handleNextLevel}
        prevDisabled={isPrevLevelDisabled(activeNumericLevel, level)}
        shortLevelTag={shortLevelTag}
        cleanTitle={cleanTitle}
        subtitle={currentLevelInfo.subtitle}
        completed={currentProgress.completed}
        stars={currentProgress.stars}
      />

      {/* Açılır Bölüm Seçici Menüsü */}
      <AnimatePresence>
        {isOpen && (
          <LevelSelectMenu
            currentLevelInfo={currentLevelInfo}
            level={level}
            bestTimes={bestTimes}
            campaignProgress={campaignProgress}
            shortLevelTag={shortLevelTag}
            customLevel={customLevel}
            onSelectLevel={handleSelectLevel}
            onJumpProcedural={handleJumpProceduralLevel}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
