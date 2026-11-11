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
  Globe,
  Network,
  Gem,
  Lock,
  Unlock,
  Wrench,
  Medal,
  X,
  Send,
} from 'lucide-react';
import { useGameStore, transientGyro } from '@/store/useGameStore';
import { MAZE_LEVELS } from '@/components/scene/mazeLevels';
import { soundEngine } from '@/utils/soundEngine';
import { LevelEditorModal } from './LevelEditorModal';

/**
 * Masaüstü 3B oyun ekranı üzerinde yer alan minimalist HUD,
 * gerçek zamanlı telemetri göstergesi, seviye seçici, harita editörü,
 * küresel skor tablosu ve QR eşleşme katmanı.
 */
export function DesktopHUD() {
  const roomId = useGameStore((s) => s.roomId);
  const lanIp = useGameStore((s) => s.lanIp);
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
  const customLevel = useGameStore((s) => s.customLevel);
  const setLevel = useGameStore((s) => s.setLevel);
  const nextLevel = useGameStore((s) => s.nextLevel);
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

  const [copied, setCopied] = useState(false);
  const [connectionMode, setConnectionMode] = useState<'tunnel' | 'lan'>(
    'tunnel',
  );
  const [lanOriginUrl, setLanOriginUrl] = useState('http://localhost:3000');
  const [playerName, setPlayerName] = useState('Eren Kadiroğlu');
  const [scoreSubmitted, setScoreSubmitted] = useState(false);
  const [selectedLeaderboardLevel, setSelectedLeaderboardLevel] = useState(1);

  const pitchBarRef = useRef<HTMLDivElement | null>(null);
  const rollBarRef = useRef<HTMLDivElement | null>(null);
  const pitchTextRef = useRef<HTMLSpanElement | null>(null);
  const rollTextRef = useRef<HTMLSpanElement | null>(null);

  const currentLevelInfo =
    level === 99 && customLevel
      ? customLevel
      : (MAZE_LEVELS[(level - 1) % MAZE_LEVELS.length] ?? MAZE_LEVELS[0]);

  const currentBestTime = bestTimes[currentLevelInfo.id];
  const totalCrystals = currentLevelInfo.crystals.length;
  const isPortalUnlocked = collectedCrystals.length >= totalCrystals;

  useEffect(() => {
    setScoreSubmitted(false);
  }, [level, gameStatus]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const { protocol, hostname, port } = window.location;
      const effectiveHost =
        (hostname === 'localhost' || hostname === '127.0.0.1') && lanIp
          ? lanIp
          : hostname;
      const portSuffix = port ? `:${port}` : '';
      setLanOriginUrl(`${protocol}//${effectiveHost}${portSuffix}`);
    }
  }, [lanIp]);

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

  // 60 FPS doğrudan DOM tabanlı eğim göstergesi döngüsü
  useEffect(() => {
    let animationFrameId: number;

    const updateTelemetryBars = () => {
      const beta = transientGyro.beta;
      const gamma = transientGyro.gamma;

      if (pitchBarRef.current) {
        const pct = Math.max(-100, Math.min(100, (beta / 25) * 100));
        pitchBarRef.current.style.transform = `translateX(${pct * 0.5}%)`;
      }
      if (rollBarRef.current) {
        const pct = Math.max(-100, Math.min(100, (gamma / 25) * 100));
        rollBarRef.current.style.transform = `translateX(${pct * 0.5}%)`;
      }
      if (pitchTextRef.current) {
        pitchTextRef.current.textContent = `${beta >= 0 ? '+' : ''}${beta.toFixed(1)}°`;
      }
      if (rollTextRef.current) {
        rollTextRef.current.textContent = `${gamma >= 0 ? '+' : ''}${gamma.toFixed(1)}°`;
      }

      animationFrameId = window.requestAnimationFrame(updateTelemetryBars);
    };

    animationFrameId = window.requestAnimationFrame(updateTelemetryBars);
    return () => window.cancelAnimationFrame(animationFrameId);
  }, []);

  const activeBaseUrl =
    connectionMode === 'tunnel' && tunnelUrl ? tunnelUrl : lanOriginUrl;

  const controllerUrl = roomId
    ? `${activeBaseUrl}/controller?room=${roomId}`
    : `${activeBaseUrl}/controller`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(controllerUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
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
        {/* Sol: Marka, Bölüm Bilgisi ve Seviye Seçici */}
        <div className="pointer-events-auto flex flex-wrap items-center gap-3.5 rounded-2xl border border-zinc-800/80 bg-zinc-900/75 px-4 py-2.5 shadow-2xl backdrop-blur-xl">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span
                className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${
                  isControllerPaired
                    ? 'bg-emerald-400'
                    : isSocketConnected
                      ? 'bg-amber-400'
                      : 'bg-rose-500'
                }`}
              />
              <span
                className={`relative inline-flex h-2.5 w-2.5 rounded-full ${
                  isControllerPaired
                    ? 'bg-emerald-500'
                    : isSocketConnected
                      ? 'bg-amber-500'
                      : 'bg-rose-500'
                }`}
              />
            </span>
            <span className="text-base font-semibold tracking-tight text-zinc-100">
              GyroMaze
            </span>
          </div>

          <div className="h-4 w-px bg-zinc-800" />

          <div className="flex flex-col">
            <span className="text-xs font-medium text-emerald-400">
              {currentLevelInfo.title}
            </span>
            <span className="text-[11px] text-zinc-400">
              {currentLevelInfo.subtitle}
            </span>
          </div>

          <div className="h-4 w-px bg-zinc-800" />

          {/* Hızlı Bölüm Seçici (01 - 05) */}
          <div className="flex items-center gap-1">
            {MAZE_LEVELS.map((lvl) => {
              const isActive = currentLevelInfo.id === lvl.id;
              return (
                <button
                  key={lvl.id}
                  type="button"
                  onClick={() => setLevel(lvl.id)}
                  className={`h-7 w-7 cursor-pointer rounded-lg font-mono text-xs font-semibold transition ${
                    isActive
                      ? 'bg-emerald-500 text-zinc-950 shadow-sm shadow-emerald-500/30'
                      : 'bg-zinc-800/70 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
                  }`}
                  title={lvl.title}
                >
                  0{lvl.id}
                </button>
              );
            })}
          </div>
        </div>

        {/* Sağ: Kristal, Süre, Rekor, Editör, Liderlik, Ses ve QR */}
        <div className="pointer-events-auto flex flex-wrap items-center gap-2">
          {/* Enerji Kristali ve Portal Kilidi Göstergesi */}
          <div
            className={`flex items-center gap-2 rounded-xl border px-3.5 py-2 backdrop-blur-xl transition ${
              isPortalUnlocked
                ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
                : 'border-zinc-800/80 bg-zinc-900/75 text-zinc-200'
            }`}
          >
            <Gem className="h-3.5 w-3.5 text-sky-400" />
            <span className="font-mono text-xs font-semibold">
              {collectedCrystals.length}/{totalCrystals}
            </span>
            <div className="h-3 w-px bg-zinc-800" />
            {isPortalUnlocked ? (
              <span className="flex items-center gap-1 text-xs font-medium text-emerald-300">
                <Unlock className="h-3.5 w-3.5" />
                Açık
              </span>
            ) : (
              <span className="flex items-center gap-1 text-xs font-medium text-amber-300">
                <Lock className="h-3.5 w-3.5" />
                Kilitli
              </span>
            )}
          </div>

          {/* Süre ve En İyi Rekor Sayacı */}
          <div className="flex items-center gap-2.5 rounded-xl border border-zinc-800/80 bg-zinc-900/75 px-3.5 py-2 backdrop-blur-xl">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] tracking-wider text-zinc-400 uppercase">
                Süre
              </span>
              <span className="font-mono text-xs font-semibold text-zinc-100">
                {elapsedSeconds.toFixed(1)}sn
              </span>
            </div>

            {currentBestTime !== undefined && (
              <>
                <div className="h-3 w-px bg-zinc-800" />
                <div className="flex items-center gap-1">
                  <Trophy className="h-3.5 w-3.5 text-amber-400" />
                  <span className="font-mono text-xs font-medium text-amber-300">
                    {currentBestTime.toFixed(1)}sn
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Bağlantı Rozeti */}
          <div className="flex items-center gap-1.5 rounded-xl border border-zinc-800/80 bg-zinc-900/75 px-3.5 py-2 backdrop-blur-xl">
            {isControllerPaired ? (
              <>
                <Wifi className="h-3.5 w-3.5 text-emerald-400" />
                <span className="text-xs font-medium text-emerald-300">
                  {latencyMs}ms
                </span>
              </>
            ) : isSocketConnected ? (
              <>
                <Smartphone className="h-3.5 w-3.5 text-amber-400" />
                <span className="font-mono text-xs font-bold text-amber-300">
                  {roomId ?? '...'}
                </span>
              </>
            ) : (
              <>
                <WifiOff className="h-3.5 w-3.5 text-rose-400" />
                <span className="text-xs font-medium text-rose-300">Kopuk</span>
              </>
            )}
          </div>

          {/* Harita Editörü Butonu */}
          <button
            type="button"
            onClick={() => setEditorOpen(true)}
            className="flex cursor-pointer items-center gap-1.5 rounded-xl border border-zinc-800/80 bg-zinc-900/75 px-3 py-2 text-xs font-medium text-zinc-200 transition hover:border-zinc-700 hover:bg-zinc-800/90 active:scale-95"
            title="Özel 3B Harita Editörünü Aç"
          >
            <Wrench className="h-3.5 w-3.5 text-sky-400" />
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
            className="flex cursor-pointer items-center gap-1.5 rounded-xl border border-zinc-800/80 bg-zinc-900/75 px-3 py-2 text-xs font-medium text-zinc-200 transition hover:border-zinc-700 hover:bg-zinc-800/90 active:scale-95"
            title="Küresel Skor Tablosu"
          >
            <Medal className="h-3.5 w-3.5 text-amber-400" />
            <span>Skorlar</span>
          </button>

          {/* Ses Aç/Kapat Butonu */}
          <button
            type="button"
            onClick={toggleSoundMuted}
            className="flex cursor-pointer items-center justify-center rounded-xl border border-zinc-800/80 bg-zinc-900/75 p-2 text-zinc-300 transition hover:border-zinc-700 hover:bg-zinc-800/90 active:scale-95"
            title={isSoundMuted ? 'Sesi Aç' : 'Sesi Kapat'}
          >
            {isSoundMuted ? (
              <VolumeX className="h-4 w-4 text-rose-400" />
            ) : (
              <Volume2 className="h-4 w-4 text-emerald-400" />
            )}
          </button>

          {/* Topu Sıfırla Butonu */}
          <button
            type="button"
            onClick={handleResetClick}
            className="flex cursor-pointer items-center gap-1.5 rounded-xl border border-zinc-800/80 bg-zinc-900/75 px-3 py-2 text-xs font-medium text-zinc-200 transition hover:border-zinc-700 hover:bg-zinc-800/90 active:scale-95"
            title="Topu Başlangıç Noktasına Sıfırla"
          >
            <RotateCcw className="h-3.5 w-3.5 text-zinc-400" />
            <span>Sıfırla</span>
          </button>

          {/* QR Eşleşme Modalı Açma Butonu */}
          <button
            type="button"
            onClick={() => setPairingModalOpen(true)}
            className="flex cursor-pointer items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs font-medium text-emerald-300 transition hover:bg-emerald-500/20 active:scale-95"
          >
            <QrCode className="h-3.5 w-3.5" />
            <span>Eşleştir</span>
          </button>
        </div>
      </header>

      {/* ALT TELEMETRİ PANELİ (BOTTOM TELEMETRY BAR) */}
      <footer className="flex flex-wrap items-end justify-between gap-4">
        <div className="pointer-events-auto flex items-center gap-6 rounded-2xl border border-zinc-800/80 bg-zinc-900/75 px-5 py-3.5 backdrop-blur-xl">
          <div className="flex items-center gap-2 text-xs font-medium text-zinc-400">
            <Compass className="h-4 w-4 text-emerald-400" />
            <span>Canlı Telemetri</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-zinc-400">Eğim (Pitch)</span>
            <div className="relative h-1.5 w-24 overflow-hidden rounded-full bg-zinc-800">
              <div
                ref={pitchBarRef}
                className="h-full w-full rounded-full bg-emerald-400 transition-none"
              />
            </div>
            <span
              ref={pitchTextRef}
              className="w-12 text-right font-mono text-xs text-zinc-200"
            >
              +0.0°
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-zinc-400">Yatış (Roll)</span>
            <div className="relative h-1.5 w-24 overflow-hidden rounded-full bg-zinc-800">
              <div
                ref={rollBarRef}
                className="h-full w-full rounded-full bg-sky-400 transition-none"
              />
            </div>
            <span
              ref={rollTextRef}
              className="w-12 text-right font-mono text-xs text-zinc-200"
            >
              +0.0°
            </span>
          </div>
        </div>

        {!isControllerPaired && (
          <div className="pointer-events-auto flex items-center gap-2 rounded-xl border border-zinc-800/80 bg-zinc-900/75 px-4 py-2.5 text-xs text-zinc-400 backdrop-blur-xl">
            <Keyboard className="h-4 w-4 text-sky-400" />
            <span>
              Masaüstü Test Modu: <strong className="text-zinc-200">WASD</strong>{' '}
              veya <strong className="text-zinc-200">Yön Tuşları</strong> ile
              eğim verebilirsiniz
            </span>
          </div>
        )}
      </footer>

      {/* HARİTA EDİTÖRÜ MODALI */}
      <LevelEditorModal />

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

              {/* Bölüm Sekmeleri */}
              <div className="mb-4 grid grid-cols-5 gap-1.5 rounded-xl border border-zinc-800 bg-zinc-950 p-1.5">
                {MAZE_LEVELS.map((lvl) => (
                  <button
                    key={lvl.id}
                    type="button"
                    onClick={() => setSelectedLeaderboardLevel(lvl.id)}
                    className={`cursor-pointer rounded-lg py-1.5 font-mono text-xs font-semibold transition ${
                      selectedLeaderboardLevel === lvl.id
                        ? 'bg-amber-500 text-zinc-950'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    Bölüm 0{lvl.id}
                  </button>
                ))}
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
                          className={`flex h-6 w-6 items-center justify-center rounded-full font-mono text-xs font-bold ${
                            idx === 0
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

      {/* QR KOD EŞLEŞME VE BAĞLANTI MODALI */}
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
              <div className="mb-4 flex items-center justify-between">
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

              {tunnelUrl && (
                <div className="mb-4 grid grid-cols-2 gap-2 rounded-xl border border-zinc-800 bg-zinc-950 p-1">
                  <button
                    type="button"
                    onClick={() => setConnectionMode('tunnel')}
                    className={`flex cursor-pointer items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-medium transition ${
                      connectionMode === 'tunnel'
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <Globe className="h-3.5 w-3.5" />
                    <span>HTTPS Tüneli (Önerilen)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setConnectionMode('lan')}
                    className={`flex cursor-pointer items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-medium transition ${
                      connectionMode === 'lan'
                        ? 'bg-sky-500/20 text-sky-300'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <Network className="h-3.5 w-3.5" />
                    <span>Yerel Ağ (LAN)</span>
                  </button>
                </div>
              )}

              <p className="mb-5 text-xs leading-relaxed text-zinc-400">
                {tunnelUrl && connectionMode === 'tunnel'
                  ? 'Güvenli HTTPS tüneli aktif! Wi-Fi veya mobil veri (4G/5G) fark etmeksizin QR kodu okutarak doğrudan bağlanabilirsiniz.'
                  : 'Aynı yerel ağdaki telefonunuzla aşağıdaki QR kodu okutarak kablosuz jiroskop kontrolcüsünü başlatın.'}
              </p>

              <div className="mb-5 flex flex-col items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
                <div className="rounded-2xl bg-white p-3.5 shadow-inner">
                  <QRCodeSVG
                    value={controllerUrl}
                    size={172}
                    bgColor="#ffffff"
                    fgColor="#09090b"
                    level="M"
                  />
                </div>

                <div className="mt-4 flex items-center gap-2">
                  <span className="text-xs text-zinc-400">Oda Kodu:</span>
                  <span className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1 font-mono text-base font-bold tracking-widest text-emerald-400">
                    {roomId ?? 'BAĞLANIYOR'}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-2.5">
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-zinc-800 bg-zinc-800/60 px-4 py-3 text-xs font-medium text-zinc-200 transition hover:bg-zinc-800 active:scale-[0.99]"
                >
                  {copied ? (
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
                    className={`flex cursor-pointer items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold transition ${
                      scoreSubmitted
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
