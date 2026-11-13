'use client';

import { useMemo, ComponentProps } from 'react';
import { useMobileController } from '@/hooks/useMobileController';
import { ControllerHeader } from '@/app/controller/ControllerHeader';
import { ControllerStatusBanners } from '@/app/controller/ControllerStatusBanners';
import { ControllerCenterStage } from '@/app/controller/ControllerCenterStage';
import { ControllerFooter } from '@/app/controller/ControllerFooter';
import {
  resolveMobileControllerViewState,
  ResolvedMobileControllerViewState,
} from '@/utils/mobileControllerViewOrchestrationUtils';

export interface UseMobileControllerViewResult {
  state: ResolvedMobileControllerViewState;
  containerProps: ResolvedMobileControllerViewState['containerProps'];
  headerProps: ComponentProps<typeof ControllerHeader>;
  bannersProps: ComponentProps<typeof ControllerStatusBanners>;
  centerStageProps: ComponentProps<typeof ControllerCenterStage>;
  footerProps: ComponentProps<typeof ControllerFooter>;
}

/**
 * Mobil kontrolcü ana görünümünün (MobileControllerView) yaşam döngüsünü,
 * 4 ana görsel bölgesinin prop paketlerini ve semantik main kapsayıcısını koordine eden orkestratör kanca.
 */
