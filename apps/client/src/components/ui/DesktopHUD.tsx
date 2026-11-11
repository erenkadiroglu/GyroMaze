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
} from 'lucide-react';
import { useGameStore, transientGyro } from '@/store/useGameStore';
import { MAZE_LEVELS } from '@/components/scene/mazeLevels';

/**
 * Masaüstü 3B oyun ekranı üzerinde yer alan minimalist HUD,
 * gerçek zamanlı telemetri göstergesi ve QR eşleşme katmanı.
 */
export function DesktopHUD() {
  const roomId = useGameStore((s) => s.roomId);
  const isSocketConnected = useGameStore((s) => s.isSocketConnected);
  const isControllerPaired = useGameStore((s) => s.isControllerPaired);
  const isPairingModalOpen = useGameStore((s) => s.isPairingModalOpen);
  const setPairingModalOpen = useGameStore((s) => s.setPairingModalOpen);
  const gameStatus = useGameStore((s) => s.gameStatus);
  const setGameStatus = useGameStore((s) => s.setGameStatus);
  const level = useGameStore((s) => s.level);
  const nextLevel = useGameStore((s) => s.nextLevel);
  const latencyMs = useGameStore((s) => s.latencyMs);
  const elapsedSeconds = useGameStore((s) => s.elapsedSeconds);
  const setElapsedSeconds = useGameStore((s) => s.setElapsedSeconds);
  const triggerBallReset = useGameStore((s) => s.triggerBallReset);

  const [copied, setCopied] = useState(false);
  const [originUrl, setOriginUrl] = useState('http://localhost:3000');

  // Re-render tetiklemeden 60 FPS telemetri çubuklarını güncellemek için DOM referansları
  const pitchBarRef = useRef<HTMLDivElement | null>(null);
  const rollBarRef = useRef<HTMLDivElement | null>(null);
  const pitchTextRef = useRef<HTMLSpanElement | null>(null);
  const rollTextRef = useRef<HTMLSpanElement | null>(null);

  const currentLevelInfo =
    MAZE_LEVELS[(level - 1) % MAZE_LEVELS.length] ?? MAZE_LEVELS[0];

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setOriginUrl(window.location.origin);
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

  const controllerUrl = roomId
    ? `${originUrl}/controller?room=${roomId}`
    : `${originUrl}/controller`;

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
    setPairingModalOpen(false);
    setGameStatus('playing');
  };

  return (
    <div className="pointer-events-none fixed inset-0 z-10 flex flex-col justify-between p-6">
      {/* ÜST GÖSTERGE PANELİ (TOP HUD) */}
      <header className="flex flex-wrap items-center justify-between gap-4">
        {/* Sol: Marka ve Bölüm Bilgisi */}
        <div className="pointer-events-auto flex items-center gap-4 rounded-2xl border border-zinc-800/80 bg-zinc-900/75 px-5 py-3 shadow-2xl backdrop-blur-xl">
          <div className="flex items-center gap-2.5">
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
        </div>

        {/* Sağ: Durum, Süre ve Hızlı Aksiyonlar */}
        <div className="pointer-events-auto flex items-center gap-3">
          {/* Süre Sayacı */}
          <div className="flex items-center gap-2 rounded-xl border border-zinc-800/80 bg-zinc-900/75 px-4 py-2.5 backdrop-blur-xl">
            <span className="text-xs tracking-wider text-zinc-400 uppercase">
              Süre
            </span>
            <span className="font-mono text-sm font-semibold text-zinc-100">
              {elapsedSeconds.toFixed(1)}sn
            </span>
          </div>

          {/* Bağlantı ve Gecikme Rozeti */}
          <div className="flex items-center gap-2 rounded-xl border border-zinc-800/80 bg-zinc-900/75 px-4 py-2.5 backdrop-blur-xl">
            {isControllerPaired ? (
              <>
                <Wifi className="h-4 w-4 text-emerald-400" />
                <span className="text-xs font-medium text-emerald-300">
                  Mobil Bağlı • {latencyMs}ms
                </span>
              </>
            ) : isSocketConnected ? (
              <>
                <Smartphone className="h-4 w-4 text-amber-400" />
                <span className="text-xs font-medium text-zinc-300">
                  Oda:{' '}
                  <strong className="font-mono text-amber-300">
                    {roomId ?? '...'}
                  </strong>
                </span>
              </>
            ) : (
              <>
                <WifiOff className="h-4 w-4 text-rose-400" />
                <span className="text-xs font-medium text-rose-300">
                  Sunucu Bekleniyor
                </span>
              </>
            )}
          </div>

          {/* Topu Sıfırla Butonu */}
          <button
            type="button"
            onClick={triggerBallReset}
            className="flex cursor-pointer items-center gap-2 rounded-xl border border-zinc-800/80 bg-zinc-900/75 px-3.5 py-2.5 text-xs font-medium text-zinc-200 transition hover:border-zinc-700 hover:bg-zinc-800/90 active:scale-95"
            title="Topu Başlangıç Noktasına Sıfırla"
          >
            <RotateCcw className="h-4 w-4 text-zinc-400" />
            <span>Sıfırla</span>
          </button>

          {/* QR Eşleşme Modalı Açma Butonu */}
          <button
            type="button"
            onClick={() => setPairingModalOpen(true)}
            className="flex cursor-pointer items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-2.5 text-xs font-medium text-emerald-300 transition hover:bg-emerald-500/20 active:scale-95"
          >
            <QrCode className="h-4 w-4" />
            <span>Cihaz Eşleştir</span>
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

          {/* X Ekseni (Pitch / Beta) */}
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

          {/* Y Ekseni (Roll / Gamma) */}
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

        {/* Klavye İpucu */}
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
              className="w-full max-w-md rounded-3xl border border-zinc-800 bg-zinc-900/95 p-8 shadow-2xl"
            >
              <div className="mb-6 flex items-center justify-between">
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

              <p className="mb-6 text-sm leading-relaxed text-zinc-400">
                Telefonunuzu kablosuz bir jiroskop kumandasına dönüştürmek için
                aşağıdaki QR kodu mobil kameranızla okutun.
              </p>

              {/* QR Kod Kutusu */}
              <div className="mb-6 flex flex-col items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
                <div className="rounded-2xl bg-white p-3.5 shadow-inner">
                  <QRCodeSVG
                    value={controllerUrl}
                    size={176}
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

              {/* Bağlantı Kopyalama ve Klavye ile Devam Etme */}
              <div className="flex flex-col gap-3">
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

      {/* BÖLÜM TAMAMLANDI (ZAFER) MODALI */}
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

              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={triggerBallReset}
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

