'use client';

import { Suspense, useRef, useCallback } from 'react';
import { GyroData } from '@gyromaze/shared';
import { useGameStore } from '@/store/useGameStore';
import { useSocket } from '@/hooks/useSocket';
import { useAppPreferences } from '@/hooks/useAppPreferences';
import { scaleGyroAngles, resolveSlotChange } from '@/utils/controllerUtils';
import { useControllerRoom } from '@/hooks/useControllerRoom';
import { useGimbalInteraction } from '@/hooks/useGimbalInteraction';
import { useControllerSensors } from '@/hooks/useControllerSensors';
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

  const isControllerPairedRef = useRef<boolean>(isControllerPaired);
  isControllerPairedRef.current = isControllerPaired;

  const liveGyroRef = useRef<GyroData>({
    alpha: 0,
    beta: 0,
    gamma: 0,
    timestamp: 0,
  });

  const joinRoomRef = useRef<((code: string) => void) | null>(null);

  const {
    activeRoomCode,
    manualRoomInput,
    setManualRoomInput,
    playerSlot,
    setPlayerSlot,
    playerSlotRef,
    isRoomEditorOpen,
    roomFormError,
    setRoomFormError,
    openRoomEditor,
    closeRoomEditor,
    handleManualConnect,
  } = useControllerRoom({
    isSocketConnected,
    isControllerPaired,
    joinRoomByCode: (code) => joinRoomRef.current?.(code),
    setErrorMessage,
  });

  const activeRoomCodeRef = useRef<string>(activeRoomCode);
  activeRoomCodeRef.current = activeRoomCode;

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
  joinRoomRef.current = joinRoomByCode;

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
    [emitGyroUpdate, playerSlotRef],
  );

  const {
    gimbalPadRef,
    gimbalDotRef,
    pitchValueRef,
    rollValueRef,
    isPointerDraggingRef,
    handlePointerDownOnGimbal,
    handlePointerMoveOnGimbal,
    handlePointerEndOnGimbal,
  } = useGimbalInteraction({
    showGimbalSurface: !isRoomEditorOpen && Boolean(activeRoomCode),
    liveGyroRef,
    pushGyroSample,
  });

  const {
    isInsecureContext,
    sensorSignalTimedOut,
    permissionState,
    hasSensorSignal,
    showGimbalSurface,
    handleActivateSensors,
    handleRecalibrate,
    handleToggleTouchOverride,
  } = useControllerSensors({
    controllerTouchOverride,
    setControllerTouchOverride,
    isRoomEditorOpen,
    activeRoomCode,
    isPointerDraggingRef,
    pushGyroSample,
    emitCalibrate,
  });

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
              const { changed, nextSlot } = resolveSlotChange(playerSlot, slot);
              if (changed) {
                pushGyroSample(0, 0);
                setPlayerSlot(nextSlot);
              }
            }}
            controllerTouchOverride={controllerTouchOverride}
            onToggleTouchOverride={handleToggleTouchOverride}
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
