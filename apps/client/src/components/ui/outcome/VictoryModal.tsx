'use client';

import {
  Trophy,
  RotateCcw,
  ArrowRight,
  Star,
  Users,
  Send,
  Check,
  Sparkles,
} from 'lucide-react';
import type { MazeLevelDefinition } from '@/components/scene/mazeLevels';
import { Modal, Button, cx } from '@/components/ui/primitives';
import { formatRecordTime } from '@/utils/leaderboardUtils';
import { formatOutcomeStarAriaLabel } from '@/utils/gameOutcomeUtils';

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
        {isMultiplayer && winnerPlayer && (
          <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-brass/40 bg-brass/15 px-3 py-1 text-xs font-semibold text-brass">
            <Users className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{winnerText}</span>
          </div>
        )}

        {/* Yıldız Gösterimi */}
        <div
          className="mt-1 flex items-center justify-center gap-2"
          aria-label={formatOutcomeStarAriaLabel(earnedStars)}
        >
          {[1, 2, 3].map((starIdx) => (
            <Star
              key={starIdx}
              className={cx(
                'h-8 w-8 transition-transform duration-300',
                starIdx <= earnedStars
                  ? 'fill-brass text-brass drop-shadow-sm scale-105'
                  : 'text-line opacity-40',
              )}
            />
          ))}
        </div>

        {/* Süre ve PB Rozeti */}
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

        {/* Liderlik Tablosu Skor Gönderim Formu */}
        {currentLevelInfo.id !== 99 && (
          <form
            onSubmit={onScoreSubmit}
            className="mt-5 flex gap-2 rounded-2xl border border-line bg-surface-2/60 p-1.5"
          >
            <input
              type="text"
              maxLength={24}
              value={playerName}
              onChange={(e) => onPlayerNameChange(e.target.value)}
              disabled={scoreSubmitted}
              aria-label="Oyuncu adı"
              placeholder="Oyuncu adın"
              className="min-w-0 flex-1 bg-transparent px-3 text-xs font-medium text-fg placeholder:text-muted/60 outline-none disabled:text-muted"
            />
            <Button
              type="submit"
              variant={scoreSubmitted ? 'secondary' : 'primary'}
              size="sm"
              disabled={scoreSubmitted}
              icon={
                scoreSubmitted ? (
                  <Check className="h-3.5 w-3.5 text-ok" aria-hidden="true" />
                ) : (
                  <Send className="h-3.5 w-3.5" aria-hidden="true" />
                )
              }
            >
              {scoreSubmitted ? 'Kaydedildi' : 'Skoru kaydet'}
            </Button>
          </form>
        )}
      </div>
    </Modal>
  );
}

