'use client';

import { useMemo, ComponentProps } from 'react';
import type { ControllerCenterStageProps } from '@/app/controller/ControllerCenterStage';
import { ControllerRoomCard } from '@/app/controller/ControllerRoomCard';
import { ControllerSensorCard } from '@/app/controller/ControllerSensorCard';
import { ControllerGimbalPad } from '@/app/controller/ControllerGimbalPad';
import {
  resolveControllerCenterStageState,
  ResolvedControllerCenterStageState,
} from '@/utils/controllerCenterStageOrchestrationUtils';

export interface UseControllerCenterStageResult {
  state: ResolvedControllerCenterStageState;
  containerProps: ResolvedControllerCenterStageState['containerProps'];
  roomCardProps: ComponentProps<typeof ControllerRoomCard>;
  sensorCardProps: ComponentProps<typeof ControllerSensorCard>;
  gimbalPadProps: ComponentProps<typeof ControllerGimbalPad>;
}

/**
 * Mobil kontrolcü merkez sahnesinin (Oda Kartı, Sensör/İzin Kartı veya Canlı Gimbal)
 * durum orkestrasyonunu ve alt prop dağıtımını tek merkezden koordine eden kanca.
 */
export function useControllerCenterStage(
  props: ControllerCenterStageProps,
): UseControllerCenterStageResult {
  const {
    stageMode,
    manualRoomInput,
    setManualRoomInput,
    roomFormError,
    setRoomFormError,
    recentRooms,
    activeRoomCode,
    onCloseRoomEditor,
    onSubmitRoomCode,
    isInsecureContext,
    onActivateSensors,
    onEnableTouchMode,
    gimbalPadRef,
    gimbalDotRef,
    pitchValueRef,
    rollValueRef,
    playerSlot,
    onSelectSlot,
    controllerTouchOverride,
    onToggleTouchOverride,
    controllerSensitivity,
    onSelectSensitivity,
    isControllerPaired,
    errorMessage,
    sensorSignalTimedOut,
    hasSensorSignal,
    onPointerDownOnGimbal,
    onPointerMoveOnGimbal,
    onPointerEndOnGimbal,
  } = props;

  const state = useMemo(
    () =>
      resolveControllerCenterStageState({
        stageMode,
        isControllerPaired,
        controllerTouchOverride,
        controllerSensitivity,
        playerSlot,
        hasSensorSignal,
        sensorSignalTimedOut,
        errorMessage,
        activeRoomCode,
        recentRoomsCount: recentRooms?.length,
        isInsecureContext,
      }),
    [
      stageMode,
      isControllerPaired,
      controllerTouchOverride,
      controllerSensitivity,
      playerSlot,
      hasSensorSignal,
      sensorSignalTimedOut,
      errorMessage,
      activeRoomCode,
      recentRooms?.length,
      isInsecureContext,
    ],
  );

  const roomCardProps: ComponentProps<typeof ControllerRoomCard> = useMemo(
    () => ({
      manualRoomInput,
      setManualRoomInput,
      roomFormError,
      setRoomFormError,
      recentRooms,
      activeRoomCode,
      onClose: onCloseRoomEditor,
      onSubmit: onSubmitRoomCode,
    }),
    [
      manualRoomInput,
      setManualRoomInput,
      roomFormError,
      setRoomFormError,
      recentRooms,
      activeRoomCode,
      onCloseRoomEditor,
      onSubmitRoomCode,
    ],
  );

  const sensorCardProps: ComponentProps<typeof ControllerSensorCard> = useMemo(
    () => ({
      isInsecureContext,
      onActivateSensors,
      onEnableTouchMode,
    }),
    [isInsecureContext, onActivateSensors, onEnableTouchMode],
  );

  const gimbalPadProps: ComponentProps<typeof ControllerGimbalPad> = useMemo(
    () => ({
      gimbalPadRef,
      gimbalDotRef,
      pitchValueRef,
      rollValueRef,
      playerSlot,
      onSelectSlot,
      controllerTouchOverride,
      onToggleTouchOverride,
      controllerSensitivity,
      onSelectSensitivity,
      isControllerPaired,
      errorMessage,
      sensorSignalTimedOut,
      hasSensorSignal,
      onPointerDown: onPointerDownOnGimbal,
      onPointerMove: onPointerMoveOnGimbal,
      onPointerEnd: onPointerEndOnGimbal,
    }),
    [
      gimbalPadRef,
      gimbalDotRef,
      pitchValueRef,
      rollValueRef,
      playerSlot,
      onSelectSlot,
      controllerTouchOverride,
      onToggleTouchOverride,
      controllerSensitivity,
      onSelectSensitivity,
      isControllerPaired,
      errorMessage,
      sensorSignalTimedOut,
      hasSensorSignal,
      onPointerDownOnGimbal,
      onPointerMoveOnGimbal,
      onPointerEndOnGimbal,
    ],
  );

  return {
    state,
    containerProps: state.containerProps,
    roomCardProps,
    sensorCardProps,
    gimbalPadProps,
  };
}
