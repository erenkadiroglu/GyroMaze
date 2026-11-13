'use client';

import { useGameOutcome } from '@/hooks/useGameOutcome';
import { CelebrationCanvas } from './CelebrationCanvas';
import { VictoryModal, DefeatModal } from './outcome';

/**
 * Bölüm tamamlandığında (zafer) veya süre dolduğunda (yenilgi)
 * açılan sonuç modallarını koordine eden orkestratör bileşen.
 */
export function GameOutcomeModals() {
  const {
    gameStatus,
    currentLevelInfo,
    elapsedSeconds,
    timeAttackLimit,
    isPB,
    earnedStars,
    goalMessage,
    isCelebration,
    playerName,
    setPlayerName,
    scoreSubmitted,
    isMultiplayer,
    winnerPlayer,
    winnerText,
    crystalSummary,
    handleReset,
    handleSwitchMode,
    handleScoreSubmit,
    nextLevel,
  } = useGameOutcome();

  return (
    <>
      {/* 3 YILDIZ VEYA PB ZAFER KONFETİSİ */}
      <CelebrationCanvas active={isCelebration} />

      {/* ZAFER MODALI */}
      <VictoryModal
        open={gameStatus === 'won'}
        currentLevelInfo={currentLevelInfo}
        elapsedSeconds={elapsedSeconds}
        earnedStars={earnedStars}
        isPB={isPB}
        goalMessage={goalMessage}
        isMultiplayer={isMultiplayer}
        winnerPlayer={winnerPlayer}
        winnerText={winnerText}
        playerName={playerName}
        scoreSubmitted={scoreSubmitted}
        onPlayerNameChange={setPlayerName}
        onScoreSubmit={handleScoreSubmit}
        onReset={handleReset}
        onNextLevel={nextLevel}
      />

      {/* SÜRE DOLDU MODALI (Süreye Karşı Modu) */}
      <DefeatModal
        open={gameStatus === 'lost'}
        timeAttackLimit={timeAttackLimit}
        crystalSummary={crystalSummary}
        onSwitchMode={handleSwitchMode}
        onReset={handleReset}
      />
    </>
  );
}
