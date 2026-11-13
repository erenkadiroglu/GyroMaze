'use client';

import { useMobileController } from '@/hooks/useMobileController';
import { ControllerHeader } from './ControllerHeader';
import { ControllerStatusBanners } from './ControllerStatusBanners';
import { ControllerCenterStage } from './ControllerCenterStage';
import { ControllerFooter } from './ControllerFooter';
import {
  getControllerMainAriaLabel,
  getControllerMainContainerClass,
} from '@/utils/controllerViewUtils';

/**
 * Mobil cihazın HTML5 jiroskop sensörlerini ve dokunmatik (touch) sanal gimbal
 * hareketlerini sıfır DOM reflow ve <10ms WebSocket gecikmesiyle masaüstü 3B
 * sahnesine ileten modüler kontrolcü görünüm orkestratörü.
 */
export function MobileControllerView() {
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
    <main
      role="application"
      aria-label={getControllerMainAriaLabel()}
      className={getControllerMainContainerClass()}
    >
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

