'use client';

import {
  Smartphone,
  Gem,
  Lock,
  Unlock,
  Timer,
  Trophy,
  Users,
  SlidersHorizontal,
  HelpCircle,
} from 'lucide-react';
import { useGameStore } from '@/store/useGameStore';
import { getMazeLevel } from '@/components/scene/mazeLevels';
import {
  calculateTimeAttackLimit,
  calculateTimeRemaining,
  resolveTimerColorClass,
  resolveConnectionStatus,
  formatPortalStatus,
} from '@/utils/hudUtils';
import { LevelSelectPopover } from './LevelSelectPopover';
import { Button, IconButton, cx } from './primitives';

export function DesktopHeader() {
  const isSocketConnected = useGameStore((s) => s.isSocketConnected);
  const isControllerPaired = useGameStore((s) => s.isControllerPaired);
  const isSecondControllerPaired = useGameStore(
    (s) => s.isSecondControllerPaired,
  );
  const level = useGameStore((s) => s.level);
  const customLevel = useGameStore((s) => s.customLevel);
  const collectedCrystals = useGameStore((s) => s.collectedCrystals);
  const gameMode = useGameStore((s) => s.gameMode);
  const elapsedSeconds = useGameStore((s) => s.elapsedSeconds);
  const bestTimes = useGameStore((s) => s.bestTimes);
  const isMultiplayer = useGameStore((s) => s.isMultiplayer);
  const roomId = useGameStore((s) => s.roomId);
  const latencyMs = useGameStore((s) => s.latencyMs);
  const setPairingModalOpen = useGameStore((s) => s.setPairingModalOpen);
  const setSettingsOpen = useGameStore((s) => s.setSettingsOpen);
  const isHelpOpen = useGameStore((s) => s.isHelpOpen);
  const setHelpOpen = useGameStore((s) => s.setHelpOpen);

  const currentLevelInfo = getMazeLevel(level, customLevel);
  const currentBestTime = bestTimes[currentLevelInfo.id];
  const totalCrystals = currentLevelInfo.crystals.length;
  const { isUnlocked: isPortalUnlocked, tooltip: portalTooltip, ratioText } =
    formatPortalStatus(totalCrystals, collectedCrystals.length);

  const isTimeAttack = gameMode === 'time_attack';
  const timeAttackLimit = calculateTimeAttackLimit(currentLevelInfo.starThresholds);
  const timeRemaining = calculateTimeRemaining(timeAttackLimit, elapsedSeconds);

  const { isAnyPaired, dotColor } = resolveConnectionStatus(
    isSocketConnected,
    isControllerPaired,
    isSecondControllerPaired,
  );

  const visibleTimerValue = isTimeAttack ? timeRemaining : elapsedSeconds;
  const timerColorClass = resolveTimerColorClass(isTimeAttack, timeRemaining);

  return (
    <header className="flex flex-wrap items-center justify-between gap-3">
      {/* Sol Kapsül: Marka ve Bölüm Seçici */}
      <div className="gm-panel pointer-events-auto relative flex items-center gap-2.5 rounded-2xl px-3.5 py-2 shadow-lg">
        <div className="flex items-center gap-2 pr-1">
          <span
            className={cx('h-2.5 w-2.5 rounded-full', dotColor)}
            aria-hidden="true"
          />
          <span className="text-base font-semibold tracking-tight text-fg">
            GyroMaze
          </span>
        </div>

        <span className="h-4 w-px bg-line" aria-hidden="true" />

        <LevelSelectPopover />
      </div>

      {/* Sağ Kapsül: Durum Okumaları ve Ana Eylemler */}
      <div className="gm-panel pointer-events-auto flex flex-wrap items-center gap-2.5 rounded-2xl px-3.5 py-2 shadow-lg">
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
            {visibleTimerValue.toFixed(1)} sn
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

        {isMultiplayer && (
          <>
            <span className="h-4 w-px bg-line" aria-hidden="true" />
            <span
              className="inline-flex items-center gap-1 rounded-lg bg-brass/15 px-2 py-0.5 text-xs font-medium text-brass"
              title={
                isSecondControllerPaired
                  ? '2. telefon bağlı'
                  : 'Klavyede 1. Oyuncu WASD, 2. Oyuncu Ok Tuşları'
              }
            >
              <Users className="h-3 w-3" aria-hidden="true" />
              2 Oyuncu
            </span>
          </>
        )}

        <span className="h-4 w-px bg-line" aria-hidden="true" />

        {/* Oda Kodu & Eşleştir Düğmesi */}
        <Button
          variant={isAnyPaired ? 'secondary' : 'primary'}
          size="sm"
          icon={<Smartphone className="h-3.5 w-3.5" aria-hidden="true" />}
          onClick={() => setPairingModalOpen(true)}
          title="Oda kodu ve QR bağlantı penceresini aç"
        >
          <span className="gm-num tracking-wider">
            {roomId ?? '......'}
          </span>
          {isAnyPaired ? (
            <span className="gm-num hidden text-xs text-ok sm:inline">
              {latencyMs}ms
            </span>
          ) : (
            <span className="hidden sm:inline">Bağla</span>
          )}
        </Button>

        {/* Ayarlar Paneli Düğmesi */}
        <Button
          variant="secondary"
          size="sm"
          icon={<SlidersHorizontal className="h-3.5 w-3.5" aria-hidden="true" />}
          onClick={() => setSettingsOpen(true)}
        >
          Ayarlar
        </Button>

        {/* Kısayollar ve Yardım Rehberi */}
        <IconButton
          label="Klavye kısayolları ve yardım rehberi"
          shortcut="H"
          onClick={() => setHelpOpen(!isHelpOpen)}
        >
          <HelpCircle className="h-4 w-4 text-brass" aria-hidden="true" />
        </IconButton>
      </div>
    </header>
  );
}
