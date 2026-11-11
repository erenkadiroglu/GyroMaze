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
  Sun,
  Moon,
  X,
} from 'lucide-react';
import { GyroData } from '@gyromaze/shared';
import { useGameStore } from '@/store/useGameStore';
import { useSocket } from '@/hooks/useSocket';
import { useDeviceOrientation } from '@/hooks/useDeviceOrientation';
import { useAppPreferences } from '@/hooks/useAppPreferences';
import { cx } from '@/components/ui/primitives';

/**
 * Mobil cihazın HTML5 jiroskop sensörlerini ve dokunmatik (touch) sanal gimbal
 * hareketlerini sıfır DOM reflow ve <10ms WebSocket gecikmesiyle masaüstü 3B
 * sahnesine ileten kontrolcü arayüzü.
 */
function MobileControllerContent() {
  useAppPreferences();

  const searchParams = useSearchParams();
  const initialRoomParam =
    searchParams.get('room')?.trim().toUpperCase() ?? '';
  const initialSlotParam = searchParams.get('slot') === '2' ? 2 : 1;

  const [manualRoomInput, setManualRoomInput] = useState(initialRoomParam);
  const [activeRoomCode, setActiveRoomCode] = useState(initialRoomParam);
  const [playerSlot, setPlayerSlot] = useState<1 | 2>(initialSlotParam);
  const playerSlotRef = useRef<1 | 2>(initialSlotParam);
  playerSlotRef.current = playerSlot;
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
  const colorScheme = useGameStore((s) => s.colorScheme);
  const toggleColorScheme = useGameStore((s) => s.toggleColorScheme);

  const activeRoomCodeRef = useRef<string>(activeRoomCode);
  activeRoomCodeRef.current = activeRoomCode;

  const isControllerPairedRef = useRef<boolean>(isControllerPaired);
  isControllerPairedRef.current = isControllerPaired;

  const gimbalPadRef = useRef<HTMLDivElement | null>(null);
  const gimbalDotRef = useRef<HTMLDivElement | null>(null);
  const pitchValueRef = useRef<HTMLSpanElement | null>(null);
  const rollValueRef = useRef<HTMLSpanElement | null>(null);

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
    playerSlot,
  });

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
      liveGyroRef.current.playerSlot = playerSlotRef.current;

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

  useEffect(() => {
    if (isControllerPaired) {
      setIsRoomEditorOpen(false);
    }
  }, [isControllerPaired]);

  const showGimbalSurface =
    (permissionState === 'granted' || isTouchOverride) &&
    Boolean(activeRoomCode) &&
    !isRoomEditorOpen;

  // 60 FPS GPU-hızlandırmalı mobil ufuk küresi ve 8Hz sayısal açı güncellemesi
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
        const maxOffsetPx = 76;
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
      setErrorMessage('Geçerli bir 6 haneli oda kodu girin.');
      return;
    }
    setErrorMessage(null);
    if (cleaned === activeRoomCode) {
      joinRoomByCode(cleaned);
    } else {
      setActiveRoomCode(cleaned);
    }
    setIsRoomEditorOpen(false);
  };

  const levelLabel =
    level === 99
      ? 'Özel'
      : `Bölüm ${level < 10 ? `0${level}` : String(level)}`;

  return (
    <main className="flex min-h-dvh flex-col justify-between bg-base px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))] text-fg select-none">
      {/* ÜST DURUM ÇUBUĞU (Mobil GPU için sıfır backdrop-blur) */}
      <header className="flex items-center justify-between gap-2 rounded-2xl border border-line bg-surface px-3.5 py-2.5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-brass/30 bg-brass/10 text-brass">
            <Smartphone className="h-4 w-4" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-sm leading-tight font-semibold">GyroMaze</h1>
            <div className="flex items-center gap-1.5 text-xs text-muted">
              <span>Oda:</span>
              <span className="gm-num font-semibold tracking-wider text-brass">
                {activeRoomCode || 'Yok'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={toggleColorScheme}
            aria-label={colorScheme === 'light' ? 'Gece moduna geç' : 'Gündüz moduna geç'}
            className="flex min-h-[40px] min-w-[40px] cursor-pointer items-center justify-center rounded-xl border border-line bg-surface-2 active:scale-95"
          >
            {colorScheme === 'light' ? (
              <Sun className="h-4 w-4 text-brass" aria-hidden="true" />
            ) : (
              <Moon className="h-4 w-4 text-signal" aria-hidden="true" />
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              setManualRoomInput(activeRoomCode);
              setIsRoomEditorOpen((prev) => !prev);
            }}
            className="flex min-h-[40px] cursor-pointer items-center gap-1.5 rounded-xl border border-line bg-surface-2 px-3 text-xs font-medium text-fg active:scale-95"
          >
            <KeyRound className="h-3.5 w-3.5 text-brass" aria-hidden="true" />
            <span>{activeRoomCode ? 'Kod' : 'Kod gir'}</span>
          </button>

          <div
            aria-label={
              isControllerPaired
                ? 'Bağlantı durumu: Bağlı'
                : isSocketConnected
                  ? 'Bağlantı durumu: Hazır'
                  : 'Bağlantı durumu: Kopuk'
            }
            className="flex min-h-[40px] items-center gap-1.5 rounded-xl border border-line bg-surface-2 px-3 text-xs font-semibold"
          >
            {isControllerPaired ? (
              <>
                <Wifi className="h-3.5 w-3.5 text-ok" aria-hidden="true" />
                <span className="text-ok">Bağlı</span>
              </>
            ) : isSocketConnected ? (
              <>
                <span className="h-2 w-2 rounded-full bg-brass" aria-hidden="true" />
                <span className="text-brass">Hazır</span>
              </>
            ) : (
              <>
                <WifiOff className="h-3.5 w-3.5 text-danger" aria-hidden="true" />
                <span className="text-danger">Kopuk</span>
              </>
            )}
          </div>
        </div>
      </header>

      {/* HATA BİLDİRİMİ */}
      {errorMessage && (
        <div
          role="alert"
          className="mt-2.5 flex items-center justify-between gap-2 rounded-2xl border border-danger/40 bg-surface px-3.5 py-2.5 text-xs text-danger"
        >
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>{errorMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setIsRoomEditorOpen(true)}
            className="min-h-[34px] shrink-0 rounded-lg border border-danger/40 bg-danger/10 px-2.5 text-xs font-semibold text-danger"
          >
            Yeni kod
          </button>
        </div>
      )}

      {/* BÖLÜM & KRİSTAL ÇUBUĞU (Eşleştiğinde aktif) */}
      {isControllerPaired && !isRoomEditorOpen && (
        <div className="mt-2.5 flex items-center justify-between rounded-2xl border border-line bg-surface px-2.5 py-2">
          <button
            type="button"
            onClick={() => emitChangeLevel('prev')}
            className="flex min-h-[40px] cursor-pointer items-center gap-1 rounded-xl border border-line bg-surface-2 px-3 text-xs font-medium text-fg active:scale-95"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            <span>Önceki</span>
          </button>

          <div className="flex items-center gap-2.5 text-sm">
            <span className="gm-num font-semibold text-brass">{levelLabel}</span>
            <span className="text-line" aria-hidden="true">
              ·
            </span>
            <span className="gm-num flex items-center gap-1 font-semibold text-signal">
              <Gem className="h-3.5 w-3.5" aria-hidden="true" />
              {remoteCrystalsCollected}/{remoteCrystalsTotal}
            </span>
          </div>

          <button
            type="button"
            onClick={() => emitChangeLevel('next')}
            className="flex min-h-[40px] cursor-pointer items-center gap-1 rounded-xl border border-line bg-surface-2 px-3 text-xs font-medium text-fg active:scale-95"
          >
            <span>Sonraki</span>
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      )}

      {/* ZAFER KARTI */}
      {isControllerPaired && gameStatus === 'won' && !isRoomEditorOpen && (
        <div className="mt-2.5 flex items-center justify-between gap-3 rounded-2xl border border-ok/40 bg-surface px-4 py-3">
          <div className="flex items-center gap-2.5">
            <Trophy className="h-5 w-5 shrink-0 text-brass" aria-hidden="true" />
            <div>
              <p className="text-sm font-semibold text-ok">Bölüm tamamlandı</p>
              <p className="text-xs text-muted">
                Telefondan sıradaki bölüme geçebilirsin
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => emitChangeLevel('next')}
            className="flex min-h-[44px] shrink-0 cursor-pointer items-center gap-1.5 rounded-xl bg-brass px-3.5 text-xs font-semibold text-brass-fg active:scale-95"
          >
            <span>Sonraki bölüm</span>
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </div>
      )}

      {/* ORTA ALAN: ODA KODU / İZİN / CANLI GİMBAL */}
      <section className="my-auto flex flex-col items-center justify-center py-3">
        {!activeRoomCode || isRoomEditorOpen ? (
          <form
            onSubmit={handleManualConnect}
            className="w-full max-w-sm space-y-4 rounded-3xl border border-line bg-surface p-6"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-brass/30 bg-brass/10 text-brass">
                  <KeyRound className="h-4 w-4" aria-hidden="true" />
                </div>
                <div>
                  <h2 className="text-base font-semibold">Oda kodu ile bağlan</h2>
                  <p className="text-xs text-muted">
                    Masaüstündeki 6 haneli kodu yaz
                  </p>
                </div>
              </div>
              {activeRoomCode && (
                <button
                  type="button"
                  onClick={() => setIsRoomEditorOpen(false)}
                  aria-label="Oda kodu düzenlemeyi kapat"
                  className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border border-line bg-surface-2 text-muted"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
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
              aria-label="6 haneli oda kodu"
              value={manualRoomInput}
              onChange={(e) =>
                setManualRoomInput(
                  e.target.value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase(),
                )
              }
              placeholder="ÖRN: 84K9X2"
              className="gm-num w-full rounded-2xl border border-line bg-surface-2 px-4 py-3.5 text-center text-2xl font-semibold tracking-[0.25em] text-brass uppercase outline-none focus:border-brass"
            />

            <button
              type="submit"
              className="flex min-h-[48px] w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-brass text-sm font-semibold text-brass-fg active:scale-[0.98]"
            >
              <span>Odaya bağlan</span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </form>
        ) : !showGimbalSurface ? (
          <div className="w-full max-w-sm space-y-4 rounded-3xl border border-line bg-surface p-6 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-brass/30 bg-brass/10 text-brass">
              <ShieldCheck className="h-6 w-6" aria-hidden="true" />
            </div>
            <div className="space-y-1.5">
              <h2 className="text-lg font-semibold">
                Jiroskop sensörlerini başlat
              </h2>
              <p className="text-xs leading-relaxed text-muted">
                Telefonunu rahat bir açıyla tut ve sıfır gecikmeli hareket
                kontrolünü etkinleştir.
              </p>
            </div>

            <button
              type="button"
              onClick={handleActivateSensors}
              className="min-h-[48px] w-full cursor-pointer rounded-2xl bg-brass text-sm font-semibold text-brass-fg active:scale-[0.98]"
            >
              Sensörleri başlat
            </button>

            <button
              type="button"
              onClick={() => setIsTouchOverride(true)}
              className="flex min-h-[44px] w-full cursor-pointer items-center justify-center gap-2 rounded-2xl border border-line bg-surface-2 text-xs font-medium text-fg active:scale-[0.98]"
            >
              <Hand className="h-4 w-4 text-signal" aria-hidden="true" />
              <span>Dokunmatik gimbal ile oyna</span>
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            {/* Canlı 2B Ufuk Pad */}
            <div
              ref={gimbalPadRef}
              onPointerDown={handlePointerDownOnGimbal}
              onPointerMove={handlePointerMoveOnGimbal}
              onPointerUp={handlePointerEndOnGimbal}
              onPointerCancel={handlePointerEndOnGimbal}
              className="relative flex h-60 w-60 touch-none items-center justify-center rounded-full border-2 border-line bg-surface shadow-inner"
            >
              <div
                aria-hidden="true"
                className="pointer-events-none absolute h-40 w-40 rounded-full border border-dashed border-line"
              />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute h-20 w-20 rounded-full border border-line"
              />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute h-px w-full bg-line/70"
              />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute h-full w-px bg-line/70"
              />

              <div
                ref={gimbalDotRef}
                className={cx(
                  'pointer-events-none relative flex h-11 w-11 items-center justify-center rounded-full border will-change-transform',
                  playerSlot === 2
                    ? 'border-warn bg-warn/20'
                    : 'border-brass bg-brass/20',
                )}
              >
                <div
                  className={cx(
                    'h-3.5 w-3.5 rounded-full',
                    playerSlot === 2 ? 'bg-warn' : 'bg-brass',
                  )}
                />
              </div>
            </div>

            <p className="mt-2.5 text-xs text-muted">
              Telefonu eğ veya dairedeki küreyi parmağınla sürükle
            </p>

            {/* Sayısal Açı Göstergeleri (8Hz) */}
            <div className="mt-3 grid w-64 grid-cols-2 gap-2.5">
              <div className="rounded-2xl border border-line bg-surface p-2.5 text-center">
                <span className="block text-xs text-muted">Eğim (Pitch)</span>
                <span
                  ref={pitchValueRef}
                  className="gm-num mt-0.5 block text-lg font-semibold text-signal"
                >
                  +0.0°
                </span>
              </div>
              <div className="rounded-2xl border border-line bg-surface p-2.5 text-center">
                <span className="block text-xs text-muted">Yatış (Roll)</span>
                <span
                  ref={rollValueRef}
                  className="gm-num mt-0.5 block text-lg font-semibold text-signal"
                >
                  +0.0°
                </span>
              </div>
            </div>

            {/* Hassasiyet Seçici */}
            <div
              role="radiogroup"
              aria-label="Jiroskop hassasiyeti"
              className="mt-2.5 grid w-64 grid-cols-3 gap-1 rounded-2xl border border-line bg-surface p-1"
            >
              {(
                [
                  { mult: 0.75, label: 'Hassas' },
                  { mult: 1, label: 'Standart' },
                  { mult: 1.35, label: 'Hızlı' },
                ] as const
              ).map((item) => {
                const active = sensitivityMultiplier === item.mult;
                return (
                  <button
                    key={item.mult}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => setSensitivityMultiplier(item.mult)}
                    className={cx(
                      'min-h-[38px] cursor-pointer rounded-xl text-xs font-semibold transition-colors',
                      active
                        ? 'bg-brass text-brass-fg'
                        : 'text-muted hover:text-fg',
                    )}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>

            {/* Çok Oyunculu Yuva Seçici */}
            <div
              role="radiogroup"
              aria-label="Oyuncu yuvası"
              className="mt-2 grid w-64 grid-cols-2 gap-1 rounded-2xl border border-line bg-surface p-1"
            >
              <button
                type="button"
                role="radio"
                aria-checked={playerSlot === 1}
                onClick={() => setPlayerSlot(1)}
                className={cx(
                  'min-h-[38px] cursor-pointer rounded-xl text-xs font-semibold transition-colors',
                  playerSlot === 1
                    ? 'bg-surface-2 text-brass ring-1 ring-brass/60'
                    : 'text-muted hover:text-fg',
                )}
              >
                1. Oyuncu (Ana)
              </button>
              <button
                type="button"
                role="radio"
                aria-checked={playerSlot === 2}
                onClick={() => setPlayerSlot(2)}
                className={cx(
                  'min-h-[38px] cursor-pointer rounded-xl text-xs font-semibold transition-colors',
                  playerSlot === 2
                    ? 'bg-surface-2 text-warn ring-1 ring-warn/60'
                    : 'text-muted hover:text-fg',
                )}
              >
                2. Oyuncu (Altın)
              </button>
            </div>
          </div>
        )}
      </section>

      {/* ALT EYLEMLER */}
      <footer className="grid grid-cols-2 gap-2.5">
        <button
          type="button"
          onClick={handleRecalibrate}
          className="flex min-h-[48px] cursor-pointer items-center justify-center gap-2 rounded-2xl border border-brass/40 bg-brass/15 text-xs font-semibold text-brass active:scale-95"
        >
          <Crosshair className="h-4 w-4" aria-hidden="true" />
          <span>Merkezi kalibre et</span>
        </button>

        <button
          type="button"
          onClick={emitResetBall}
          className="flex min-h-[48px] cursor-pointer items-center justify-center gap-2 rounded-2xl border border-line bg-surface text-xs font-semibold text-fg active:scale-95"
        >
          <RotateCcw className="h-4 w-4 text-muted" aria-hidden="true" />
          <span>Topu sıfırla</span>
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
        <div className="flex min-h-dvh items-center justify-center bg-base text-xs text-muted">
          Kontrolcü yükleniyor...
        </div>
      }
    >
      <MobileControllerContent />
    </Suspense>
  );
}
