'use client';

import { useState, useEffect } from 'react';
import {
  Trophy,
  RotateCcw,
  ArrowRight,
  Star,
  Users,
  Send,
  Check,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';
import { useGameStore } from '@/store/useGameStore';
import { getMazeLevel } from '@/components/scene/mazeLevels';
import { soundEngine } from '@/utils/soundEngine';
import {
  calculateEarnedStars,
  formatStarGoalMessage,
  isPersonalBest,
} from '@/utils/gameOutcomeUtils';
import { formatRecordTime } from '@/utils/leaderboardUtils';
import { Modal, Button, cx } from '@/components/ui/primitives';

/**
 * Bölüm tamamlandığında (zafer) veya süre dolduğunda (yenilgi)
 * açılan sonuç modalları.
 */
export function GameOutcomeModals() {
  const gameStatus = useGameStore((s) => s.gameStatus);
  const level = useGameStore((s) => s.level);
  const customLevel = useGameStore((s) => s.customLevel);
  const elapsedSeconds = useGameStore((s) => s.elapsedSeconds);
  const bestTimes = useGameStore((s) => s.bestTimes);
  const collectedCrystals = useGameStore((s) => s.collectedCrystals);
  const isMultiplayer = useGameStore((s) => s.isMultiplayer);
  const winnerPlayer = useGameStore((s) => s.winnerPlayer);
  const isSoundMuted = useGameStore((s) => s.isSoundMuted);
  const triggerBallReset = useGameStore((s) => s.triggerBallReset);
  const nextLevel = useGameStore((s) => s.nextLevel);
  const setSettingsOpen = useGameStore((s) => s.setSettingsOpen);
  const submitLeaderboardScore = useGameStore((s) => s.submitLeaderboardScore);

  const [playerName, setPlayerName] = useState('Oyuncu');
  const [scoreSubmitted, setScoreSubmitted] = useState(false);

  const currentLevelInfo = getMazeLevel(level, customLevel);
  const [threeStarLimit, twoStarLimit] = currentLevelInfo.starThresholds ?? [
    15, 24,
  ];
  const timeAttackLimit = Math.max(14, Math.round(twoStarLimit * 1.15));
  const totalCrystals = currentLevelInfo.crystals.length;

  const currentBest = bestTimes[currentLevelInfo.id];
  const isPB = isPersonalBest(elapsedSeconds, currentBest);
  const earnedStars = calculateEarnedStars(
    elapsedSeconds,
    currentLevelInfo.starThresholds,
  );
  const goalMessage = formatStarGoalMessage(
    elapsedSeconds,
    currentLevelInfo.starThresholds,
  );

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = window.localStorage.getItem('gyromaze_player_name_v1');
        if (saved && saved.trim()) {
          setPlayerName(saved.trim().slice(0, 24));
        }
      } catch {
        // LocalStorage erişimi yoksa yoksay
      }
    }
  }, []);

  useEffect(() => {
    setScoreSubmitted(false);
  }, [level, gameStatus]);

  const handleReset = () => {
    if (!isSoundMuted) soundEngine.playCalibrate();
    triggerBallReset();
  };

  const handleScoreSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (scoreSubmitted) return;
    const cleanName = playerName.trim().slice(0, 24) || 'Oyuncu';
    setPlayerName(cleanName);
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem('gyromaze_player_name_v1', cleanName);
      } catch {
        // LocalStorage yazma hatasını yoksay
      }
    }
    submitLeaderboardScore({
      playerName: cleanName,
      levelId: currentLevelInfo.id,
      timeSeconds: Number(Math.max(0.1, elapsedSeconds).toFixed(1)),
    });
    setScoreSubmitted(true);
  };

  return (
    <>
      {/* ZAFER MODALI */}
      <Modal
        open={gameStatus === 'won'}
        onClose={handleReset}
        hideClose
        size="md"
        title={`${currentLevelInfo.title} tamamlandı`}
        icon={<Trophy className="h-5 w-5 text-brass" aria-hidden="true" />}
        footer={
          <>
            <Button
              variant="secondary"
              icon={<RotateCcw className="h-4 w-4" aria-hidden="true" />}
              onClick={handleReset}
            >
              Tekrar oyna
            </Button>
            <Button
              variant="primary"
              icon={<ArrowRight className="h-4 w-4" aria-hidden="true" />}
              onClick={nextLevel}
            >
              Sonraki bölüm
            </Button>
          </>
        }
      >
        <div className="text-center">
          {isMultiplayer && winnerPlayer && (
            <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-brass/40 bg-brass/15 px-3 py-1 text-xs font-semibold text-brass">
              <Users className="h-3.5 w-3.5" aria-hidden="true" />
              <span>
                {winnerPlayer}. Oyuncu (
                {winnerPlayer === 1 ? 'Ana bilye' : 'Altın bilye'}) kazandı
              </span>
            </div>
          )}

          {/* Yıldız Gösterimi */}
          <div
            className="mt-1 flex items-center justify-center gap-2"
            aria-label={`Performans: 3 üzerinden ${earnedStars} yıldız`}
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

          {/* Skor Gönderim Formu */}
          {currentLevelInfo.id !== 99 && (
            <form
              onSubmit={handleScoreSubmit}
              className="mt-5 flex gap-2 rounded-2xl border border-line bg-surface-2/60 p-1.5"
            >
              <input
                type="text"
                maxLength={24}
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
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

      {/* SÜRE DOLDU MODALI (Süreye Karşı Modu) */}
      <Modal
        open={gameStatus === 'lost'}
        onClose={handleReset}
        hideClose
        size="sm"
        title="Süre doldu"
        description={`${timeAttackLimit} saniyelik süre içinde portala ulaşılamadı.`}
        icon={
          <AlertTriangle className="h-5 w-5 text-danger" aria-hidden="true" />
        }
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => {
                handleReset();
                setSettingsOpen(true);
              }}
            >
              Modu değiştir
            </Button>
            <Button
              variant="primary"
              icon={<RotateCcw className="h-4 w-4" aria-hidden="true" />}
              onClick={handleReset}
            >
              Tekrar dene
            </Button>
          </>
        }
      >
        <p className="text-xs leading-relaxed text-muted">
          Toplanan kristal:{' '}
          <strong className="gm-num font-semibold text-fg">
            {collectedCrystals.length}/{totalCrystals}
          </strong>
          . Daha hızlı bir başlangıç için bilyeyi sıfırlayıp yeniden dene.
        </p>
      </Modal>
    </>
  );
}

