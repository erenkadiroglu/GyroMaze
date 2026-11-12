'use client';

import { useEffect, useRef, useState } from 'react';
import { Smartphone, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/useGameStore';
import { getMazeLevel } from '@/components/scene/mazeLevels';
import { soundEngine } from '@/utils/soundEngine';
import { resolveKeyboardShortcut } from '@/utils/keyboardShortcuts';
import { calculateTimeAttackLimit } from '@/utils/hudUtils';
import { LevelEditorModal } from './LevelEditorModal';
import { SettingsModal } from './SettingsModal';
import { HelpShortcutsModal } from './HelpShortcutsModal';
import { LeaderboardModal } from './LeaderboardModal';
import { PairingModal } from './PairingModal';
import { GameOutcomeModals } from './GameOutcomeModals';
import { AttitudeGauge } from './AttitudeGauge';
import { DesktopHeader } from './DesktopHeader';
import { QuickControlsToolbar } from './QuickControlsToolbar';
import { Button, Kbd, cx } from './primitives';

/**
 * Masaüstü 3B sahne üzerindeki düzenli, tek odaklı HUD orkestratörü:
 * - Üst çubuk: DesktopHeader (marka, seviye seçici, kristal, süre, oda ve ayarlar)
 * - Duraklatma / Yeniden bağlanma ve sahne üstü bildirim şeritleri
 * - Alt bölge: Kokpit göstergesi (AttitudeGauge), klavye ipuçları ve QuickControlsToolbar
 * - Modallar: Eşleştirme, skor tablosu, ayarlar, editör, yardım ve oyun sonu
 */
export function DesktopHUD() {
  const isPairingModalOpen = useGameStore((s) => s.isPairingModalOpen);
  const setPairingModalOpen = useGameStore((s) => s.setPairingModalOpen);
  const isLeaderboardOpen = useGameStore((s) => s.isLeaderboardOpen);
  const setLeaderboardOpen = useGameStore((s) => s.setLeaderboardOpen);
  const isEditorOpen = useGameStore((s) => s.isEditorOpen);
  const setEditorOpen = useGameStore((s) => s.setEditorOpen);
  const isSettingsOpen = useGameStore((s) => s.isSettingsOpen);
  const isHelpOpen = useGameStore((s) => s.isHelpOpen);
  const setHelpOpen = useGameStore((s) => s.setHelpOpen);
  const resetCount = useGameStore((s) => s.resetCount);

  const gameStatus = useGameStore((s) => s.gameStatus);
  const setGameStatus = useGameStore((s) => s.setGameStatus);
  const gameMode = useGameStore((s) => s.gameMode);
  const level = useGameStore((s) => s.level);
  const cycleCameraMode = useGameStore((s) => s.cycleCameraMode);
  const toggleColorScheme = useGameStore((s) => s.toggleColorScheme);
  const hudNotification = useGameStore((s) => s.hudNotification);
  const showHudNotification = useGameStore((s) => s.showHudNotification);
  const customLevel = useGameStore((s) => s.customLevel);
  const setLevel = useGameStore((s) => s.setLevel);
  const setElapsedSeconds = useGameStore((s) => s.setElapsedSeconds);
  const collectedCrystals = useGameStore((s) => s.collectedCrystals);
  const isSoundMuted = useGameStore((s) => s.isSoundMuted);
  const toggleSoundMuted = useGameStore((s) => s.toggleSoundMuted);
  const triggerBallReset = useGameStore((s) => s.triggerBallReset);
  const triggerHaptic = useGameStore((s) => s.triggerHaptic);
  const isControllerPaired = useGameStore((s) => s.isControllerPaired);
  const isSecondControllerPaired = useGameStore(
    (s) => s.isSecondControllerPaired,
  );
  const isMultiplayer = useGameStore((s) => s.isMultiplayer);
  const showMiniMap = useGameStore((s) => s.showMiniMap);

  const [isPageHidden, setIsPageHidden] = useState(false);
  const lastWarnedSecondRef = useRef<number | null>(null);

  const currentLevelInfo = getMazeLevel(level, customLevel);
  const totalCrystals = currentLevelInfo.crystals.length;
  const remainingCrystals = currentLevelInfo.crystals.filter(
    (_, idx) => !collectedCrystals.includes(idx),
  );
  const isPortalUnlocked = collectedCrystals.length >= totalCrystals;

  const timeAttackLimit = calculateTimeAttackLimit(currentLevelInfo.starThresholds);
  const isTimeAttack = gameMode === 'time_attack';
  const isAnyOverlayOpen =
    isPairingModalOpen ||
    isSettingsOpen ||
    isEditorOpen ||
    isLeaderboardOpen ||
    isHelpOpen;

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
    lastWarnedSecondRef.current = null;
  }, [gameStatus, level, resetCount]);

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
          soundEngine.playDefeat();
        }
        triggerHaptic('hole');
        return;
      }
      setElapsedSeconds(elapsed);

      if (isTimeAttack) {
        const remainingCeil = Math.ceil(timeAttackLimit - elapsed);
        if (
          remainingCeil <= 5 &&
          remainingCeil > 0 &&
          lastWarnedSecondRef.current !== remainingCeil
        ) {
          lastWarnedSecondRef.current = remainingCeil;
          if (!isSoundMuted) {
            soundEngine.playTimerTick(remainingCeil <= 3);
          }
        }
      }
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
    lastWarnedSecondRef.current = null;
    if (!isSoundMuted) soundEngine.playCalibrate();
    triggerBallReset();
  };

  return (
    <div className="pointer-events-none fixed inset-0 z-10 flex flex-col justify-between p-4 sm:p-5">
      {/* ÜST ÇUBUK (MARKA, SEVİYE SEÇİCİ, DURUM OKUMALARI VE ANA EYLEMLER) */}
      <DesktopHeader />

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
        <QuickControlsToolbar onResetClick={handleResetClick} />
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

      {/* OYUN SONUCU MODALLARI (ZAFER VE SÜRE DOLDU) */}
      <GameOutcomeModals />
    </div>
  );
}
