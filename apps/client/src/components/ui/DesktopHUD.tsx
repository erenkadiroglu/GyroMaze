'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import {
  Smartphone,
  Wifi,
  WifiOff,
  RotateCcw,
  QrCode,
  Trophy,
  ArrowRight,
  Copy,
  Check,
  Keyboard,
  Compass,
  Volume2,
  VolumeX,
  KeyRound,
  Gem,
  Lock,
  Unlock,
  Wrench,
  Medal,
  Camera,
  Palette,
  Star,
  Sun,
  Moon,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Sliders,
  Users,
  X,
  Send,
} from 'lucide-react';
import {
  useGameStore,
  transientGyro,
  transientGyroP2,
} from '@/store/useGameStore';
import { getMazeLevel } from '@/components/scene/mazeLevels';
import { soundEngine } from '@/utils/soundEngine';
import { LevelEditorModal } from './LevelEditorModal';
import { SettingsModal } from './SettingsModal';

/**
 * Masaüstü 3B oyun ekranı üzerinde yer alan minimalist HUD,
 * gerçek zamanlı telemetri göstergesi, seviye seçici, harita editörü,
 * küresel skor tablosu ve QR / Oda Kodu eşleşme katmanı.
 */
export function DesktopHUD() {
  const roomId = useGameStore((s) => s.roomId);
  const tunnelUrl = useGameStore((s) => s.tunnelUrl);
  const isSocketConnected = useGameStore((s) => s.isSocketConnected);
  const isControllerPaired = useGameStore((s) => s.isControllerPaired);
  const isPairingModalOpen = useGameStore((s) => s.isPairingModalOpen);
  const setPairingModalOpen = useGameStore((s) => s.setPairingModalOpen);
  const isLeaderboardOpen = useGameStore((s) => s.isLeaderboardOpen);
  const setLeaderboardOpen = useGameStore((s) => s.setLeaderboardOpen);
  const setEditorOpen = useGameStore((s) => s.setEditorOpen);
  const gameStatus = useGameStore((s) => s.gameStatus);
  const setGameStatus = useGameStore((s) => s.setGameStatus);
  const level = useGameStore((s) => s.level);
  const cameraMode = useGameStore((s) => s.cameraMode);
  const cycleCameraMode = useGameStore((s) => s.cycleCameraMode);
  const boardTheme = useGameStore((s) => s.boardTheme);
  const cycleBoardTheme = useGameStore((s) => s.cycleBoardTheme);
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
  const leaderboard = useGameStore((s) => s.leaderboard);
  const submitLeaderboardScore = useGameStore((s) => s.submitLeaderboardScore);
  const collectedCrystals = useGameStore((s) => s.collectedCrystals);
  const isSoundMuted = useGameStore((s) => s.isSoundMuted);
  const toggleSoundMuted = useGameStore((s) => s.toggleSoundMuted);
  const triggerBallReset = useGameStore((s) => s.triggerBallReset);
  const isMultiplayer = useGameStore((s) => s.isMultiplayer);
  const toggleMultiplayer = useGameStore((s) => s.toggleMultiplayer);
  const isSecondControllerPaired = useGameStore(
    (s) => s.isSecondControllerPaired,
  );
  const winnerPlayer = useGameStore((s) => s.winnerPlayer);
  const showMiniMap = useGameStore((s) => s.showMiniMap);
  const setSettingsOpen = useGameStore((s) => s.setSettingsOpen);

  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedRoomCode, setCopiedRoomCode] = useState(false);
  const [browserOrigin, setBrowserOrigin] = useState('http://localhost:3000');
  const [playerName, setPlayerName] = useState('Eren Kadiroğlu');
  const [scoreSubmitted, setScoreSubmitted] = useState(false);
  const [selectedLeaderboardLevel, setSelectedLeaderboardLevel] = useState(1);

  const pitchBarRef = useRef<HTMLDivElement | null>(null);
  const rollBarRef = useRef<HTMLDivElement | null>(null);
  const pitchTextRef = useRef<HTMLSpanElement | null>(null);
  const rollTextRef = useRef<HTMLSpanElement | null>(null);
  const speedTextRef = useRef<HTMLSpanElement | null>(null);
  const miniMapBallRef = useRef<HTMLDivElement | null>(null);
  const miniMapBall2Ref = useRef<HTMLDivElement | null>(null);

  const currentLevelInfo = getMazeLevel(level, customLevel);
  const isLight = colorScheme === 'light' || boardTheme === 'daylight';

  const activeNumericLevel = level === 99 ? 1 : Math.max(1, level);
  const levelWindowStart = Math.max(1, activeNumericLevel - 2);
  const visibleLevelIds = [
    levelWindowStart,
    levelWindowStart + 1,
    levelWindowStart + 2,
    levelWindowStart + 3,
    levelWindowStart + 4,
  ];

  const currentBestTime = bestTimes[currentLevelInfo.id];
  const totalCrystals = currentLevelInfo.crystals.length;
  const isPortalUnlocked = collectedCrystals.length >= totalCrystals;
  const [threeStarLimit, twoStarLimit] = currentLevelInfo.starThresholds ?? [
    15, 24,
  ];
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
  const boardThemeLabel =
    boardTheme === 'emerald'
      ? 'Zümrüt'
      : boardTheme === 'cyberpunk'
        ? 'Siberpunk'
        : boardTheme === 'crimson'
          ? 'Kızıl Kor'
          : 'Gün Işığı';

  const panelClass = isLight
    ? 'border-slate-300/90 bg-white/88 text-slate-900 shadow-lg'
    : 'border-zinc-800/80 bg-zinc-900/75 text-zinc-100 shadow-2xl';
  const btnClass = isLight
    ? 'border-slate-300/90 bg-white/88 text-slate-800 hover:border-slate-400 hover:bg-slate-100/90 shadow-sm'
    : 'border-zinc-800/80 bg-zinc-900/75 text-zinc-200 hover:border-zinc-700 hover:bg-zinc-800/90';

  useEffect(() => {
    setScoreSubmitted(false);
  }, [level, gameStatus]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setBrowserOrigin(window.location.origin);
    }
  }, []);

  // Oyun içi süre sayacı
  useEffect(() => {
    if (gameStatus !== 'playing') return;
    const start = performance.now() - elapsedSeconds * 1000;
    const interval = window.setInterval(() => {
      const now = performance.now();
      setElapsedSeconds(Number(((now - start) / 1000).toFixed(1)));
    }, 100);

    return () => window.clearInterval(interval);
  }, [gameStatus, level]);

  // 60 FPS doğrudan DOM tabanlı eğim göstergesi döngüsü (Delta & 10Hz metin filtreli)
  useEffect(() => {
    let animationFrameId: number;
    let lastPitchPct = 999;
    let lastRollPct = 999;
    let lastTextTime = 0;

    const updateTelemetryBars = (now: number) => {
      const beta = transientGyro.beta;
      const gamma = transientGyro.gamma;

      const pitchPct = Math.max(-100, Math.min(100, (beta / 25) * 100));
      const rollPct = Math.max(-100, Math.min(100, (gamma / 25) * 100));

      if (pitchBarRef.current && Math.abs(pitchPct - lastPitchPct) >= 0.4) {
        lastPitchPct = pitchPct;
        pitchBarRef.current.style.transform = `translateX(${(pitchPct * 0.5).toFixed(1)}%)`;
      }
      if (rollBarRef.current && Math.abs(rollPct - lastRollPct) >= 0.4) {
        lastRollPct = rollPct;
        rollBarRef.current.style.transform = `translateX(${(rollPct * 0.5).toFixed(1)}%)`;
      }

      if (miniMapBallRef.current) {
        // 12x12 tahtada [-6..+6] aralığını 36x36px radar iç koordinatlarına dönüştür
        const rx = ((transientGyro.ballX + 6) / 12) * 36;
        const rz = ((transientGyro.ballZ + 6) / 12) * 36;
        miniMapBallRef.current.style.transform = `translate3d(${rx.toFixed(1)}px, ${rz.toFixed(1)}px, 0)`;
      }
      if (miniMapBall2Ref.current) {
        const rx2 = ((transientGyroP2.ballX + 6) / 12) * 36;
        const rz2 = ((transientGyroP2.ballZ + 6) / 12) * 36;
        miniMapBall2Ref.current.style.transform = `translate3d(${rx2.toFixed(1)}px, ${rz2.toFixed(1)}px, 0)`;
      }

      if (now - lastTextTime >= 100) {
        lastTextTime = now;
        if (pitchTextRef.current) {
          pitchTextRef.current.textContent = `${beta >= 0 ? '+' : ''}${beta.toFixed(1)}°`;
        }
        if (rollTextRef.current) {
          rollTextRef.current.textContent = `${gamma >= 0 ? '+' : ''}${gamma.toFixed(1)}°`;
        }
        if (speedTextRef.current) {
          speedTextRef.current.textContent = `${transientGyro.ballSpeed.toFixed(1)} m/s`;
        }
      }

      animationFrameId = window.requestAnimationFrame(updateTelemetryBars);
    };

    animationFrameId = window.requestAnimationFrame(updateTelemetryBars);
    return () => window.cancelAnimationFrame(animationFrameId);
  }, []);

  const activeBaseUrl = tunnelUrl || browserOrigin;

  const controllerUrl = roomId
    ? `${activeBaseUrl}/controller?room=${roomId}`
    : `${activeBaseUrl}/controller`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(controllerUrl);
      setCopiedLink(true);
      window.setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      // Panoya kopyalama başarısız olursa sessizce geç
    }
  };

  const handleCopyRoomCode = async () => {
    if (!roomId) return;
    try {
      await navigator.clipboard.writeText(roomId);
      setCopiedRoomCode(true);
      window.setTimeout(() => setCopiedRoomCode(false), 2000);
    } catch {
      // Panoya kopyalama başarısız olursa sessizce geç
    }
  };

  const handleStartKeyboardMode = () => {
    if (!isSoundMuted) {
      soundEngine.playCalibrate();
    }
    setPairingModalOpen(false);
    setGameStatus('playing');
  };

  const handleResetClick = () => {
    if (!isSoundMuted) {
      soundEngine.playCalibrate();
    }
    triggerBallReset();
  };

  const handleJumpProceduralLevel = () => {
    const nextProc = level < 6 || level === 99 ? 6 : level + 1;
    setLevel(nextProc);
    showHudNotification(
      `✨ Prosedürel Bölüm ${nextProc < 10 ? `0${nextProc}` : nextProc} oluşturuldu!`,
      'info',
    );
  };

  // Klavye kısayolları (R: Sıfırla, C: Kamera, M: Ses, L: Aydınlık/Karanlık Mod)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      const key = e.key.toLowerCase();
      if (key === 'r') {
        triggerBallReset();
      } else if (key === 'c') {
        cycleCameraMode();
      } else if (key === 'm') {
        toggleSoundMuted();
      } else if (key === 'l') {
        toggleColorScheme();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [
    triggerBallReset,
    cycleCameraMode,
    toggleSoundMuted,
    toggleColorScheme,
  ]);

  const handleScoreSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (scoreSubmitted) return;
    submitLeaderboardScore({
      playerName: playerName.trim() || 'Eren Kadiroğlu',
      levelId: currentLevelInfo.id,
      timeSeconds: elapsedSeconds,
    });
    setScoreSubmitted(true);
  };

  const filteredLeaderboard = leaderboard
    .filter((entry) => entry.levelId === selectedLeaderboardLevel)
    .sort((a, b) => a.timeSeconds - b.timeSeconds);

  return (
    <div className="pointer-events-none fixed inset-0 z-10 flex flex-col justify-between p-5">
      {/* ÜST GÖSTERGE PANELİ (TOP HUD) */}
      <header className="flex flex-wrap items-center justify-between gap-3">
        {/* Sol: Marka, Bölüm Bilgisi ve Sonsuz Seviye Seçici */}
        <div
          className={`pointer-events-auto flex flex-wrap items-center gap-3 rounded-2xl border px-4 py-2.5 backdrop-blur-xl transition-colors ${panelClass}`}
        >
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span
                className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${isControllerPaired
                    ? 'bg-emerald-400'
                    : isSocketConnected
                      ? 'bg-amber-400'
                      : 'bg-rose-500'
                  }`}
              />
              <span
                className={`relative inline-flex h-2.5 w-2.5 rounded-full ${isControllerPaired
                    ? 'bg-emerald-500'
                    : isSocketConnected
                      ? 'bg-amber-500'
                      : 'bg-rose-500'
                  }`}
              />
            </span>
            <span className="text-base font-semibold tracking-tight">
              GyroMaze
            </span>
          </div>

          <div
            className={`h-4 w-px ${isLight ? 'bg-slate-300' : 'bg-zinc-800'}`}
          />

          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span
                className={`text-xs font-semibold ${isLight ? 'text-emerald-600' : 'text-emerald-400'
                  }`}
              >
                {currentLevelInfo.title}
              </span>
              {currentLevelInfo.id >= 6 && currentLevelInfo.id !== 99 && (
                <span className="rounded-md bg-purple-500/15 px-1.5 py-0.5 text-[9px] font-bold tracking-wider text-purple-400 uppercase">
                  Sonsuz
                </span>
              )}
            </div>
            <span
              className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-zinc-400'
                }`}
            >
              {currentLevelInfo.subtitle}
            </span>
          </div>

          <div
            className={`h-4 w-px ${isLight ? 'bg-slate-300' : 'bg-zinc-800'}`}
          />

          {/* Sonsuz Bölüm Gezgini (01 .. ∞) */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={prevLevel}
              disabled={activeNumericLevel <= 1 && level !== 99}
              className={`flex h-7 w-6 cursor-pointer items-center justify-center rounded-lg transition disabled:cursor-not-allowed disabled:opacity-35 ${isLight
                  ? 'bg-slate-200/80 text-slate-700 hover:bg-slate-300'
                  : 'bg-zinc-800/70 text-zinc-300 hover:bg-zinc-800'
                }`}
              title="Önceki Bölüm"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>

            {visibleLevelIds.map((lvlId) => {
              const isActive = currentLevelInfo.id === lvlId;
              const label = lvlId < 10 ? `0${lvlId}` : String(lvlId);
              return (
                <button
                  key={lvlId}
                  type="button"
                  onClick={() => setLevel(lvlId)}
                  className={`h-7 min-w-7 cursor-pointer rounded-lg px-1.5 font-mono text-xs font-semibold transition ${isActive
                      ? 'bg-emerald-500 text-zinc-950 shadow-sm shadow-emerald-500/30'
                      : isLight
                        ? 'bg-slate-200/75 text-slate-600 hover:bg-slate-300 hover:text-slate-900'
                        : 'bg-zinc-800/70 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
                    }`}
                  title={
                    lvlId <= 5
                      ? `Bölüm ${label} (Özel Tasarım)`
                      : `Bölüm ${label} (Sonsuz Prosedürel Labirent)`
                  }
                >
                  {label}
                </button>
              );
            })}

            <button
              type="button"
              onClick={nextLevel}
              className={`flex h-7 w-6 cursor-pointer items-center justify-center rounded-lg transition ${isLight
                  ? 'bg-slate-200/80 text-slate-700 hover:bg-slate-300'
                  : 'bg-zinc-800/70 text-zinc-300 hover:bg-zinc-800'
                }`}
              title="Sonraki Bölüm (Sonsuz İlerleme)"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>

            <button
              type="button"
              onClick={handleJumpProceduralLevel}
              className="ml-0.5 flex h-7 cursor-pointer items-center gap-1 rounded-lg border border-purple-500/35 bg-purple-500/15 px-2 text-[11px] font-semibold text-purple-400 transition hover:bg-purple-500/25 active:scale-95"
              title="Yeni Prosedürel Sonsuz Bölüm Üret (Bölüm 06+)"
            >
              <Sparkles className="h-3 w-3" />
              <span>Sonsuz</span>
            </button>
          </div>
        </div>

        {/* Sağ: Kristal, Süre, Rekor, Aydınlık/Karanlık Mod, Editör, Liderlik, Ses ve QR */}
        <div className="pointer-events-auto flex flex-wrap items-center gap-2">
          {/* Enerji Kristali ve Portal Kilidi Göstergesi */}
          <div
            className={`flex items-center gap-2 rounded-xl border px-3.5 py-2 backdrop-blur-xl transition ${isPortalUnlocked
                ? isLight
                  ? 'border-emerald-500/50 bg-emerald-500/15 text-emerald-700'
                  : 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
                : panelClass
              }`}
          >
            <Gem className="h-3.5 w-3.5 text-sky-500" />
            <span className="font-mono text-xs font-semibold">
              {collectedCrystals.length}/{totalCrystals}
            </span>
            <div
              className={`h-3 w-px ${isLight ? 'bg-slate-300' : 'bg-zinc-800'}`}
            />
            {isPortalUnlocked ? (
              <span
                className={`flex items-center gap-1 text-xs font-semibold ${isLight ? 'text-emerald-700' : 'text-emerald-300'
                  }`}
              >
                <Unlock className="h-3.5 w-3.5" />
                Açık
              </span>
            ) : (
              <span
                className={`flex items-center gap-1 text-xs font-semibold ${isLight ? 'text-amber-600' : 'text-amber-300'
                  }`}
              >
                <Lock className="h-3.5 w-3.5" />
                Kilitli
              </span>
            )}
          </div>

          {/* Süre ve En İyi Rekor Sayacı */}
          <div
            className={`flex items-center gap-2.5 rounded-xl border px-3.5 py-2 backdrop-blur-xl ${panelClass}`}
          >
            <div className="flex items-center gap-1.5">
              <span
                className={`text-[11px] tracking-wider uppercase ${isLight ? 'text-slate-500' : 'text-zinc-400'
                  }`}
              >
                Süre
              </span>
              <span className="font-mono text-xs font-semibold">
                {elapsedSeconds.toFixed(1)}sn
              </span>
            </div>

            {currentBestTime !== undefined && (
              <>
                <div
                  className={`h-3 w-px ${isLight ? 'bg-slate-300' : 'bg-zinc-800'
                    }`}
                />
                <div className="flex items-center gap-1">
                  <Trophy className="h-3.5 w-3.5 text-amber-500" />
                  <span
                    className={`font-mono text-xs font-semibold ${isLight ? 'text-amber-600' : 'text-amber-300'
                      }`}
                  >
                    {currentBestTime.toFixed(1)}sn
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Bağlantı ve Oda Kodu Rozeti */}
          <button
            type="button"
            onClick={() => setPairingModalOpen(true)}
            className={`flex cursor-pointer items-center gap-1.5 rounded-xl border px-3.5 py-2 backdrop-blur-xl transition ${btnClass}`}
            title="Oda Kodu ve Mobil Eşleşme Bilgileri"
          >
            {isControllerPaired ? (
              <>
                <Wifi className="h-3.5 w-3.5 text-emerald-500" />
                <span
                  className={`font-mono text-xs font-semibold ${isLight ? 'text-emerald-700' : 'text-emerald-300'
                    }`}
                >
                  {roomId} • {latencyMs}ms
                </span>
              </>
            ) : isSocketConnected ? (
              <>
                <KeyRound className="h-3.5 w-3.5 text-amber-500" />
                <span
                  className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-zinc-400'
                    }`}
                >
                  Oda:
                </span>
                <span
                  className={`font-mono text-xs font-bold tracking-wider ${isLight ? 'text-amber-600' : 'text-amber-300'
                    }`}
                >
                  {roomId ?? '...'}
                </span>
              </>
            ) : (
              <>
                <WifiOff className="h-3.5 w-3.5 text-rose-500" />
                <span className="text-xs font-medium text-rose-500">Kopuk</span>
              </>
            )}
          </button>

          {/* Aydınlık / Karanlık Mod Değiştirme Butonu */}
          <button
            type="button"
            onClick={toggleColorScheme}
            className={`flex cursor-pointer items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-medium transition active:scale-95 ${btnClass}`}
            title="Aydınlık / Karanlık Mod Değiştir (Kısayol: L)"
          >
            {isLight ? (
              <>
                <Sun className="h-3.5 w-3.5 text-amber-500" />
                <span>Aydınlık</span>
              </>
            ) : (
              <>
                <Moon className="h-3.5 w-3.5 text-sky-400" />
                <span>Karanlık</span>
              </>
            )}
          </button>

          {/* Kamera Açısı Değiştirme Butonu */}
          <button
            type="button"
            onClick={cycleCameraMode}
            className={`flex cursor-pointer items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-medium transition active:scale-95 ${btnClass}`}
            title="Kamera Bakış Açısını Değiştir (Kısayol: C)"
          >
            <Camera className="h-3.5 w-3.5 text-purple-500" />
            <span>{cameraModeLabel}</span>
          </button>

          {/* 3B Atmosfer Teması Değiştirme Butonu */}
          <button
            type="button"
            onClick={cycleBoardTheme}
            className={`flex cursor-pointer items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-medium transition active:scale-95 ${btnClass}`}
            title="3B Sahne Atmosfer Temasını Değiştir (Zümrüt / Siberpunk / Kızıl Kor / Gün Işığı)"
          >
            <Palette className="h-3.5 w-3.5 text-pink-500" />
            <span>{boardThemeLabel}</span>
          </button>

          {/* 1 Oyuncu / 2 Oyuncu (Çok Oyunculu) Hızlı Geçiş Butonu */}
          <button
            type="button"
            onClick={toggleMultiplayer}
            className={`flex cursor-pointer items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold transition active:scale-95 ${
              isMultiplayer
                ? 'border-amber-500/50 bg-amber-500/15 text-amber-400'
                : btnClass
            }`}
            title="Tek Oyunculu / 2 Oyunculu (1v1 & Co-op) Mod Değiştir"
          >
            <Users className="h-3.5 w-3.5 text-amber-500" />
            <span>
              {isMultiplayer
                ? `2 Oyuncu${isSecondControllerPaired ? ' (2 Tel)' : ''}`
                : '1 Oyuncu'}
            </span>
          </button>

          {/* Oyun ve Fizik Ayarları Modalı Butonu */}
          <button
            type="button"
            onClick={() => setSettingsOpen(true)}
            className={`flex cursor-pointer items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-medium transition active:scale-95 ${btnClass}`}
            title="Oyun, Fizik, Hassasiyet ve Görsel Ayarlar"
          >
            <Sliders className="h-3.5 w-3.5 text-emerald-500" />
            <span>Ayarlar</span>
          </button>

          {/* Harita Editörü Butonu */}
          <button
            type="button"
            onClick={() => setEditorOpen(true)}
            className={`flex cursor-pointer items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-medium transition active:scale-95 ${btnClass}`}
            title="Özel 3B Harita Editörünü Aç"
          >
            <Wrench className="h-3.5 w-3.5 text-sky-500" />
            <span>Harita Editörü</span>
          </button>

          {/* Liderlik Tablosu Butonu */}
          <button
            type="button"
            onClick={() => {
              setSelectedLeaderboardLevel(
                currentLevelInfo.id === 99 ? 1 : currentLevelInfo.id,
              );
              setLeaderboardOpen(true);
            }}
            className={`flex cursor-pointer items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-medium transition active:scale-95 ${btnClass}`}
            title="Küresel Skor Tablosu"
          >
            <Medal className="h-3.5 w-3.5 text-amber-500" />
            <span>Skorlar</span>
          </button>

          {/* Ses Aç/Kapat Butonu */}
          <button
            type="button"
            onClick={toggleSoundMuted}
            className={`flex cursor-pointer items-center justify-center rounded-xl border p-2 transition active:scale-95 ${btnClass}`}
            title={
              isSoundMuted ? 'Sesi Aç (Kısayol: M)' : 'Sesi Kapat (Kısayol: M)'
            }
          >
            {isSoundMuted ? (
              <VolumeX className="h-4 w-4 text-rose-500" />
            ) : (
              <Volume2 className="h-4 w-4 text-emerald-500" />
            )}
          </button>

          {/* Topu Sıfırla Butonu */}
          <button
            type="button"
            onClick={handleResetClick}
            className={`flex cursor-pointer items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-medium transition active:scale-95 ${btnClass}`}
            title="Topu Başlangıç Noktasına Sıfırla (Kısayol: R)"
          >
            <RotateCcw className="h-3.5 w-3.5 text-slate-400" />
            <span>Sıfırla</span>
          </button>

          {/* QR Eşleşme Modalı Açma Butonu */}
          <button
            type="button"
            onClick={() => setPairingModalOpen(true)}
            className="flex cursor-pointer items-center gap-1.5 rounded-xl border border-emerald-500/40 bg-emerald-500/15 px-3 py-2 text-xs font-semibold text-emerald-500 transition hover:bg-emerald-500/25 active:scale-95"
          >
            <QrCode className="h-3.5 w-3.5" />
            <span>Eşleştir</span>
          </button>
        </div>
      </header>

      {/* ETKİLEŞİMLİ SAHNE BİLDİRİM TOASTU (KİLİTLİ PORTAL / PORTAL AÇILDI / PROSEDÜREL BÖLÜM) */}
      <AnimatePresence>
        {hudNotification && (
          <motion.div
            key={hudNotification.id}
            initial={{ opacity: 0, y: -14, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -14, scale: 0.95 }}
            className="pointer-events-none fixed top-20 left-1/2 z-30 -translate-x-1/2"
          >
            <div
              className={`rounded-2xl border px-5 py-2.5 text-xs font-semibold shadow-2xl backdrop-blur-xl ${hudNotification.tone === 'warn'
                  ? 'border-amber-500/50 bg-amber-950/90 text-amber-200'
                  : hudNotification.tone === 'success'
                    ? 'border-emerald-500/50 bg-emerald-950/90 text-emerald-200'
                    : 'border-purple-500/50 bg-purple-950/90 text-purple-200'
                }`}
            >
              {hudNotification.message}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ALT TELEMETRİ PANELİ (BOTTOM TELEMETRY BAR) */}
      <footer className="flex flex-wrap items-end justify-between gap-4">
        <div
          className={`pointer-events-auto flex items-center gap-6 rounded-2xl border px-5 py-3.5 backdrop-blur-xl transition-colors ${panelClass}`}
        >
          <div
            className={`flex items-center gap-2 text-xs font-medium ${isLight ? 'text-slate-600' : 'text-zinc-400'
              }`}
          >
            <Compass className="h-4 w-4 text-emerald-500" />
            <span>Canlı Telemetri</span>
          </div>

          <div className="flex items-center gap-3">
            <span
              className={`text-xs ${isLight ? 'text-slate-500' : 'text-zinc-400'
                }`}
            >
              Eğim (Pitch)
            </span>
            <div
              className={`relative h-1.5 w-24 overflow-hidden rounded-full ${isLight ? 'bg-slate-200' : 'bg-zinc-800'
                }`}
            >
              <div
                ref={pitchBarRef}
                className="h-full w-full rounded-full bg-emerald-500 transition-none"
              />
            </div>
            <span
              ref={pitchTextRef}
              className="w-12 text-right font-mono text-xs font-semibold"
            >
              +0.0°
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span
              className={`text-xs ${isLight ? 'text-slate-500' : 'text-zinc-400'
                }`}
            >
              Yatış (Roll)
            </span>
            <div
              className={`relative h-1.5 w-24 overflow-hidden rounded-full ${isLight ? 'bg-slate-200' : 'bg-zinc-800'
                }`}
            >
              <div
                ref={rollBarRef}
                className="h-full w-full rounded-full bg-sky-500 transition-none"
              />
            </div>
            <span
              ref={rollTextRef}
              className="w-12 text-right font-mono text-xs font-semibold"
            >
              +0.0°
            </span>
          </div>

          <div
            className={`h-5 w-px ${isLight ? 'bg-slate-300' : 'bg-zinc-800'}`}
          />

          {/* Anlık Bilye Hızı */}
          <div className="flex items-center gap-2">
            <span
              className={`text-xs ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}
            >
              Hız
            </span>
            <span
              ref={speedTextRef}
              className="w-14 text-right font-mono text-xs font-semibold text-purple-500"
            >
              0.0 m/s
            </span>
          </div>

          {/* 60 FPS Canlı 2B Radar / Mini-Harita */}
          {showMiniMap && (
            <div
              className={`relative h-10 w-10 overflow-hidden rounded-lg border ${
                isLight
                  ? 'border-slate-300 bg-slate-100'
                  : 'border-zinc-700 bg-zinc-950'
              }`}
              title="Canlı 2B Labirent Radarı (Yeşil: Hedef, Mavi: Kristal, Beyaz/Siyah: 1. Bilye, Altın: 2. Bilye)"
            >
              {/* Hedef Noktası */}
              <div
                style={{
                  left: `${((currentLevelInfo.goalPosition[0] + 6) / 12) * 100}%`,
                  top: `${((currentLevelInfo.goalPosition[2] + 6) / 12) * 100}%`,
                }}
                className={`absolute h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full ${
                  isPortalUnlocked ? 'bg-emerald-500' : 'bg-amber-500'
                }`}
              />
              {/* Kalan Kristaller */}
              {currentLevelInfo.crystals.map(([cx, cz], idx) =>
                collectedCrystals.includes(idx) ? null : (
                  <div
                    key={`radar-c-${idx}`}
                    style={{
                      left: `${((cx + 6) / 12) * 100}%`,
                      top: `${((cz + 6) / 12) * 100}%`,
                    }}
                    className="absolute h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-sky-400"
                  />
                ),
              )}
              {/* Canlı 1. Oyuncu Bilye Konumu */}
              <div
                ref={miniMapBallRef}
                className={`absolute top-0 left-0 h-2 w-2 rounded-full shadow-sm will-change-transform ${
                  isLight ? 'bg-slate-900' : 'bg-white'
                }`}
              />
              {/* Canlı 2. Oyuncu (Altın Bilye) Konumu */}
              {isMultiplayer && (
                <div
                  ref={miniMapBall2Ref}
                  className="absolute top-0 left-0 h-2 w-2 rounded-full bg-amber-400 shadow-sm will-change-transform"
                />
              )}
            </div>
          )}
        </div>

        {!isControllerPaired && (
          <div
            className={`pointer-events-auto flex items-center gap-2 rounded-xl border px-4 py-2.5 text-xs backdrop-blur-xl transition-colors ${panelClass}`}
          >
            <Keyboard className="h-4 w-4 text-sky-500" />
            <span className={isLight ? 'text-slate-600' : 'text-zinc-400'}>
              {isMultiplayer ? (
                <>
                  <strong>2 Oyuncu:</strong> 1. Bilye <strong>WASD</strong> • 2.
                  Bilye <strong>Yön Tuşları</strong> • <strong>R</strong>{' '}
                  Sıfırla
                </>
              ) : (
                <>
                  Masaüstü Test: <strong>WASD / Yön Tuşları</strong> eğim verir
                  • <strong>R</strong> Sıfırla • <strong>L</strong> Mod •{' '}
                  <strong>C</strong> Kamera
                </>
              )}
            </span>
          </div>
        )}
      </footer>

      {/* HARİTA EDİTÖRÜ VE OYUN AYARLARI MODALLARI */}
      <LevelEditorModal />
      <SettingsModal />

      {/* KÜRESEL SKOR TABLOSU (LEADERBOARD) MODALI */}
      <AnimatePresence>
        {isLeaderboardOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="pointer-events-auto fixed inset-0 z-40 flex items-center justify-center bg-zinc-950/80 p-4 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.94, opacity: 0, y: 12 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.94, opacity: 0, y: 12 }}
              className="w-full max-w-md rounded-3xl border border-zinc-800 bg-zinc-900/95 p-6 shadow-2xl"
            >
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-amber-500/20 bg-amber-500/10 text-amber-400">
                    <Trophy className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold tracking-wider text-amber-400 uppercase">
                      En Hızlı Tamamlama Süreleri
                    </span>
                    <h2 className="text-lg font-semibold text-zinc-100">
                      Küresel Skor Tablosu
                    </h2>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setLeaderboardOpen(false)}
                  className="cursor-pointer rounded-xl border border-zinc-800 bg-zinc-800/60 p-2 text-zinc-400 transition hover:text-zinc-100"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Bölüm Sekmeleri (Sonsuz Bölüm Destekli) */}
              <div className="mb-4 flex items-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-950 p-1.5">
                <button
                  type="button"
                  onClick={() =>
                    setSelectedLeaderboardLevel((prev) => Math.max(1, prev - 1))
                  }
                  className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg bg-zinc-900 text-zinc-300 transition hover:bg-zinc-800"
                  title="Önceki Bölüm"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <div className="grid flex-1 grid-cols-5 gap-1">
                  {[0, 1, 2, 3, 4].map((offset) => {
                    const startLvl = Math.max(1, selectedLeaderboardLevel - 2);
                    const tabLvl = startLvl + offset;
                    const label = tabLvl < 10 ? `0${tabLvl}` : String(tabLvl);
                    return (
                      <button
                        key={tabLvl}
                        type="button"
                        onClick={() => setSelectedLeaderboardLevel(tabLvl)}
                        className={`cursor-pointer rounded-lg py-1.5 font-mono text-xs font-semibold transition ${selectedLeaderboardLevel === tabLvl
                            ? 'bg-amber-500 text-zinc-950'
                            : 'text-zinc-400 hover:text-zinc-200'
                          }`}
                      >
                        Böl. {label}
                      </button>
                    );
                  })}
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setSelectedLeaderboardLevel((prev) => prev + 1)
                  }
                  className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg bg-zinc-900 text-zinc-300 transition hover:bg-zinc-800"
                  title="Sonraki Bölüm"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              {/* Skor Listesi */}
              <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
                {filteredLeaderboard.length === 0 ? (
                  <div className="rounded-2xl border border-zinc-800/80 bg-zinc-950/60 py-8 text-center text-xs text-zinc-400">
                    Bu bölüm için henüz kayıtlı bir rekor bulunmuyor.
                  </div>
                ) : (
                  filteredLeaderboard.map((item, idx) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between rounded-xl border border-zinc-800/80 bg-zinc-950/80 px-4 py-3"
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`flex h-6 w-6 items-center justify-center rounded-full font-mono text-xs font-bold ${idx === 0
                              ? 'bg-amber-500/20 text-amber-300'
                              : idx === 1
                                ? 'bg-zinc-400/20 text-zinc-200'
                                : idx === 2
                                  ? 'bg-orange-500/20 text-orange-300'
                                  : 'bg-zinc-800 text-zinc-400'
                            }`}
                        >
                          {idx + 1}
                        </span>
                        <span className="text-xs font-medium text-zinc-100">
                          {item.playerName}
                        </span>
                      </div>
                      <span className="font-mono text-xs font-semibold text-emerald-400">
                        {item.timeSeconds.toFixed(1)}sn
                      </span>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* QR KOD VE ODA KODU EŞLEŞME MODALI */}
      <AnimatePresence>
        {isPairingModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="pointer-events-auto fixed inset-0 z-30 flex items-center justify-center bg-zinc-950/75 p-4 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.94, opacity: 0, y: 12 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.94, opacity: 0, y: 12 }}
              transition={{ type: 'spring', stiffness: 320, damping: 28 }}
              className="w-full max-w-md rounded-3xl border border-zinc-800 bg-zinc-900/95 p-7 shadow-2xl"
            >
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold tracking-wider text-emerald-400 uppercase">
                    Çapraz Cihaz Senkronizasyonu
                  </span>
                  <h2 className="mt-1 text-2xl font-semibold tracking-tight text-zinc-100">
                    Telefonunuzu Bağlayın
                  </h2>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-400">
                  <Smartphone className="h-5 w-5" />
                </div>
              </div>

              <p className="mb-4 text-xs leading-relaxed text-zinc-400">
                Telefonunuzdan aşağıdaki <strong className="text-zinc-200">QR kodu</strong> okutabilir veya{' '}
                <strong className="text-zinc-200">6 haneli Oda Kodunu</strong> kontrolcü ekranına girerek doğrudan bağlanabilirsiniz.
              </p>

              {/* QR Kod ve 6 Haneli Oda Kodu Kartı */}
              <div className="mb-4 flex flex-col items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
                <div className="rounded-2xl bg-white p-3.5 shadow-inner">
                  <QRCodeSVG
                    value={controllerUrl}
                    size={164}
                    bgColor="#ffffff"
                    fgColor="#09090b"
                    level="M"
                  />
                </div>

                {/* Belirgin 6 Haneli Oda Kodu Bölümü */}
                <div className="mt-4 flex w-full items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900/90 px-4 py-2.5">
                  <div className="flex items-center gap-2">
                    <KeyRound className="h-4 w-4 text-emerald-400" />
                    <div>
                      <span className="block text-[10px] tracking-wider text-zinc-400 uppercase">
                        Oda Kodu ile Giriş
                      </span>
                      <span className="font-mono text-lg font-bold tracking-[0.2em] text-emerald-400">
                        {roomId ?? '......'}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleCopyRoomCode}
                    className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-xs font-medium text-zinc-200 transition hover:bg-zinc-700 active:scale-95"
                  >
                    {copiedRoomCode ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-400" />
                        <span className="text-emerald-300">Kopyalandı</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5 text-zinc-400" />
                        <span>Kodu Kopyala</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-2.5">
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-zinc-800 bg-zinc-800/60 px-4 py-3 text-xs font-medium text-zinc-200 transition hover:bg-zinc-800 active:scale-[0.99]"
                >
                  {copiedLink ? (
                    <>
                      <Check className="h-4 w-4 text-emerald-400" />
                      <span className="text-emerald-300">
                        Kontrolcü Bağlantısı Kopyalandı
                      </span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 text-zinc-400" />
                      <span>Kontrolcü Bağlantısını Kopyala</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleStartKeyboardMode}
                  className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-3 text-xs font-semibold text-zinc-950 transition hover:bg-emerald-400 active:scale-[0.99]"
                >
                  <span>Sahneye Geç (Mobil veya Klavye ile Oyna)</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* BÖLÜM TAMAMLANDI (ZAFER & SKOR KAYDI) MODALI */}
      <AnimatePresence>
        {gameStatus === 'won' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="pointer-events-auto fixed inset-0 z-30 flex items-center justify-center bg-zinc-950/70 p-4 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 16 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 16 }}
              transition={{ type: 'spring', stiffness: 320, damping: 26 }}
              className="w-full max-w-md rounded-3xl border border-emerald-500/30 bg-zinc-900/95 p-8 text-center shadow-2xl"
            >
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
                <Trophy className="h-7 w-7" />
              </div>

              <span className="text-xs font-semibold tracking-wider text-emerald-400 uppercase">
                Hedefe Ulaşıldı
              </span>
              <h2 className="mt-1 text-2xl font-semibold text-zinc-100">
                {currentLevelInfo.title} Tamamlandı!
              </h2>

              {isMultiplayer && winnerPlayer && (
                <div className="mx-auto mt-2.5 inline-flex items-center gap-1.5 rounded-full border border-amber-500/40 bg-amber-500/15 px-3.5 py-1 text-xs font-semibold text-amber-300">
                  <Users className="h-3.5 w-3.5" />
                  <span>
                    🏆 {winnerPlayer}. Oyuncu (
                    {winnerPlayer === 1 ? 'Ana Bilye' : 'Altın Bilye'}) Hedefe
                    Ulaştı!
                  </span>
                </div>
              )}

              {/* 3 Yıldızlı Performans Derecesi */}
              <div className="mt-3 flex items-center justify-center gap-2">
                {[1, 2, 3].map((starIdx) => (
                  <Star
                    key={starIdx}
                    className={`h-6 w-6 ${starIdx <= earnedStars
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-zinc-700'
                      }`}
                  />
                ))}
              </div>
              <p className="mt-1 text-[11px] text-zinc-400">
                3 Yıldız Hedefi: &le; {threeStarLimit.toFixed(1)}sn
              </p>

              <p className="mt-2 text-sm text-zinc-400">
                Labirenti{' '}
                <strong className="font-mono text-emerald-300">
                  {elapsedSeconds.toFixed(1)} saniyede
                </strong>{' '}
                başarıyla tamamladınız.
              </p>

              {/* Küresel Skor Tablosuna Kayıt Formu */}
              {currentLevelInfo.id !== 99 && (
                <form
                  onSubmit={handleScoreSubmit}
                  className="mt-5 flex gap-2 rounded-2xl border border-zinc-800 bg-zinc-950/80 p-2"
                >
                  <input
                    type="text"
                    maxLength={24}
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    disabled={scoreSubmitted}
                    placeholder="Oyuncu Adınız"
                    className="flex-1 bg-transparent px-3 text-xs text-zinc-100 outline-none disabled:text-zinc-400"
                  />
                  <button
                    type="submit"
                    disabled={scoreSubmitted}
                    className={`flex cursor-pointer items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold transition ${scoreSubmitted
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : 'bg-amber-500 text-zinc-950 hover:bg-amber-400'
                      }`}
                  >
                    {scoreSubmitted ? (
                      <>
                        <Check className="h-3.5 w-3.5" />
                        <span>Kaydedildi</span>
                      </>
                    ) : (
                      <>
                        <Send className="h-3.5 w-3.5" />
                        <span>Skoru Kaydet</span>
                      </>
                    )}
                  </button>
                </form>
              )}

              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={handleResetClick}
                  className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border border-zinc-800 bg-zinc-800/70 px-4 py-3 text-xs font-medium text-zinc-200 transition hover:bg-zinc-800"
                >
                  <RotateCcw className="h-4 w-4" />
                  <span>Tekrar Oyna</span>
                </button>
                <button
                  type="button"
                  onClick={nextLevel}
                  className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-3 text-xs font-semibold text-zinc-950 transition hover:bg-emerald-400"
                >
                  <span>Sonraki Bölüm</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
