'use client';

import { Suspense, useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { GyroData } from '@gyromaze/shared';
import { useGameStore } from '@/store/useGameStore';
import { useSocket } from '@/hooks/useSocket';
import { useDeviceOrientation } from '@/hooks/useDeviceOrientation';
import { useAppPreferences } from '@/hooks/useAppPreferences';
import {
  cleanRoomCode,
  validateRoomCode,
  calculateGimbalTouchAngles,
  calculateGimbalDotOffset,
  formatGimbalAngle,
  scaleGyroAngles,
} from '@/utils/controllerUtils';
import { ControllerHeader } from './ControllerHeader';
import { ControllerStatusBanners } from './ControllerStatusBanners';
import { ControllerRoomCard } from './ControllerRoomCard';
import { ControllerSensorCard } from './ControllerSensorCard';
import { ControllerGimbalPad } from './ControllerGimbalPad';
import { ControllerFooter } from './ControllerFooter';

/**
 * Mobil cihazın HTML5 jiroskop sensörlerini ve dokunmatik (touch) sanal gimbal
 * hareketlerini sıfır DOM reflow ve <10ms WebSocket gecikmesiyle masaüstü 3B
 * sahnesine ileten kontrolcü arayüzü.
 */
function MobileControllerContent() {
  useAppPreferences();

  const searchParams = useSearchParams();
  const initialRoomParam = cleanRoomCode(searchParams.get('room') ?? '');
  const initialSlotParam = searchParams.get('slot') === '2' ? 2 : 1;

  const [manualRoomInput, setManualRoomInput] = useState(initialRoomParam);
  const [activeRoomCode, setActiveRoomCode] = useState(initialRoomParam);
  const [playerSlot, setPlayerSlot] = useState<1 | 2>(initialSlotParam);
  const playerSlotRef = useRef<1 | 2>(initialSlotParam);
  playerSlotRef.current = playerSlot;
  const [isRoomEditorOpen, setIsRoomEditorOpen] = useState(!initialRoomParam);
  const [roomFormError, setRoomFormError] = useState<string | null>(null);
  const [isInsecureContext, setIsInsecureContext] = useState(false);
  const [sensorSignalTimedOut, setSensorSignalTimedOut] = useState(false);

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
  const latencyMs = useGameStore((s) => s.latencyMs);
  const isHapticEnabled = useGameStore((s) => s.isHapticEnabled);
  const toggleHapticEnabled = useGameStore((s) => s.toggleHapticEnabled);
  const recentRooms = useGameStore((s) => s.recentRooms);
  const controllerSensitivity = useGameStore((s) => s.controllerSensitivity);
  const setControllerSensitivity = useGameStore(
    (s) => s.setControllerSensitivity,
  );
  const controllerTouchOverride = useGameStore(
    (s) => s.controllerTouchOverride,
  );
  const setControllerTouchOverride = useGameStore(
    (s) => s.setControllerTouchOverride,
  );

  const sensitivityRef = useRef<number>(controllerSensitivity);
  sensitivityRef.current = controllerSensitivity;

  const activeRoomCodeRef = useRef<string>(activeRoomCode);
  activeRoomCodeRef.current = activeRoomCode;

  const isControllerPairedRef = useRef<boolean>(isControllerPaired);
  isControllerPairedRef.current = isControllerPaired;

  const gimbalPadRef = useRef<HTMLDivElement | null>(null);
  const gimbalDotRef = useRef<HTMLDivElement | null>(null);
  const pitchValueRef = useRef<HTMLSpanElement | null>(null);
  const rollValueRef = useRef<HTMLSpanElement | null>(null);

  const isPointerDraggingRef = useRef<boolean>(false);
  const activePointerIdRef = useRef<number | null>(null);
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
      const { beta: scaledBeta, gamma: scaledGamma } = scaleGyroAngles(
        beta,
        gamma,
        sensitivityRef.current,
        35,
      );

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

  const {
    permissionState,
    hasSensorSignal,
    requestSensorPermission,
    calibrate,
  } = useDeviceOrientation({
    onOrientationData: handleOrientationData,
    enabled: !controllerTouchOverride && !isRoomEditorOpen,
  });

  useEffect(() => {
    if (
      controllerTouchOverride ||
      isRoomEditorOpen ||
      permissionState !== 'granted' ||
      hasSensorSignal
    ) {
      setSensorSignalTimedOut(false);
      return;
    }
    const timer = window.setTimeout(() => {
      setSensorSignalTimedOut(true);
    }, 1500);
    return () => window.clearTimeout(timer);
  }, [
    controllerTouchOverride,
    isRoomEditorOpen,
    permissionState,
    hasSensorSignal,
  ]);

  useEffect(() => {
    setPlayerSlot(initialSlotParam);
    if (initialRoomParam) {
      setActiveRoomCode(initialRoomParam);
      setManualRoomInput(initialRoomParam);
      setIsRoomEditorOpen(false);
    }
  }, [initialRoomParam, initialSlotParam]);

  useEffect(() => {
    if (typeof window !== 'undefined' && !window.isSecureContext) {
      setIsInsecureContext(true);
    }
  }, []);

  useEffect(() => {
    if (isControllerPaired) {
      setIsRoomEditorOpen(false);
    }
  }, [isControllerPaired]);

  const showGimbalSurface =
    (permissionState === 'granted' || controllerTouchOverride) &&
    Boolean(activeRoomCode) &&
    !isRoomEditorOpen;

  // Gimbal yüzeyi kapandığında, sekme gizlendiğinde veya pencere odağı kaybedildiğinde takılı sürüklemeyi ve eğimi sıfırla
  const wasGimbalVisibleRef = useRef(false);
  useEffect(() => {
    const resetActiveDrag = () => {
      if (isPointerDraggingRef.current || activePointerIdRef.current !== null) {
        isPointerDraggingRef.current = false;
        activePointerIdRef.current = null;
        pushGyroSample(0, 0);
      }
    };

    if (!showGimbalSurface) {
      if (wasGimbalVisibleRef.current) {
        wasGimbalVisibleRef.current = false;
        isPointerDraggingRef.current = false;
        activePointerIdRef.current = null;
        pushGyroSample(0, 0);
      }
      return;
    }

    wasGimbalVisibleRef.current = true;
    const onVisibilityChange = () => {
      if (document.hidden) {
        resetActiveDrag();
      }
    };
    window.addEventListener('blur', resetActiveDrag);
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => {
      window.removeEventListener('blur', resetActiveDrag);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [showGimbalSurface, pushGyroSample]);

  // Kontrolcü aktifken telefon ekranının kapanmasını Wake Lock API ile engelle
  useEffect(() => {
    if (!showGimbalSurface || typeof navigator === 'undefined') return;
    const nav = navigator as Navigator & {
      wakeLock?: {
        request: (type: 'screen') => Promise<{ release: () => Promise<void> }>;
      };
    };
    if (!nav.wakeLock) return;

    let sentinel: { release: () => Promise<void> } | null = null;
    let cancelled = false;

    const acquireWakeLock = async () => {
      try {
        const lock = await nav.wakeLock!.request('screen');
        if (cancelled) {
          void lock.release().catch(() => {});
        } else {
          sentinel = lock;
        }
      } catch {
        // Pil tasarrufu veya tarayıcı kısıtı varsa sessizce geç
      }
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        void acquireWakeLock();
      }
    };

    void acquireWakeLock();
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', onVisibilityChange);
      void sentinel?.release().catch(() => {});
    };
  }, [showGimbalSurface]);

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
        const { offsetX, offsetY } = calculateGimbalDotOffset(beta, gamma, 68, 35);

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
        const nextPitchStr = formatGimbalAngle(beta);
        const nextRollStr = formatGimbalAngle(gamma);

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
      setControllerTouchOverride(false);
      calibrate();
      emitCalibrate();
    } else {
      setControllerTouchOverride(true);
    }
  };

  const handleRecalibrate = () => {
    calibrate();
    emitCalibrate();
    pushGyroSample(0, 0);
  };

  const updatePointerSample = (clientX: number, clientY: number) => {
    const { beta, gamma } = calculateGimbalTouchAngles(
      clientX,
      clientY,
      gimbalBoundsRef.current,
      28,
    );
    pushGyroSample(beta, gamma);
  };

  const handlePointerDownOnGimbal = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!gimbalPadRef.current || activePointerIdRef.current !== null) return;
    activePointerIdRef.current = e.pointerId;
    isPointerDraggingRef.current = true;
    const rect = gimbalPadRef.current.getBoundingClientRect();
    gimbalBoundsRef.current.centerX = rect.left + rect.width * 0.5;
    gimbalBoundsRef.current.centerY = rect.top + rect.height * 0.5;
    gimbalBoundsRef.current.maxRadius = Math.max(40, rect.width * 0.5 - 24);

    e.currentTarget.setPointerCapture(e.pointerId);
    updatePointerSample(e.clientX, e.clientY);
  };

  const handlePointerMoveOnGimbal = (e: React.PointerEvent<HTMLDivElement>) => {
    if (
      !isPointerDraggingRef.current ||
      activePointerIdRef.current !== e.pointerId
    ) {
      return;
    }
    updatePointerSample(e.clientX, e.clientY);
  };

  const handlePointerEndOnGimbal = (e: React.PointerEvent<HTMLDivElement>) => {
    if (
      !isPointerDraggingRef.current ||
      activePointerIdRef.current !== e.pointerId
    ) {
      return;
    }
    isPointerDraggingRef.current = false;
    activePointerIdRef.current = null;
    pushGyroSample(0, 0);
  };

  const openRoomEditor = () => {
    setManualRoomInput(activeRoomCode);
    setRoomFormError(null);
    setIsRoomEditorOpen(true);
  };

  const closeRoomEditor = () => {
    setRoomFormError(null);
    setIsRoomEditorOpen(false);
  };

  const handleManualConnect = (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateRoomCode(manualRoomInput);
    if (!validation.valid) {
      setRoomFormError(validation.error);
      return;
    }
    const cleaned = validation.cleanCode;
    if (cleaned === activeRoomCode) {
      if (!isSocketConnected) {
        setRoomFormError(
          'Sunucu bağlantısı bekleniyor; bağlantı kurulunca tekrar deneyin.',
        );
        return;
      }
      setRoomFormError(null);
      setErrorMessage(null);
      joinRoomByCode(cleaned);
    } else {
      setRoomFormError(null);
      setErrorMessage(null);
      setActiveRoomCode(cleaned);
    }
    setIsRoomEditorOpen(false);
  };

  return (
    <main className="flex min-h-dvh flex-col justify-between bg-base px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))] text-fg select-none">
      {/* ÜST DURUM ÇUBUĞU */}
      <ControllerHeader
        activeRoomCode={activeRoomCode}
        playerSlot={playerSlot}
        isHapticEnabled={isHapticEnabled}
        onToggleHaptic={toggleHapticEnabled}
        colorScheme={colorScheme}
        onToggleColorScheme={toggleColorScheme}
        isRoomEditorOpen={isRoomEditorOpen}
        onOpenRoomEditor={openRoomEditor}
        onCloseRoomEditor={closeRoomEditor}
        isControllerPaired={isControllerPaired}
        isSocketConnected={isSocketConnected}
        latencyMs={latencyMs}
      />

      {/* DURUM, BÖLÜM VE BİLDİRİM ŞERİTLERİ */}
      <ControllerStatusBanners
        errorMessage={errorMessage}
        onOpenRoomEditor={openRoomEditor}
        isControllerPaired={isControllerPaired}
        isRoomEditorOpen={isRoomEditorOpen}
        level={level}
        remoteCrystalsCollected={remoteCrystalsCollected}
        remoteCrystalsTotal={remoteCrystalsTotal}
        gameStatus={gameStatus}
        onChangeLevel={emitChangeLevel}
        onResetBall={emitResetBall}
      />

      {/* ORTA ALAN: ODA KODU / İZİN / CANLI GİMBAL */}
      <section className="my-auto flex flex-col items-center justify-center py-3">
        {!activeRoomCode || isRoomEditorOpen ? (
          <ControllerRoomCard
            manualRoomInput={manualRoomInput}
            setManualRoomInput={setManualRoomInput}
            roomFormError={roomFormError}
            setRoomFormError={setRoomFormError}
            recentRooms={recentRooms}
            activeRoomCode={activeRoomCode}
            onClose={activeRoomCode ? closeRoomEditor : undefined}
            onSubmit={handleManualConnect}
          />
        ) : !showGimbalSurface ? (
          <ControllerSensorCard
            isInsecureContext={isInsecureContext}
            onActivateSensors={handleActivateSensors}
            onEnableTouchMode={() => setControllerTouchOverride(true)}
          />
        ) : (
          <ControllerGimbalPad
            gimbalPadRef={gimbalPadRef}
            gimbalDotRef={gimbalDotRef}
            pitchValueRef={pitchValueRef}
            rollValueRef={rollValueRef}
            playerSlot={playerSlot}
            onSelectSlot={(slot) => {
              if (playerSlot !== slot) {
                pushGyroSample(0, 0);
                setPlayerSlot(slot);
              }
            }}
            controllerTouchOverride={controllerTouchOverride}
            onToggleTouchOverride={async (touch) => {
              if (!touch) {
                if (permissionState === 'granted') {
                  setControllerTouchOverride(false);
                  pushGyroSample(0, 0);
                } else {
                  await handleActivateSensors();
                }
              } else {
                setControllerTouchOverride(true);
                pushGyroSample(0, 0);
              }
            }}
            controllerSensitivity={controllerSensitivity}
            onSelectSensitivity={setControllerSensitivity}
            isControllerPaired={isControllerPaired}
            errorMessage={errorMessage}
            sensorSignalTimedOut={sensorSignalTimedOut}
            hasSensorSignal={hasSensorSignal}
            onPointerDown={handlePointerDownOnGimbal}
            onPointerMove={handlePointerMoveOnGimbal}
            onPointerEnd={handlePointerEndOnGimbal}
          />
        )}
      </section>

      {/* ALT EYLEMLER */}
      <ControllerFooter
        showGimbalSurface={showGimbalSurface}
        isControllerPaired={isControllerPaired}
        isSocketConnected={isSocketConnected}
        onRecalibrate={handleRecalibrate}
        onResetBall={emitResetBall}
      />
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