export function useMobileControllerView(): UseMobileControllerViewResult {
  const controller = useMobileController();

  const state = useMemo(
    () =>
      resolveMobileControllerViewState({
        activeRoomCode: controller.activeRoomCode,
        playerSlot: controller.playerSlot,
        isControllerPaired: controller.isControllerPaired,
        isSocketConnected: controller.isSocketConnected,
        stageMode: controller.stageMode,
        level: controller.level,
        gameStatus: controller.gameStatus,
        hasSensorSignal: controller.hasSensorSignal,
        latencyMs: controller.latencyMs,
      }),
    [
      controller.activeRoomCode,
      controller.playerSlot,
      controller.isControllerPaired,
      controller.isSocketConnected,
      controller.stageMode,
      controller.level,
      controller.gameStatus,
      controller.hasSensorSignal,
      controller.latencyMs,
    ],
  );

  const headerProps: ComponentProps<typeof ControllerHeader> = useMemo(
    () => ({
      activeRoomCode: controller.activeRoomCode,
      playerSlot: controller.playerSlot,
      isHapticEnabled: controller.isHapticEnabled,
      onToggleHaptic: controller.toggleHapticEnabled,
      colorScheme: controller.colorScheme,
      onToggleColorScheme: controller.toggleColorScheme,
      isRoomEditorOpen: controller.isRoomEditorOpen,
      onOpenRoomEditor: controller.openRoomEditor,
      onCloseRoomEditor: controller.closeRoomEditor,
      isControllerPaired: controller.isControllerPaired,
      isSocketConnected: controller.isSocketConnected,
      latencyMs: controller.latencyMs,
    }),
    [
      controller.activeRoomCode,
      controller.playerSlot,
      controller.isHapticEnabled,
      controller.toggleHapticEnabled,
      controller.colorScheme,
      controller.toggleColorScheme,
      controller.isRoomEditorOpen,
      controller.openRoomEditor,
      controller.closeRoomEditor,
      controller.isControllerPaired,
      controller.isSocketConnected,
      controller.latencyMs,
    ],
  );

  const bannersProps: ComponentProps<typeof ControllerStatusBanners> = useMemo(
    () => ({
      errorMessage: controller.errorMessage,
      onOpenRoomEditor: controller.openRoomEditor,
      isControllerPaired: controller.isControllerPaired,
      isRoomEditorOpen: controller.isRoomEditorOpen,
      level: controller.level,
      remoteCrystalsCollected: controller.remoteCrystalsCollected,
      remoteCrystalsTotal: controller.remoteCrystalsTotal,
      gameStatus: controller.gameStatus,
      onChangeLevel: controller.emitChangeLevel,
      onResetBall: controller.emitResetBall,
    }),
    [
      controller.errorMessage,
      controller.openRoomEditor,
      controller.isControllerPaired,
      controller.isRoomEditorOpen,
      controller.level,
      controller.remoteCrystalsCollected,
      controller.remoteCrystalsTotal,
      controller.gameStatus,
      controller.emitChangeLevel,
      controller.emitResetBall,
    ],
  );

  const centerStageProps: ComponentProps<typeof ControllerCenterStage> = useMemo(
    () => ({
      stageMode: controller.stageMode,
      manualRoomInput: controller.manualRoomInput,
      setManualRoomInput: controller.setManualRoomInput,
      roomFormError: controller.roomFormError,
      setRoomFormError: controller.setRoomFormError,
      recentRooms: controller.recentRooms,
      activeRoomCode: controller.activeRoomCode,
      onCloseRoomEditor: controller.activeRoomCode
        ? controller.closeRoomEditor
        : undefined,
      onSubmitRoomCode: controller.handleManualConnect,
      isInsecureContext: controller.isInsecureContext,
      onActivateSensors: controller.handleActivateSensors,
      onEnableTouchMode: () => controller.setControllerTouchOverride(true),
      gimbalPadRef: controller.gimbalPadRef,
      gimbalDotRef: controller.gimbalDotRef,
      pitchValueRef: controller.pitchValueRef,
      rollValueRef: controller.rollValueRef,
      playerSlot: controller.playerSlot,
      onSelectSlot: controller.handleSelectSlot,
      controllerTouchOverride: controller.controllerTouchOverride,
      onToggleTouchOverride: controller.handleToggleTouchOverride,
      controllerSensitivity: controller.controllerSensitivity,
      onSelectSensitivity: controller.setControllerSensitivity,
      isControllerPaired: controller.isControllerPaired,
      errorMessage: controller.errorMessage,
      sensorSignalTimedOut: controller.sensorSignalTimedOut,
      hasSensorSignal: controller.hasSensorSignal,
      onPointerDownOnGimbal: controller.handlePointerDownOnGimbal,
      onPointerMoveOnGimbal: controller.handlePointerMoveOnGimbal,
      onPointerEndOnGimbal: controller.handlePointerEndOnGimbal,
    }),
    [
      controller.stageMode,
      controller.manualRoomInput,
      controller.setManualRoomInput,
      controller.roomFormError,
      controller.setRoomFormError,
      controller.recentRooms,
      controller.activeRoomCode,
      controller.closeRoomEditor,
      controller.handleManualConnect,
      controller.isInsecureContext,
      controller.handleActivateSensors,
      controller.setControllerTouchOverride,
      controller.gimbalPadRef,
      controller.gimbalDotRef,
      controller.pitchValueRef,
      controller.rollValueRef,
      controller.playerSlot,
      controller.handleSelectSlot,
      controller.controllerTouchOverride,
      controller.handleToggleTouchOverride,
      controller.controllerSensitivity,
      controller.setControllerSensitivity,
      controller.isControllerPaired,
      controller.errorMessage,
      controller.sensorSignalTimedOut,
      controller.hasSensorSignal,
      controller.handlePointerDownOnGimbal,
      controller.handlePointerMoveOnGimbal,
      controller.handlePointerEndOnGimbal,
    ],
  );

  const footerProps: ComponentProps<typeof ControllerFooter> = useMemo(
    () => ({
      showGimbalSurface: controller.showGimbalSurface,
      isControllerPaired: controller.isControllerPaired,
      isSocketConnected: controller.isSocketConnected,
      onRecalibrate: controller.handleRecalibrate,
      onResetBall: controller.emitResetBall,
    }),
    [
      controller.showGimbalSurface,
      controller.isControllerPaired,
      controller.isSocketConnected,
      controller.handleRecalibrate,
      controller.emitResetBall,
    ],
  );

  return {
    state,
    containerProps: state.containerProps,
    headerProps,
    bannersProps,
    centerStageProps,
    footerProps,
  };
}
