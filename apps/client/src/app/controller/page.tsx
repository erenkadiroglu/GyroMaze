'use client';

import { Suspense } from 'react';
import { useMobileController } from '@/hooks/useMobileController';
import { ControllerHeader } from './ControllerHeader';
import { ControllerStatusBanners } from './ControllerStatusBanners';
import { ControllerCenterStage } from './ControllerCenterStage';
import { ControllerFooter } from './ControllerFooter';

/**
 * Mobil cihazın HTML5 jiroskop sensörlerini ve dokunmatik (touch) sanal gimbal
 * hareketlerini sıfır DOM reflow ve <10ms WebSocket gecikmesiyle masaüstü 3B
 * sahnesine ileten modüler kontrolcü arayüzü.
 */
function MobileControllerContent() {
  const {
    // Header
    activeRoomCode,
    playerSlot,
    isHapticEnabled,
    toggleHapticEnabled,
    colorScheme,
    toggleColorScheme,
    isRoomEditorOpen,
    openRoomEditor,
    closeRoomEditor,
    isControllerPaired,
    isSocketConnected,
    latencyMs,

    // Status banners
    errorMessage,
    level,
    remoteCrystalsCollected,
    remoteCrystalsTotal,
    gameStatus,
    emitChangeLevel,
    emitResetBall,

    // Center stage
    stageMode,
    manualRoomInput,
    setManualRoomInput,
    roomFormError,
    setRoomFormError,
    recentRooms,
    handleManualConnect,
    isInsecureContext,
    handleActivateSensors,
    setControllerTouchOverride,
    gimbalPadRef,
    gimbalDotRef,
    pitchValueRef,
    rollValueRef,
    handleSelectSlot,
    controllerTouchOverride,
    handleToggleTouchOverride,
    controllerSensitivity,
    setControllerSensitivity,
    sensorSignalTimedOut,
    hasSensorSignal,
    handlePointerDownOnGimbal,
    handlePointerMoveOnGimbal,
    handlePointerEndOnGimbal,

    // Footer
    showGimbalSurface,
    handleRecalibrate,
  } = useMobileController();

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

      {/* ORTA ALAN: ODA KODU / İZİN / CANLI GİMBAL MERKEZ SAHNESİ */}
      <ControllerCenterStage
        stageMode={stageMode}
        manualRoomInput={manualRoomInput}
        setManualRoomInput={setManualRoomInput}
        roomFormError={roomFormError}
        setRoomFormError={setRoomFormError}
        recentRooms={recentRooms}
        activeRoomCode={activeRoomCode}
        onCloseRoomEditor={activeRoomCode ? closeRoomEditor : undefined}
        onSubmitRoomCode={handleManualConnect}
        isInsecureContext={isInsecureContext}
        onActivateSensors={handleActivateSensors}
        onEnableTouchMode={() => setControllerTouchOverride(true)}
        gimbalPadRef={gimbalPadRef}
        gimbalDotRef={gimbalDotRef}
        pitchValueRef={pitchValueRef}
        rollValueRef={rollValueRef}
        playerSlot={playerSlot}
        onSelectSlot={handleSelectSlot}
        controllerTouchOverride={controllerTouchOverride}
        onToggleTouchOverride={handleToggleTouchOverride}
        controllerSensitivity={controllerSensitivity}
        onSelectSensitivity={setControllerSensitivity}
        isControllerPaired={isControllerPaired}
        errorMessage={errorMessage}
        sensorSignalTimedOut={sensorSignalTimedOut}
        hasSensorSignal={hasSensorSignal}
        onPointerDownOnGimbal={handlePointerDownOnGimbal}
        onPointerMoveOnGimbal={handlePointerMoveOnGimbal}
        onPointerEndOnGimbal={handlePointerEndOnGimbal}
      />

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
