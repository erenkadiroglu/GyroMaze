'use client';

import { useRef, useCallback } from 'react';
import type { GyroData } from '@gyromaze/shared';
import { useGameStore } from '@/store/useGameStore';
import { useSocket } from '@/hooks/useSocket';
import { useAppPreferences } from '@/hooks/useAppPreferences';
import { scaleGyroAngles } from '@/utils/controllerUtils';
import {
  resolveCenterStageMode,
  handleSlotSelection,
} from '@/utils/controllerOrchestrationUtils';
import { useControllerRoom } from '@/hooks/useControllerRoom';
import { useGimbalInteraction } from '@/hooks/useGimbalInteraction';
import { useControllerSensors } from '@/hooks/useControllerSensors';

export function useMobileController() {
  useAppPreferences();

  const isSocketConnected = useGameStore((s) => s.isSocketConnected);
  const isControllerPaired = useGameStore((s) => s.isControllerPaired);
  const gameStatus = useGameStore((s) => s.gameStatus);
  const level = useGameStore((s) => s.level);
  const remoteCrystalsCollected = useGameStore((s) => s.remoteCrystalsCollected);
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
  const setControllerSensitivity = useGameStore((s) => s.setControllerSensitivity);
  const controllerTouchOverride = useGameStore((s) => s.controllerTouchOverride);
  const setControllerTouchOverride = useGameStore((s) => s.setControllerTouchOverride);

  const sensitivityRef = useRef<0.75 | 1 | 1.35>(controllerSensitivity);
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

  const stageMode = resolveCenterStageMode(
    activeRoomCode,
    isRoomEditorOpen,
    showGimbalSurface,
  );

  const handleSelectSlot = (slot: 1 | 2) => {
    const { changed, nextSlot } = handleSlotSelection(playerSlot, slot);
    if (changed) {
      pushGyroSample(0, 0);
      setPlayerSlot(nextSlot);
    }
  };

  return {
    // Header state
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

    // Status banners state
    errorMessage,
    level,
    remoteCrystalsCollected,
    remoteCrystalsTotal,
    gameStatus,
    emitChangeLevel,
    emitResetBall,

    // Center stage state
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
    handleToggleTouchOverride: (touch: boolean) => {
      void handleToggleTouchOverride(touch);
    },
    controllerSensitivity,
    setControllerSensitivity,
    sensorSignalTimedOut,
    hasSensorSignal,
    handlePointerDownOnGimbal,
    handlePointerMoveOnGimbal,
    handlePointerEndOnGimbal,

    // Footer state
    showGimbalSurface,
    handleRecalibrate,
  };
}
