'use client';

import { useEffect, useRef, useState } from 'react';
import {
  Smartphone,
  RotateCcw,
  Trophy,
  ArrowRight,
  Copy,
  Check,
  Volume2,
  VolumeX,
  Gem,
  Lock,
  Unlock,
  Wrench,
  Medal,
  Camera,
  Star,
  Sun,
  Moon,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Sparkles,
  SlidersHorizontal,
  Users,
  Send,
  Timer,
  AlertTriangle,
  HelpCircle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/useGameStore';
import { getMazeLevel } from '@/components/scene/mazeLevels';
import { soundEngine } from '@/utils/soundEngine';
import { resolveKeyboardShortcut } from '@/utils/keyboardShortcuts';
import { LevelEditorModal } from './LevelEditorModal';
import { SettingsModal } from './SettingsModal';
import { HelpShortcutsModal } from './HelpShortcutsModal';
import { LeaderboardModal } from './LeaderboardModal';
import { PairingModal } from './PairingModal';
import { AttitudeGauge } from './AttitudeGauge';
import {
  Modal,
  IconButton,
  Button,
  Kbd,
  cx,
  handleRadioGroupKeyDown,
} from './primitives';

/**
 * Masaüstü 3B sahne üzerindeki düzenli, tek odaklı HUD katmanı:
 * - Üst çubuk: Marka, bölüm gezgini, okunan telemetri ve yalnızca iki ana eylem (Bağla, Ayarlar)
 * - Sol alt: Yapay ufuk kokpit göstergesi ve 2B canlı radar
 * - Sağ alt: Hızlı kontroller araç çubuğu
 * - Modallar: Telefon eşleştirme, küresel skor tablosu, zafer ve süre doldu pencereleri
 */
export function DesktopHUD() {
  const roomId = useGameStore((s) => s.roomId);
  const lanIp = useGameStore((s) => s.lanIp);
  const tunnelUrl = useGameStore((s) => s.tunnelUrl);
  const isSocketConnected = useGameStore((s) => s.isSocketConnected);
  const isControllerPaired = useGameStore((s) => s.isControllerPaired);
  const isSecondControllerPaired = useGameStore(
    (s) => s.isSecondControllerPaired,
  );
  const isPairingModalOpen = useGameStore((s) => s.isPairingModalOpen);
  const setPairingModalOpen = useGameStore((s) => s.setPairingModalOpen);
  const isLeaderboardOpen = useGameStore((s) => s.isLeaderboardOpen);
  const setLeaderboardOpen = useGameStore((s) => s.setLeaderboardOpen);
  const isEditorOpen = useGameStore((s) => s.isEditorOpen);
  const setEditorOpen = useGameStore((s) => s.setEditorOpen);
  const isSettingsOpen = useGameStore((s) => s.isSettingsOpen);
  const setSettingsOpen = useGameStore((s) => s.setSettingsOpen);
  const isHelpOpen = useGameStore((s) => s.isHelpOpen);
  const setHelpOpen = useGameStore((s) => s.setHelpOpen);
  const resetCount = useGameStore((s) => s.resetCount);

  const gameStatus = useGameStore((s) => s.gameStatus);
  const setGameStatus = useGameStore((s) => s.setGameStatus);
  const gameMode = useGameStore((s) => s.gameMode);
  const level = useGameStore((s) => s.level);
  const cameraMode = useGameStore((s) => s.cameraMode);
  const cycleCameraMode = useGameStore((s) => s.cycleCameraMode);
  const colorScheme = useGameStore((s) => s.colorScheme);
  const toggleColorScheme = useGameStore((s) => s.toggleColorScheme);
  const hudNotification = useGameStore((s) => s.hudNotification);
  const showHudNotification = useGameStore((s) => s.showHudNotification);
  const customLevel = useGameStore((s) => s.customLevel);
  const setLevel = useGameStore((s) => s.setLevel);
  const nextLevel = useGameStore((s) => s.nextLevel);
  const prevLevel = useGameStore((s) => s.prevLevel);
  const latencyMs = useGameStore((s) => s.latencyMs);
  const elapsedSeconds = useGameStore((s) => s.elapsedSeconds);
  const setElapsedSeconds = useGameStore((s) => s.setElapsedSeconds);
  const bestTimes = useGameStore((s) => s.bestTimes);
  const submitLeaderboardScore = useGameStore((s) => s.submitLeaderboardScore);
  const collectedCrystals = useGameStore((s) => s.collectedCrystals);
  const isSoundMuted = useGameStore((s) => s.isSoundMuted);
  const toggleSoundMuted = useGameStore((s) => s.toggleSoundMuted);
  const triggerBallReset = useGameStore((s) => s.triggerBallReset);
  const triggerHaptic = useGameStore((s) => s.triggerHaptic);
  const isMultiplayer = useGameStore((s) => s.isMultiplayer);
  const winnerPlayer = useGameStore((s) => s.winnerPlayer);
  const showMiniMap = useGameStore((s) => s.showMiniMap);

  const [isLevelMenuOpen, setIsLevelMenuOpen] = useState(false);
  const [playerName, setPlayerName] = useState('Oyuncu');
  const [scoreSubmitted, setScoreSubmitted] = useState(false);
  const [isPageHidden, setIsPageHidden] = useState(false);

  const levelPopoverRef = useRef<HTMLDivElement | null>(null);

  const currentLevelInfo = getMazeLevel(level, customLevel);
  const activeNumericLevel = level === 99 ? 1 : Math.max(1, level);
  const currentBestTime = bestTimes[currentLevelInfo.id];
  const totalCrystals = currentLevelInfo.crystals.length;
  const remainingCrystals = currentLevelInfo.crystals.filter(
    (_, idx) => !collectedCrystals.includes(idx),
  );
  const isPortalUnlocked = collectedCrystals.length >= totalCrystals;

  const [threeStarLimit, twoStarLimit] = currentLevelInfo.starThresholds ?? [
    15, 24,
  ];
  const timeAttackLimit = Math.max(14, Math.round(twoStarLimit * 1.15));
  const timeRemaining = Math.max(0, timeAttackLimit - elapsedSeconds);
  const isTimeAttack = gameMode === 'time_attack';
  const isAnyOverlayOpen =
    isPairingModalOpen ||
    isSettingsOpen ||
    isEditorOpen ||
    isLeaderboardOpen ||
    isHelpOpen;

  const earnedStars =
    elapsedSeconds <= threeStarLimit
      ? 3
      : elapsedSeconds <= twoStarLimit
        ? 2
        : 1;

  const cameraModeLabel =
    cameraMode === 'isometric'
      ? 'İzometrik'
      : cameraMode === 'topdown'
        ? 'Üstten'
        : 'Takip';

  const shortLevelTag =
    currentLevelInfo.id === 99
      ? 'Özel'
      : `Bölüm ${currentLevelInfo.id < 10 ? `0${currentLevelInfo.id}` : currentLevelInfo.id}`;

  useEffect(() => {
    setScoreSubmitted(false);
  }, [level, gameStatus]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedName = window.localStorage.getItem(
          'gyromaze_player_name_v1',
        );
        if (savedName && savedName.trim()) {
          setPlayerName(savedName.trim().slice(0, 24));
        }
      } catch {
        // LocalStorage erişimi yoksa varsayılan adla devam et
      }
    }
  }, []);

  // Bölüm menüsü dışına tıklanınca veya Esc basılınca kapat
  useEffect(() => {
    if (!isLevelMenuOpen) return;
    const onMouseDown = (e: MouseEvent) => {
      if (
        levelPopoverRef.current &&
        !levelPopoverRef.current.contains(e.target as Node)
      ) {
        setIsLevelMenuOpen(false);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsLevelMenuOpen(false);
    };
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [isLevelMenuOpen]);

  // Sekme gizlendiğinde oyun saatini dondurarak arka planda süre atlamasını önle
  useEffect(() => {
    const syncVisibility = () => {
      setIsPageHidden(document.hidden);
    };
    syncVisibility();
    document.addEventListener('visibilitychange', syncVisibility);
    return () => {
      document.removeEventListener('visibilitychange', syncVisibility);
    };
  }, []);

  // Oyun içi süre ve Süreye Karşı (Time Attack) geri sayımı
  useEffect(() => {
    if (gameStatus !== 'playing' || isAnyOverlayOpen || isPageHidden) return;
    const baseElapsed = useGameStore.getState().elapsedSeconds;
    const start = performance.now() - baseElapsed * 1000;
    const interval = window.setInterval(() => {
      const elapsed = Number(((performance.now() - start) / 1000).toFixed(1));
      if (isTimeAttack && elapsed >= timeAttackLimit) {
        setElapsedSeconds(timeAttackLimit);
        setGameStatus('lost');
        if (!isSoundMuted) {
          soundEngine.playHoleFall();
        }
        triggerHaptic('hole');
        return;
      }
      setElapsedSeconds(elapsed);
    }, 100);

    return () => window.clearInterval(interval);
  }, [
    gameStatus,
    level,
    resetCount,
    isAnyOverlayOpen,
    isPageHidden,
    isTimeAttack,
    timeAttackLimit,
    isSoundMuted,
    setElapsedSeconds,
    setGameStatus,
    triggerHaptic,
  ]);

  // Global klavye kısayolları (R: Sıfırla, C: Kamera, M: Ses, L: Tema, H/?: Yardım, E: Editör, K: Skor, P: Eşleştir, 1..5: Bölüm, Space: Kalibre)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName;
      const isInputFocused =
        tag === 'INPUT' ||
        tag === 'TEXTAREA' ||
        tag === 'SELECT' ||
        Boolean(target?.isContentEditable);

      const action = resolveKeyboardShortcut({
        key: e.key,
        code: e.code,
        ctrlKey: e.ctrlKey,
        metaKey: e.metaKey,
        altKey: e.altKey,
        repeat: e.repeat,
        isInputFocused,
        isGameOver: gameStatus === 'won' || gameStatus === 'lost',
        isAnyOverlayOpen,
        isHelpOpen,
      });

      if (!action) return;

      if (action === 'help') {
        e.preventDefault();
        setHelpOpen(!isHelpOpen);
      } else if (action === 'reset') {
        triggerBallReset();
      } else if (action === 'camera') {
        cycleCameraMode();
      } else if (action === 'mute') {
        toggleSoundMuted();
      } else if (action === 'theme') {
        toggleColorScheme();
      } else if (action === 'editor') {
        e.preventDefault();
        setEditorOpen(true);
      } else if (action === 'leaderboard') {
        e.preventDefault();
        setLeaderboardOpen(true);
      } else if (action === 'pairing') {
        e.preventDefault();
        setPairingModalOpen(true);
      } else if (action === 'calibrate') {
        e.preventDefault();
        if (!isSoundMuted) soundEngine.playCalibrate();
        showHudNotification('Merkez kalibre edildi.');
      } else if (typeof action === 'object' && action.type === 'level') {
        e.preventDefault();
        setLevel(action.level);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [
    isAnyOverlayOpen,
    isHelpOpen,
    gameStatus,
    isSoundMuted,
    triggerBallReset,
    cycleCameraMode,
    toggleSoundMuted,
    toggleColorScheme,
    setHelpOpen,
    setEditorOpen,
    setLeaderboardOpen,
    setPairingModalOpen,
    setLevel,
    showHudNotification,
  ]);

  const handleResetClick = () => {
    if (!isSoundMuted) soundEngine.playCalibrate();
    triggerBallReset();
  };

  const handleJumpProceduralLevel = () => {
    const nextProc = level < 6 || level === 99 ? 6 : level + 1;
    setLevel(nextProc);
    setIsLevelMenuOpen(false);
    showHudNotification(
      `Prosedürel Bölüm ${nextProc < 10 ? `0${nextProc}` : nextProc} oluşturuldu`,
      'info',
    );
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

  const isAnyControllerPaired =
    isSocketConnected && (isControllerPaired || isSecondControllerPaired);
  const connectionDotColor = isAnyControllerPaired
    ? 'bg-ok'
    : isSocketConnected
      ? 'bg-brass'
      : 'bg-danger';

  const visibleTimerValue = isTimeAttack ? timeRemaining : elapsedSeconds;
  const timerColorClass = isTimeAttack
    ? timeRemaining <= 4
      ? 'text-danger'
      : timeRemaining <= 8
        ? 'text-warn'
        : 'text-fg'
    : 'text-fg';

  return (
    <div className="pointer-events-none fixed inset-0 z-10 flex flex-col justify-between p-4 sm:p-5">
      {/* ÜST ÇUBUK */}
      <header className="flex flex-wrap items-center justify-between gap-3">
        {/* Sol Kapsül: Marka ve Bölüm Seçici */}
        <div
          ref={levelPopoverRef}
          className="gm-panel pointer-events-auto relative flex items-center gap-2.5 rounded-2xl px-3.5 py-2 shadow-lg"
        >
          <div className="flex items-center gap-2 pr-1">
            <span
              className={cx('h-2.5 w-2.5 rounded-full', connectionDotColor)}
              aria-hidden="true"
            />
            <span className="text-base font-semibold tracking-tight text-fg">
              GyroMaze
            </span>
          </div>

          <span className="h-4 w-px bg-line" aria-hidden="true" />

          <div className="flex items-center gap-1">
            <IconButton
              size="sm"
              label="Önceki bölüm"
              onClick={prevLevel}
              disabled={activeNumericLevel <= 1 && level !== 99}
            >
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            </IconButton>

            <button
              type="button"
              aria-expanded={isLevelMenuOpen}
              aria-haspopup="menu"
              onClick={() => setIsLevelMenuOpen((v) => !v)}
              className="flex h-8 cursor-pointer items-center gap-1.5 rounded-xl px-2.5 text-sm font-medium text-fg transition-colors hover:bg-surface-2"
              title={currentLevelInfo.subtitle}
            >
              <span className="gm-num font-semibold text-brass">
                {shortLevelTag}
              </span>
              <span className="hidden max-w-[180px] truncate text-xs text-muted md:inline">
                {currentLevelInfo.title.replace(/^Bölüm \d+\s*[—-]\s*/, '')}
              </span>
              <ChevronDown
                className={cx(
                  'h-3.5 w-3.5 text-muted transition-transform',
                  isLevelMenuOpen && 'rotate-180',
                )}
                aria-hidden="true"
              />
            </button>

            <IconButton
              size="sm"
              label="Sonraki bölüm"
              onClick={nextLevel}
            >
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </IconButton>
          </div>

          {/* Açılır Bölüm Seçici Menüsü */}
          <AnimatePresence>
            {isLevelMenuOpen && (
              <motion.div
                role="menu"
                aria-label="Bölüm listesi"
                initial={{ opacity: 0, y: 6, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 6, scale: 0.98 }}
                transition={{ duration: 0.14 }}
                className="absolute top-[calc(100%+8px)] left-0 z-40 w-72 rounded-2xl border border-line bg-surface p-3 shadow-2xl"
              >
                <div className="mb-2 flex items-center justify-between px-1">
                  <span className="text-xs font-medium text-muted">
                    Standart bölümler
                  </span>
                  {bestTimes[currentLevelInfo.id] !== undefined && (
                    <span className="gm-num text-xs text-brass">
                      En iyi {bestTimes[currentLevelInfo.id].toFixed(1)} sn
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-5 gap-1.5">
                  {[1, 2, 3, 4, 5].map((id) => {
                    const active = currentLevelInfo.id === id;
                    return (
                      <button
                        key={id}
                        type="button"
                        role="menuitem"
                        onClick={() => {
                          setLevel(id);
                          setIsLevelMenuOpen(false);
                        }}
                        className={cx(
                          'gm-num h-9 cursor-pointer rounded-xl border text-sm font-semibold transition-colors',
                          active
                            ? 'border-brass bg-brass text-brass-fg'
                            : 'border-line bg-surface-2/60 text-fg hover:border-muted/60',
                        )}
                      >
                        0{id}
                      </button>
                    );
                  })}
                </div>

                <div className="mt-3 border-t border-line pt-3 space-y-1.5">
                  <button
                    type="button"
                    role="menuitem"
                    onClick={handleJumpProceduralLevel}
                    className={cx(
                      'flex w-full cursor-pointer items-center justify-between rounded-xl border px-3 py-2 text-xs font-medium transition-colors',
                      level >= 6 && level !== 99
                        ? 'border-brass bg-brass/15 text-brass'
                        : 'border-line bg-surface-2/70 text-fg hover:border-brass/60',
                    )}
                  >
                    <span className="flex items-center gap-2">
                      <Sparkles className="h-3.5 w-3.5 text-brass" aria-hidden="true" />
                      Sonsuz prosedürel bölüm üret
                    </span>
                    <span
                      className={cx(
                        'gm-num',
                        level >= 6 && level !== 99 ? 'text-brass font-semibold' : 'text-muted',
                      )}
                    >
                      {level >= 6 && level !== 99 ? `${shortLevelTag} +1` : '06+'}
                    </span>
                  </button>

                  {customLevel && (
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setLevel(99);
                        setIsLevelMenuOpen(false);
                      }}
                      className={cx(
                        'flex w-full cursor-pointer items-center justify-between rounded-xl border px-3 py-2 text-xs font-medium transition-colors',
                        level === 99
                          ? 'border-brass bg-brass/15 text-brass'
                          : 'border-line bg-surface-2/70 text-fg hover:border-muted/60',
                      )}
                    >
                      <span className="truncate">{customLevel.title}</span>
                      <span className="text-[11px] text-muted">Özel</span>
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Sağ Kapsül: Durum Okumaları ve 2 Ana Eylem */}
        <div className="gm-panel pointer-events-auto flex flex-wrap items-center gap-2.5 rounded-2xl px-3.5 py-2 shadow-lg">
          {/* Kristal ve Portal Durumu */}
          <div
            className="flex items-center gap-1.5 px-1 text-sm"
            title={
              isPortalUnlocked
                ? 'Hedef portalı açık'
                : `Portalı açmak için ${totalCrystals - collectedCrystals.length} kristal kaldı`
            }
          >
            <Gem className="h-3.5 w-3.5 text-signal" aria-hidden="true" />
            <span className="gm-num font-semibold text-fg">
              {collectedCrystals.length}/{totalCrystals}
            </span>
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
            variant={isAnyControllerPaired ? 'secondary' : 'primary'}
            size="sm"
            icon={<Smartphone className="h-3.5 w-3.5" aria-hidden="true" />}
            onClick={() => setPairingModalOpen(true)}
            title="Oda kodu ve QR bağlantı penceresini aç"
          >
            <span className="gm-num tracking-wider">
              {roomId ?? '......'}
            </span>
            {isAnyControllerPaired ? (
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
            onClick={() => setHelpOpen(true)}
          >
            <HelpCircle className="h-4 w-4 text-brass" aria-hidden="true" />
          </IconButton>
        </div>
      </header>

      {/* DURAKLATMA / BAĞLANTI KOPTU KURTARMA ÇUBUĞU */}
      {gameStatus === 'paused' && !isAnyOverlayOpen && (
        <div
          role="status"
          aria-live="polite"
          className="pointer-events-auto fixed top-20 left-1/2 z-20 flex -translate-x-1/2 items-center gap-3 rounded-2xl border border-warn/45 bg-surface/95 px-4 py-2 text-sm shadow-xl backdrop-blur-md"
        >
          <span className="font-medium text-warn">
            Kontrolcü bağlantısı koptu — oyun duraklatıldı
          </span>
          <div className="flex items-center gap-1.5">
            <Button
              variant="secondary"
              size="sm"
              icon={<Smartphone className="h-3.5 w-3.5" aria-hidden="true" />}
              onClick={() => setPairingModalOpen(true)}
            >
              Bağla
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={<ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />}
              onClick={() => setGameStatus('playing')}
            >
              Devam et
            </Button>
          </div>
        </div>
      )}

      {/* SAHNE ÜSTÜ KISA BİLDİRİM */}
      <AnimatePresence>
        {hudNotification && (
          <motion.div
            key={hudNotification.id}
            role="status"
            aria-live="polite"
            initial={{ opacity: 0, y: -10, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.97 }}
            className="pointer-events-none fixed top-20 left-1/2 z-30 -translate-x-1/2"
          >
            <div
              className={cx(
                'rounded-2xl border bg-surface/95 px-4 py-2 text-sm font-medium shadow-xl backdrop-blur-md',
                hudNotification.tone === 'warn' && 'border-warn/50 text-warn',
                hudNotification.tone === 'success' && 'border-ok/50 text-ok',
                hudNotification.tone === 'info' && 'border-signal/50 text-fg',
              )}
            >
              {hudNotification.message}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ALT BÖLGE: KOKPİT GÖSTERGESİ, İPUCU VE HIZLI ARAÇ ÇUBUĞU */}
      <footer className="flex flex-wrap items-end justify-between gap-4">
        <AttitudeGauge
          boardSize={currentLevelInfo.boardSize}
          goalPosition={currentLevelInfo.goalPosition}
          remainingCrystals={remainingCrystals}
          isPortalUnlocked={isPortalUnlocked}
          isMultiplayer={isMultiplayer}
          showMiniMap={showMiniMap}
        />

        {(!isControllerPaired ||
          (isMultiplayer && !isSecondControllerPaired)) && (
          <div className="gm-panel hidden items-center gap-2 rounded-xl px-3 py-1.5 text-xs text-muted lg:flex">
            {isMultiplayer ? (
              <>
                {!isControllerPaired && (
                  <>
                    <Kbd>WASD</Kbd>
                    <span>1. Bilye</span>
                  </>
                )}
                {!isControllerPaired && !isSecondControllerPaired && (
                  <span className="text-line">·</span>
                )}
                {!isSecondControllerPaired && (
                  <>
                    <Kbd>Oklar</Kbd>
                    <span>2. Bilye</span>
                  </>
                )}
              </>
            ) : (
              <>
                <Kbd>WASD</Kbd>
                <span>Eğim</span>
                <span className="text-line">·</span>
                <Kbd>R</Kbd>
                <span>Sıfırla</span>
                <span className="text-line">·</span>
                <Kbd>L</Kbd>
                <span>Gece/Gündüz</span>
              </>
            )}
          </div>
        )}

        {/* Sağ Alt Hızlı İkon Araç Çubuğu */}
        <div
          role="toolbar"
          aria-label="Hızlı sahne kontrolleri"
          className="gm-panel pointer-events-auto flex items-center gap-1 rounded-2xl p-1.5 shadow-lg"
        >
          <div role="group" aria-label="Görünüm ve ses" className="flex items-center gap-0.5">
            <IconButton
              label="Topu başa al"
              shortcut="R"
              onClick={handleResetClick}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
            </IconButton>

            <IconButton
              label={`Kamera açısı: ${cameraModeLabel}`}
              shortcut="C"
              onClick={cycleCameraMode}
            >
              <Camera className="h-4 w-4" aria-hidden="true" />
            </IconButton>

            <IconButton
              label={colorScheme === 'light' ? 'Gece moduna geç' : 'Gündüz moduna geç'}
              shortcut="L"
              pressed={colorScheme === 'light'}
              onClick={toggleColorScheme}
            >
              {colorScheme === 'light' ? (
                <Sun className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Moon className="h-4 w-4" aria-hidden="true" />
              )}
            </IconButton>

            <IconButton
              label={isSoundMuted ? 'Sesi aç' : 'Sesi kapat'}
              shortcut="M"
              pressed={isSoundMuted}
              onClick={toggleSoundMuted}
            >
              {isSoundMuted ? (
                <VolumeX className="h-4 w-4 text-danger" aria-hidden="true" />
              ) : (
                <Volume2 className="h-4 w-4" aria-hidden="true" />
              )}
            </IconButton>
          </div>

          <span
            role="separator"
            aria-orientation="vertical"
            className="mx-1 h-5 w-px bg-line"
          />

          <div role="group" aria-label="Araçlar" className="flex items-center gap-0.5">
            <IconButton
              label="Harita editörü"
              onClick={() => setEditorOpen(true)}
            >
              <Wrench className="h-4 w-4" aria-hidden="true" />
            </IconButton>

            <IconButton
              label="Skor tablosu"
              onClick={() => setLeaderboardOpen(true)}
            >
              <Medal className="h-4 w-4" aria-hidden="true" />
            </IconButton>
          </div>
        </div>
      </footer>

      {/* YARDIMCI PANELLER */}
      <LevelEditorModal />
      <SettingsModal />
      <HelpShortcutsModal />

      {/* TELEFON EŞLEŞTİRME MODALI */}
      <PairingModal />

      {/* KÜRESEL SKOR TABLOSU MODALI */}
      <LeaderboardModal
        open={isLeaderboardOpen}
        onClose={() => setLeaderboardOpen(false)}
        initialLevel={currentLevelInfo.id === 99 ? 1 : currentLevelInfo.id}
      />

      {/* BÖLÜM TAMAMLANDI MODALI */}
      <Modal
        open={gameStatus === 'won'}
        onClose={handleResetClick}
        hideClose
        size="md"
        title={`${currentLevelInfo.title} tamamlandı`}
        icon={<Trophy className="h-5 w-5" aria-hidden="true" />}
        footer={
          <>
            <Button
              variant="secondary"
              icon={<RotateCcw className="h-4 w-4" aria-hidden="true" />}
              onClick={handleResetClick}
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

          <div
            className="mt-1 flex items-center justify-center gap-2"
            aria-label={`Performans: 3 üzerinden ${earnedStars} yıldız`}
          >
            {[1, 2, 3].map((starIdx) => (
              <Star
                key={starIdx}
                className={cx(
                  'h-7 w-7',
                  starIdx <= earnedStars
                    ? 'fill-brass text-brass'
                    : 'text-line',
                )}
              />
            ))}
          </div>

          <p className="mt-3 text-sm text-muted">
            Labirenti{' '}
            <strong className="gm-num text-base text-ok">
              {Math.max(0.1, elapsedSeconds).toFixed(1)} saniyede
            </strong>{' '}
            bitirdin (3 yıldız hedefi &le; {threeStarLimit.toFixed(1)} sn).
          </p>

          {currentLevelInfo.id !== 99 && (
            <form
              onSubmit={handleScoreSubmit}
              className="mt-5 flex gap-2 rounded-xl border border-line bg-surface-2/60 p-1.5"
            >
              <input
                type="text"
                maxLength={24}
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                disabled={scoreSubmitted}
                aria-label="Oyuncu adı"
                placeholder="Oyuncu adın"
                className="min-w-0 flex-1 bg-transparent px-2.5 text-sm text-fg outline-none disabled:text-muted"
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
        onClose={handleResetClick}
        hideClose
        size="sm"
        title="Süre doldu"
        description={`${timeAttackLimit} saniyelik süre içinde portala ulaşılamadı.`}
        icon={<AlertTriangle className="h-5 w-5 text-danger" aria-hidden="true" />}
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => {
                handleResetClick();
                setSettingsOpen(true);
              }}
            >
              Modu değiştir
            </Button>
            <Button
              variant="primary"
              icon={<RotateCcw className="h-4 w-4" aria-hidden="true" />}
              onClick={handleResetClick}
            >
              Tekrar dene
            </Button>
          </>
        }
      >
        <p className="text-sm text-muted">
          Toplanan kristal:{' '}
          <strong className="gm-num text-fg">
            {collectedCrystals.length}/{totalCrystals}
          </strong>
          . Daha hızlı bir başlangıç için bilyeyi sıfırlayıp yeniden dene.
        </p>
      </Modal>
    </div>
  );
}
