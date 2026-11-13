'use client';

import { Trophy, RotateCcw, ArrowRight } from 'lucide-react';
import type { MazeLevelDefinition } from '@/components/scene/mazeLevels';
import { Modal, Button } from '@/components/ui/primitives';
import { VictoryWinnerBadge } from './victory/VictoryWinnerBadge';
import { VictoryStarsRow } from './victory/VictoryStarsRow';
import { VictoryTimeReadout } from './victory/VictoryTimeReadout';
import { VictoryScoreSubmitForm } from './victory/VictoryScoreSubmitForm';

export interface VictoryModalProps {
  open: boolean;
  currentLevelInfo: MazeLevelDefinition;
  elapsedSeconds: number;
  earnedStars: 1 | 2 | 3;
  isPB: boolean;
  goalMessage: string;
  isMultiplayer: boolean;
  winnerPlayer: 1 | 2 | null;
  winnerText: string;
  playerName: string;
  scoreSubmitted: boolean;
  onPlayerNameChange: (name: string) => void;
  onScoreSubmit: (e: React.FormEvent) => void;
  onReset: () => void;
  onNextLevel: () => void;
}

/**
 * Bölüm başarıyla tamamlandığında açılan zafer modali:
 * - 3 üzerinden kazanılan yıldız animasyonu
 * - Süre, kişisel rekor (PB) rozeti ve motive edici hedef mesajı
 * - Çok oyunculu 1P/2P kazanan bildirimi
 * - Küresel liderlik tablosu skor gönderme formu
 * - Tekrar dene ve sonraki bölüm yönlendirme aksiyonları
 */
export function VictoryModal({
  open,
  currentLevelInfo,
  elapsedSeconds,
  earnedStars,
  isPB,
  goalMessage,
  isMultiplayer,
  winnerPlayer,
  winnerText,
  playerName,
  scoreSubmitted,
  onPlayerNameChange,
  onScoreSubmit,
  onReset,
  onNextLevel,
}: VictoryModalProps) {
  return (
    <Modal
      open={open}
      onClose={onReset}
      hideClose
      size="md"
      title={`${currentLevelInfo.title} tamamlandı`}
      icon={<Trophy className="h-5 w-5 text-brass" aria-hidden="true" />}
      footer={
        <>
          <Button
            variant="secondary"
            icon={<RotateCcw className="h-4 w-4" aria-hidden="true" />}
            onClick={onReset}
          >
            Tekrar oyna
          </Button>
          <Button
            variant="primary"
            icon={<ArrowRight className="h-4 w-4" aria-hidden="true" />}
            onClick={onNextLevel}
          >
            Sonraki bölüm
          </Button>
        </>
      }
    >
      <div className="text-center">
        {/* Çok Oyunculu Kazanan Rozeti */}
        <VictoryWinnerBadge
          isMultiplayer={isMultiplayer}
          winnerPlayer={winnerPlayer}
          winnerText={winnerText}
        />

        {/* Yıldız Gösterimi */}
        <VictoryStarsRow earnedStars={earnedStars} />

        {/* Süre ve PB Rozeti */}
        <VictoryTimeReadout
          elapsedSeconds={elapsedSeconds}
          isPB={isPB}
          goalMessage={goalMessage}
        />

        {/* Liderlik Tablosu Skor Gönderim Formu */}
        <VictoryScoreSubmitForm
          levelId={currentLevelInfo.id}
          playerName={playerName}
          scoreSubmitted={scoreSubmitted}
          onPlayerNameChange={onPlayerNameChange}
          onScoreSubmit={onScoreSubmit}
        />
      </div>
    </Modal>
  );
}
