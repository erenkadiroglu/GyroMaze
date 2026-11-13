'use client';

import { AnimatePresence } from 'framer-motion';
import { useLevelSelect } from '@/hooks/useLevelSelect';
import { LevelSelectTrigger } from './levelselect/LevelSelectTrigger';
import { LevelSelectMenu } from './levelselect/LevelSelectMenu';

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
    <div ref={popoverRef} className="relative flex items-center">
      {/* Üst Çubuk Tetikleyici ve Bölüm Değiştirme Okları */}
      <LevelSelectTrigger
        isOpen={isOpen}
        onToggle={toggleOpen}
        onPrevLevel={handlePrevLevel}
        onNextLevel={handleNextLevel}
        prevDisabled={activeNumericLevel <= 1 && level !== 99}
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
