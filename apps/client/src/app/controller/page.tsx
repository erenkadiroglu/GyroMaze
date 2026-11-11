'use client';

import { Suspense, useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Smartphone,
  Crosshair,
  RotateCcw,
  Wifi,
  WifiOff,
  AlertCircle,
  ShieldCheck,
  Hand,
  KeyRound,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Gem,
  Trophy,
  X,
} from 'lucide-react';
import { GyroData } from '@gyromaze/shared';
import { useGameStore } from '@/store/useGameStore';
import { useSocket } from '@/hooks/useSocket';
import { useDeviceOrientation } from '@/hooks/useDeviceOrientation';

/**
 * Mobil cihazın HTML5 jiroskop sensörlerini ve dokunmatik (touch) sanal gimbal
 * hareketlerini sıfır DOM reflow ve <10ms WebSocket gecikmesiyle masaüstü 3B sahnesine ileten kontrolcü arayüzü.
 */
function MobileControllerContent() {
  const searchParams = useSearchParams();
  const initialRoomParam =
    searchParams.get('room')?.trim().toUpperCase() ?? '';

  const [manualRoomInput, setManualRoomInput] = useState(initialRoomParam);
  const [activeRoomCode, setActiveRoomCode] = useState(initialRoomParam);
  const [isRoomEditorOpen, setIsRoomEditorOpen] = useState(!initialRoomParam);
  const [isTouchOverride, setIsTouchOverride] = useState(false);
  const [sensitivityMultiplier, setSensitivityMultiplier] = useState<
    0.75 | 1 | 1.35
  >(1);
  const sensitivityRef = useRef<number>(1);
  sensitivityRef.current = sensitivityMultiplier;

  const isSocketConnected = useGameStore((s) => s.isSocketConnected);
  const isControllerPaired = useGameStore((s) => s.isControllerPaired);
  const gameStatus = useGameStore((s) => s.gameStatus);
  const level = useGameStore((s) => s.level);
  const remoteCrystalsCollected = useGameStore(
    (s) => s.remoteCrystalsCollected,
  );
  const remoteCrystalsTotal = useGameStore((s) => s.remoteCrystalsTotal);
  const errorMessage = useGameStore((s) => s.errorMessage);
  const setErrorMessage = useGameStore((s) => s.setErrorMessage);

  const activeRoomCodeRef = useRef<string>(activeRoomCode);
  activeRoomCodeRef.current = activeRoomCode;

  const isControllerPairedRef = useRef<boolean>(isControllerPaired);
  isControllerPairedRef.current = isControllerPaired;

  const gimbalPadRef = useRef<HTMLDivElement | null>(null);
  const gimbalDotRef = useRef<HTMLDivElement | null>(null);
  const pitchValueRef = useRef<HTMLSpanElement | null>(null);
  const rollValueRef = useRef<HTMLSpanElement | null>(null);

  // Dokunmatik sürükleme sırasında getBoundingClientRect() reflow maliyetini önleyen önbellek
  const isPointerDraggingRef = useRef<boolean>(false);
  const gimbalBoundsRef = useRef<{
    centerX: number;
    centerY: number;
    maxRadius: number;
  }>({
    centerX: 0,
    centerY: 0,
    maxRadius: 100,
  });

  // 60 FPS rAF döngüsünün okuduğu saf jiroskop durumu (React state tetiklemez)
  const liveGyroRef = useRef<GyroData>({
    alpha: 0,
    beta: 0,
    gamma: 0,
    timestamp: 0,
  });

  const {
    emitGyroUpdate,
    joinRoomByCode,
    emitCalibrate,
    emitResetBall,
    emitChangeLevel,
  } = useSocket({
    role: 'controller',
    targetRoomId: activeRoomCode || null,
  });

  /**
   * Sensör veya dokunmatik gimbal verisini ağa gönderir ve rAF tamponuna yazar.
   * DOM manipülasyonu burada yapılmaz; ekran yenileme hızıyla (rAF) senkronize edilir.
   */
  const pushGyroSample = useCallback(
    (beta: number, gamma: number) => {
      const now = Date.now();
      const mult = sensitivityRef.current;
      const scaledBeta =
        Math.round(Math.max(-35, Math.min(35, beta * mult)) * 10) / 10;
      const scaledGamma =
        Math.round(Math.max(-35, Math.min(35, gamma * mult)) * 10) / 10;

      liveGyroRef.current.beta = scaledBeta;
      liveGyroRef.current.gamma = scaledGamma;
      liveGyroRef.current.timestamp = now;

      if (activeRoomCodeRef.current && isControllerPairedRef.current) {
        emitGyroUpdate(activeRoomCodeRef.current, liveGyroRef.current);
      }
    },
    [emitGyroUpdate],
  );

  const handleOrientationData = useCallback(
    (data: GyroData) => {
      if (isPointerDraggingRef.current) return;
      pushGyroSample(data.beta, data.gamma);
    },
    [pushGyroSample],
  );

  const { permissionState, requestSensorPermission, calibrate } =
    useDeviceOrientation({
      onOrientationData: handleOrientationData,
      enabled: !isTouchOverride && !isRoomEditorOpen,
    });

  useEffect(() => {
    if (initialRoomParam) {
      setActiveRoomCode(initialRoomParam);
      setManualRoomInput(initialRoomParam);
      setIsRoomEditorOpen(false);
    }
  }, [initialRoomParam]);

  // Eşleşme gerçekleştiğinde oda kodu giriş panelini otomatik kapat
  useEffect(() => {
    if (isControllerPaired) {
      setIsRoomEditorOpen(false);
    }
  }, [isControllerPaired]);

  const showGimbalSurface =
    (permissionState === 'granted' || isTouchOverride) &&
    Boolean(activeRoomCode) &&
    !isRoomEditorOpen;

  /**
   * Mobil GPU ve ana iş parçacığı (Main Thread) optimizasyonu:
   * - Küre konumu (translate3d) yalnızca piksel farkı >= 0.2px olduğunda güncellenir.
   * - Sayısal metinler (textContent) saniyede 120 kez yerine yalnızca 120ms'de bir (~8Hz) güncellenir.
   */
  useEffect(() => {
    if (!showGimbalSurface) return;

    let rafId = 0;
    let lastRenderedX = 999;
    let lastRenderedY = 999;
    let lastTextUpdateTime = 0;
    let lastPitchStr = '';
    let lastRollStr = '';

    const updateMobileUI = (now: number) => {
      const beta = liveGyroRef.current.beta;
      const gamma = liveGyroRef.current.gamma;

      if (gimbalDotRef.current) {
        const maxOffsetPx = 74;
        const offsetX = (gamma / 35) * maxOffsetPx;
        const offsetY = (beta / 35) * maxOffsetPx;

        if (
          Math.abs(offsetX - lastRenderedX) >= 0.2 ||
          Math.abs(offsetY - lastRenderedY) >= 0.2
        ) {
          lastRenderedX = offsetX;
          lastRenderedY = offsetY;
          gimbalDotRef.current.style.transform = `translate3d(${offsetX.toFixed(1)}px, ${offsetY.toFixed(1)}px, 0)`;
        }
      }

      if (now - lastTextUpdateTime >= 120) {
        lastTextUpdateTime = now;
        const nextPitchStr = `${beta >= 0 ? '+' : ''}${beta.toFixed(1)}°`;
        const nextRollStr = `${gamma >= 0 ? '+' : ''}${gamma.toFixed(1)}°`;

        if (pitchValueRef.current && nextPitchStr !== lastPitchStr) {
          lastPitchStr = nextPitchStr;
          pitchValueRef.current.textContent = nextPitchStr;
        }
        if (rollValueRef.current && nextRollStr !== lastRollStr) {
          lastRollStr = nextRollStr;
          rollValueRef.current.textContent = nextRollStr;
        }
      }

      rafId = window.requestAnimationFrame(updateMobileUI);
    };

    rafId = window.requestAnimationFrame(updateMobileUI);
    return () => window.cancelAnimationFrame(rafId);
  }, [showGimbalSurface]);

  const handleActivateSensors = async () => {
    const granted = await requestSensorPermission();
    if (granted) {
      setIsTouchOverride(false);
      window.setTimeout(() => {
        calibrate();
        emitCalibrate();
      }, 120);
    } else {
      setIsTouchOverride(true);
    }
  };

  const handleRecalibrate = () => {
    calibrate();
    emitCalibrate();
    pushGyroSample(0, 0);
  };

  const updatePointerSample = (clientX: number, clientY: number) => {
    const { centerX, centerY, maxRadius } = gimbalBoundsRef.current;
    const dx = Math.max(-maxRadius, Math.min(maxRadius, clientX - centerX));
    const dy = Math.max(-maxRadius, Math.min(maxRadius, clientY - centerY));

    const gamma = Math.round((dx / maxRadius) * 280) / 10;
    const beta = Math.round((dy / maxRadius) * 280) / 10;

    pushGyroSample(beta, gamma);
  };

  const handlePointerDownOnGimbal = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!gimbalPadRef.current) return;
    isPointerDraggingRef.current = true;
    const rect = gimbalPadRef.current.getBoundingClientRect();
    gimbalBoundsRef.current.centerX = rect.left + rect.width * 0.5;
    gimbalBoundsRef.current.centerY = rect.top + rect.height * 0.5;
    gimbalBoundsRef.current.maxRadius = Math.max(40, rect.width * 0.5 - 24);

    e.currentTarget.setPointerCapture(e.pointerId);
    updatePointerSample(e.clientX, e.clientY);
  };

  const handlePointerMoveOnGimbal = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isPointerDraggingRef.current) return;
    updatePointerSample(e.clientX, e.clientY);
  };

  const handlePointerEndOnGimbal = () => {
    if (!isPointerDraggingRef.current) return;
    isPointerDraggingRef.current = false;
    pushGyroSample(0, 0);
  };

  const handleManualConnect = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = manualRoomInput.trim().toUpperCase();
    if (cleaned.length < 4) {
      setErrorMessage('Lütfen geçerli bir 6 haneli oda kodu girin.');
      return;
    }
    setErrorMessage(null);
    setActiveRoomCode(cleaned);
    joinRoomByCode(cleaned);
    setIsRoomEditorOpen(false);
  };

  return (
    <main className="flex min-h-dvh flex-col justify-between bg-zinc-950 p-4 text-zinc-100 select-none">
      {/* Üst Durum ve Hızlı Oda Değiştirme Çubuğu (Sıfır Blur / Saf GPU Katmanı) */}
      <header className="flex items-center justify-between gap-2 rounded-2xl border border-zinc-800 bg-zinc-900 px-3.5 py-2.5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
            <Smartphone className="h-4 w-4" />
          </div>
          <div>
            <h1 className="text-xs font-semibold tracking-tight text-zinc-100">
              GyroMaze Kontrolcü
            </h1>
            <div className="flex items-center gap-1.5 text-[11px] text-zinc-400">
              <span>Oda:</span>
              <span className="font-mono font-bold tracking-wider text-emerald-400">
                {activeRoomCode || 'YOK'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Oda Kodu Değiştirme / Girme Butonu */}
          <button
            type="button"
            onClick={() => {
              setManualRoomInput(activeRoomCode);
              setIsRoomEditorOpen((prev) => !prev);
            }}
            className="flex cursor-pointer items-center gap-1.5 rounded-xl border border-zinc-700 bg-zinc-800 px-2.5 py-1.5 text-[11px] font-medium text-zinc-200 active:scale-95"
          >
            <KeyRound className="h-3.5 w-3.5 text-emerald-400" />
            <span>{activeRoomCode ? 'Kod Değiştir' : 'Kod Gir'}</span>
          </button>

          {/* Bağlantı Durumu Rozeti */}
          <div className="flex items-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-950 px-2.5 py-1.5 text-[11px]">
            {isControllerPaired ? (
              <>
                <Wifi className="h-3.5 w-3.5 text-emerald-400" />
                <span className="font-medium text-emerald-300">Bağlı</span>
              </>
            ) : isSocketConnected ? (
              <>
                <span className="h-2 w-2 rounded-full bg-amber-400" />
                <span className="font-medium text-amber-300">Hazır</span>
              </>
            ) : (
              <>
                <WifiOff className="h-3.5 w-3.5 text-rose-400" />
                <span className="font-medium text-rose-300">Kopuk</span>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hata Bildirimi */}
      {errorMessage && (
        <div className="mt-2.5 flex items-center justify-between gap-2 rounded-2xl border border-rose-500/30 bg-rose-950/60 px-3.5 py-2.5 text-xs text-rose-200">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
            <span>{errorMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setIsRoomEditorOpen(true)}
            className="shrink-0 rounded-lg bg-rose-500/20 px-2.5 py-1 text-[11px] font-semibold text-rose-200"
          >
            Yeni Kod Gir
          </button>
        </div>
      )}

      {/* Canlı Bölüm, Kristal Durumu ve Hızlı Bölüm Geçiş Çubuğu (Eşleştiğinde Aktif) */}
      {isControllerPaired && !isRoomEditorOpen && (
        <div className="mt-2.5 flex items-center justify-between rounded-2xl border border-zinc-800 bg-zinc-900 px-3 py-2">
          <button
            type="button"
            onClick={() => emitChangeLevel('prev')}
            className="flex cursor-pointer items-center gap-1 rounded-xl border border-zinc-800 bg-zinc-950 px-2.5 py-1.5 text-[11px] font-medium text-zinc-300 active:scale-95"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            <span>Önceki</span>
          </button>

          <div className="flex items-center gap-2.5 text-xs">
            <span className="font-mono font-bold text-emerald-400">
              {level === 99 ? 'ÖZEL' : `BÖLÜM 0${level}`}
            </span>
            <span className="text-zinc-700">•</span>
            <span className="flex items-center gap-1 font-mono text-sky-400">
              <Gem className="h-3.5 w-3.5" />
              {remoteCrystalsCollected}/{remoteCrystalsTotal}
            </span>
          </div>

          <button
            type="button"
            onClick={() => emitChangeLevel('next')}
            className="flex cursor-pointer items-center gap-1 rounded-xl border border-zinc-800 bg-zinc-950 px-2.5 py-1.5 text-[11px] font-medium text-zinc-300 active:scale-95"
          >
            <span>Sonraki</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Bölüm Tamamlandığında Telefondan Tek Dokunuşla Sonraki Bölüme Geçiş Kartı */}
      {isControllerPaired && gameStatus === 'won' && !isRoomEditorOpen && (
        <div className="mt-2.5 flex items-center justify-between gap-3 rounded-2xl border border-emerald-500/40 bg-emerald-950/60 px-4 py-3">
          <div className="flex items-center gap-2.5">
            <Trophy className="h-5 w-5 shrink-0 text-amber-400" />
            <div>
              <p className="text-xs font-semibold text-emerald-300">
                Bölüm Tamamlandı!
              </p>
              <p className="text-[11px] text-zinc-300">
                Masaüstüne dokunmadan devam edin
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => emitChangeLevel('next')}
            className="flex shrink-0 cursor-pointer items-center gap-1.5 rounded-xl bg-emerald-500 px-3.5 py-2 text-xs font-semibold text-zinc-950 active:scale-95"
          >
            <span>Sonraki Bölüm</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Orta Alan: Oda Kodu Girişi, Sensör İzni veya Canlı Gimbal Terazisi */}
      <section className="my-auto flex flex-col items-center justify-center py-3">
        {!activeRoomCode || isRoomEditorOpen ? (
          <form
            onSubmit={handleManualConnect}
            className="w-full max-w-sm space-y-4 rounded-3xl border border-zinc-800 bg-zinc-900 p-6"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
                  <KeyRound className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-zinc-100">
                    Oda Kodu ile Giriş
                  </h2>
                  <p className="text-[11px] text-zinc-400">
                    Masaüstündeki 6 haneli kodu yazın
                  </p>
                </div>
              </div>
              {activeRoomCode && (
                <button
                  type="button"
                  onClick={() => setIsRoomEditorOpen(false)}
                  className="rounded-xl border border-zinc-800 bg-zinc-950 p-2 text-zinc-400"
                  aria-label="Kapat"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <input
              type="text"
              inputMode="text"
              autoCapitalize="characters"
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              maxLength={6}
              value={manualRoomInput}
              onChange={(e) =>
                setManualRoomInput(
                  e.target.value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase(),
                )
              }
              placeholder="ÖRN: 84K9X2"
              className="w-full rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-3.5 text-center font-mono text-2xl font-bold tracking-[0.25em] text-emerald-400 uppercase outline-none focus:border-emerald-500"
            />

            <button
              type="submit"
              className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-emerald-500 py-3.5 text-xs font-semibold text-zinc-950 active:scale-98"
            >
              <span>Oda Koduna Bağlan</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        ) : !showGimbalSurface ? (
          <div className="w-full max-w-sm space-y-4 rounded-3xl border border-zinc-800 bg-zinc-900 p-6 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div className="space-y-1.5">
              <h2 className="text-lg font-semibold text-zinc-100">
                Jiroskop Sensörlerini Başlat
              </h2>
              <p className="text-xs leading-relaxed text-zinc-400">
                Telefonunuzu rahat bir açıyla tutun ve sıfır gecikmeli jiroskop
                kontrolünü etkinleştirin.
              </p>
            </div>

            <button
              type="button"
              onClick={handleActivateSensors}
              className="w-full cursor-pointer rounded-2xl bg-emerald-500 py-3.5 text-sm font-semibold text-zinc-950 active:scale-98"
            >
              Jiroskop Sensörlerini Başlat
            </button>

            <button
              type="button"
              onClick={() => setIsTouchOverride(true)}
              className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl border border-zinc-800 bg-zinc-950 py-3 text-xs font-medium text-zinc-300 active:scale-98"
            >
              <Hand className="h-4 w-4 text-sky-400" />
              <span>Dokunmatik (Touch) Gimbal ile Kullan</span>
            </button>
          </div>
        ) : (
          /* Canlı 2B Jiroskop + Dokunmatik Ufuk Terazisi (Saf Donanım İvmeli Katman) */
          <div className="flex flex-col items-center">
            <div
              ref={gimbalPadRef}
              onPointerDown={handlePointerDownOnGimbal}
              onPointerMove={handlePointerMoveOnGimbal}
              onPointerUp={handlePointerEndOnGimbal}
              onPointerCancel={handlePointerEndOnGimbal}
              className="relative flex h-60 w-60 touch-none items-center justify-center rounded-full border-2 border-zinc-800 bg-zinc-900"
            >
              {/* İç Derece Halkaları */}
              <div className="pointer-events-none absolute h-40 w-40 rounded-full border border-dashed border-zinc-800" />
              <div className="pointer-events-none absolute h-20 w-20 rounded-full border border-zinc-800" />
              <div className="pointer-events-none absolute h-px w-full bg-zinc-800" />
              <div className="pointer-events-none absolute h-full w-px bg-zinc-800" />

              {/* Hareketli Jiroskop Küresi (Saf Composite Layer: will-change-transform) */}
              <div
                ref={gimbalDotRef}
                className="pointer-events-none relative flex h-11 w-11 items-center justify-center rounded-full border border-emerald-400 bg-emerald-500/20 will-change-transform"
              >
                <div className="h-3.5 w-3.5 rounded-full bg-emerald-400" />
              </div>
            </div>

            <p className="mt-2.5 text-[11px] text-zinc-400">
              Telefonu eğin veya daire içindeki küreyi parmağınızla sürükleyin
            </p>

            {/* Sayısal Açı Göstergeleri (8Hz Throttled DOM Text) */}
            <div className="mt-3.5 grid w-60 grid-cols-2 gap-2.5">
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-2.5 text-center">
                <span className="block text-[10px] tracking-wider text-zinc-400 uppercase">
                  Eğim (Pitch)
                </span>
                <span
                  ref={pitchValueRef}
                  className="mt-0.5 block font-mono text-sm font-semibold text-emerald-400"
                >
                  +0.0°
                </span>
              </div>
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-2.5 text-center">
                <span className="block text-[10px] tracking-wider text-zinc-400 uppercase">
                  Yatış (Roll)
                </span>
                <span
                  ref={rollValueRef}
                  className="mt-0.5 block font-mono text-sm font-semibold text-sky-400"
                >
                  +0.0°
                </span>
              </div>
            </div>

            {/* 3 Kademeli Jiroskop Hassasiyet Seçici */}
            <div className="mt-2.5 grid w-60 grid-cols-3 gap-1.5 rounded-2xl border border-zinc-800 bg-zinc-900 p-1">
              {(
                [
                  { mult: 0.75, label: 'Hassas' },
                  { mult: 1, label: 'Standart' },
                  { mult: 1.35, label: 'Pro (1.35x)' },
                ] as const
              ).map((item) => (
                <button
                  key={item.mult}
                  type="button"
                  onClick={() => setSensitivityMultiplier(item.mult)}
                  className={`cursor-pointer rounded-xl py-1.5 text-[11px] font-semibold ${
                    sensitivityMultiplier === item.mult
                      ? 'bg-emerald-500 text-zinc-950'
                      : 'text-zinc-400'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Alt Kontrol Butonları */}
      <footer className="grid grid-cols-2 gap-2.5">
        <button
          type="button"
          onClick={handleRecalibrate}
          className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-emerald-500/30 bg-emerald-500/15 py-3.5 text-xs font-semibold text-emerald-300 active:scale-95"
        >
          <Crosshair className="h-4 w-4" />
          <span>Merkezi Kalibre Et</span>
        </button>

        <button
          type="button"
          onClick={emitResetBall}
          className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-zinc-800 bg-zinc-900 py-3.5 text-xs font-semibold text-zinc-200 active:scale-95"
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
