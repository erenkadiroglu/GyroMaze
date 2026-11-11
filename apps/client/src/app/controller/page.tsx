'use client';

import { Suspense, useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Smartphone,
  Compass,
  Crosshair,
  RotateCcw,
  Wifi,
  WifiOff,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react';
import { GyroData } from '@gyromaze/shared';
import { useGameStore } from '@/store/useGameStore';
import { useSocket } from '@/hooks/useSocket';
import { useDeviceOrientation } from '@/hooks/useDeviceOrientation';

/**
 * Mobil cihazın HTML5 jiroskop sensörlerini okuyup <10ms gecikmeyle
 * masaüstü 3B sahnesine ileten kontrolcü arayüzü.
 */
function MobileControllerContent() {
  const searchParams = useSearchParams();
  const initialRoomParam = searchParams.get('room')?.toUpperCase() ?? '';

  const [manualRoomInput, setManualRoomInput] = useState(initialRoomParam);
  const [activeRoomCode, setActiveRoomCode] = useState(initialRoomParam);

  const isSocketConnected = useGameStore((s) => s.isSocketConnected);
  const isControllerPaired = useGameStore((s) => s.isControllerPaired);
  const errorMessage = useGameStore((s) => s.errorMessage);

  // 60 FPS görsel gimbal (su terazisi) referansları
  const gimbalDotRef = useRef<HTMLDivElement | null>(null);
  const pitchValueRef = useRef<HTMLSpanElement | null>(null);
  const rollValueRef = useRef<HTMLSpanElement | null>(null);

  const { emitGyroUpdate, emitCalibrate, emitResetBall } = useSocket({
    role: 'controller',
    targetRoomId: activeRoomCode || null,
  });

  const handleOrientationData = useCallback(
    (data: GyroData) => {
      if (activeRoomCode && isControllerPaired) {
        emitGyroUpdate(activeRoomCode, data);
      }

      // 60 FPS doğrudan DOM mutasyonu ile görsel nişangahı hareket ettir
      if (gimbalDotRef.current) {
        const maxOffsetPx = 72;
        const offsetX = (data.gamma / 35) * maxOffsetPx;
        const offsetY = (data.beta / 35) * maxOffsetPx;
        gimbalDotRef.current.style.transform = `translate3d(${offsetX.toFixed(1)}px, ${offsetY.toFixed(1)}px, 0)`;
      }
      if (pitchValueRef.current) {
        pitchValueRef.current.textContent = `${data.beta >= 0 ? '+' : ''}${data.beta.toFixed(1)}°`;
      }
      if (rollValueRef.current) {
        rollValueRef.current.textContent = `${data.gamma >= 0 ? '+' : ''}${data.gamma.toFixed(1)}°`;
      }
    },
    [activeRoomCode, isControllerPaired, emitGyroUpdate],
  );

  const { permissionState, requestSensorPermission, calibrate } =
    useDeviceOrientation({
      onOrientationData: handleOrientationData,
      enabled: true,
    });

  useEffect(() => {
    if (initialRoomParam) {
      setActiveRoomCode(initialRoomParam);
      setManualRoomInput(initialRoomParam);
    }
  }, [initialRoomParam]);

  const handleActivateSensors = async () => {
    const granted = await requestSensorPermission();
    if (granted) {
      window.setTimeout(() => {
        calibrate();
        emitCalibrate();
      }, 150);
    }
  };

  const handleRecalibrate = () => {
    calibrate();
    emitCalibrate();
  };

  const handleManualConnect = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualRoomInput.trim().length >= 4) {
      setActiveRoomCode(manualRoomInput.trim().toUpperCase());
    }
  };

  return (
    <main className="flex min-h-dvh flex-col justify-between bg-zinc-950 p-5 text-zinc-100 select-none">
      {/* Üst Durum Çubuğu */}
      <header className="flex items-center justify-between rounded-2xl border border-zinc-800/80 bg-zinc-900/80 px-4 py-3 backdrop-blur-xl">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
            <Smartphone className="h-4 w-4" />
          </div>
          <div>
            <h1 className="text-sm font-semibold tracking-tight">
              GyroMaze Kontrolcü
            </h1>
            <p className="text-[11px] text-zinc-400">
              Oda:{' '}
              <span className="font-mono font-semibold text-emerald-400">
                {activeRoomCode || 'SEÇİLMEDİ'}
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 rounded-full border border-zinc-800 bg-zinc-950 px-3 py-1.5 text-xs">
          {isControllerPaired ? (
            <>
              <Wifi className="h-3.5 w-3.5 text-emerald-400" />
              <span className="font-medium text-emerald-300">Eşleşti</span>
            </>
          ) : isSocketConnected ? (
            <>
              <Compass className="h-3.5 w-3.5 animate-spin text-amber-400" />
              <span className="font-medium text-amber-300">Bekleniyor</span>
            </>
          ) : (
            <>
              <WifiOff className="h-3.5 w-3.5 text-rose-400" />
              <span className="font-medium text-rose-300">Bağlantı Yok</span>
            </>
          )}
        </div>
      </header>

      {/* Hata Bildirimi */}
      {errorMessage && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 flex items-center gap-2.5 rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-xs text-rose-200"
        >
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
          <span>{errorMessage}</span>
        </motion.div>
      )}

      {/* Orta Alan: Oda Girişi, Sensör İzni veya Canlı Gimbal Terazisi */}
      <section className="my-auto flex flex-col items-center justify-center py-6">
        {!activeRoomCode ? (
          <form
            onSubmit={handleManualConnect}
            className="w-full max-w-sm space-y-4 rounded-3xl border border-zinc-800 bg-zinc-900/70 p-6 backdrop-blur-xl"
          >
            <h2 className="text-lg font-semibold text-zinc-100">
              Oda Kodunu Girin
            </h2>
            <p className="text-xs leading-relaxed text-zinc-400">
              Masaüstü ekranında görünen 6 haneli oda kodunu girerek eşleşmeyi
              başlatın.
            </p>
            <input
              type="text"
              maxLength={6}
              value={manualRoomInput}
              onChange={(e) => setManualRoomInput(e.target.value.toUpperCase())}
              placeholder="Örn: 84K9X2"
              className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-center font-mono text-lg font-bold tracking-widest text-emerald-400 uppercase outline-none focus:border-emerald-500"
            />
            <button
              type="submit"
              className="w-full cursor-pointer rounded-xl bg-emerald-500 py-3.5 text-xs font-semibold text-zinc-950 transition hover:bg-emerald-400 active:scale-98"
            >
              Odaya Bağlan
            </button>
          </form>
        ) : permissionState !== 'granted' ? (
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-sm space-y-5 rounded-3xl border border-zinc-800 bg-zinc-900/80 p-7 text-center backdrop-blur-xl"
          >
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
              <ShieldCheck className="h-7 w-7" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-zinc-100">
                Jiroskop Sensör İzni
              </h2>
              <p className="text-xs leading-relaxed text-zinc-400">
                Telefonunuzu rahat bir açıyla yatay veya dikey tutun ve sensör
                akışını başlatmak için aşağıdaki butona dokunun.
              </p>
            </div>

            <button
              type="button"
              onClick={handleActivateSensors}
              className="w-full cursor-pointer rounded-2xl bg-emerald-500 py-4 text-sm font-semibold text-zinc-950 shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-400 active:scale-98"
            >
              Sensörleri Etkinleştir ve Başla
            </button>
          </motion.div>
        ) : (
          /* Canlı 2B Jiroskop Ufuk / Su Terazisi Göstergesi */
          <div className="flex flex-col items-center">
            <div className="relative flex h-64 w-64 items-center justify-center rounded-full border border-zinc-800 bg-zinc-900/60 shadow-2xl backdrop-blur-xl">
              {/* İç Derece Halkaları */}
              <div className="pointer-events-none absolute h-44 w-44 rounded-full border border-dashed border-zinc-800" />
              <div className="pointer-events-none absolute h-24 w-24 rounded-full border border-zinc-800/80" />
              <div className="pointer-events-none absolute h-px w-full bg-zinc-800/70" />
              <div className="pointer-events-none absolute h-full w-px bg-zinc-800/70" />

              {/* Hareketli Jiroskop Küresi */}
              <div
                ref={gimbalDotRef}
                className="relative flex h-12 w-12 items-center justify-center rounded-full border border-emerald-300/60 bg-emerald-400/20 shadow-[0_0_30px_rgba(16,185,129,0.45)] transition-none"
              >
                <div className="h-3.5 w-3.5 rounded-full bg-emerald-400" />
              </div>
            </div>

            {/* Sayısal Açı Göstergeleri */}
            <div className="mt-6 grid w-64 grid-cols-2 gap-3">
              <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/70 p-3 text-center">
                <span className="block text-[10px] tracking-wider text-zinc-400 uppercase">
                  Öne / Arkaya (Pitch)
                </span>
                <span
                  ref={pitchValueRef}
                  className="mt-1 block font-mono text-base font-semibold text-emerald-400"
                >
                  +0.0°
                </span>
              </div>
              <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/70 p-3 text-center">
                <span className="block text-[10px] tracking-wider text-zinc-400 uppercase">
                  Sola / Sağa (Roll)
                </span>
                <span
                  ref={rollValueRef}
                  className="mt-1 block font-mono text-base font-semibold text-sky-400"
                >
                  +0.0°
                </span>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Alt Kontrol Butonları */}
      <footer className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={handleRecalibrate}
          className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-emerald-500/30 bg-emerald-500/15 py-4 text-xs font-semibold text-emerald-300 transition active:scale-95"
        >
          <Crosshair className="h-4 w-4" />
          <span>Merkezi Kalibre Et</span>
        </button>

        <button
          type="button"
          onClick={emitResetBall}
          className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-zinc-800 bg-zinc-900 py-4 text-xs font-semibold text-zinc-200 transition active:scale-95"
        >
          <RotateCcw className="h-4 w-4 text-zinc-400" />
          <span>Topu Sıfırla</span>
        </button>
      </footer>
    </main>
  );
}

/**
 * Next.js 15 App Router useSearchParams için Suspense sarmalayıcısı.
 */
export default function ControllerPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-dvh items-center justify-center bg-zinc-950 text-xs text-zinc-400">
          Kontrolcü yükleniyor...
        </div>
      }
    >
      <MobileControllerContent />
    </Suspense>
  );
}

