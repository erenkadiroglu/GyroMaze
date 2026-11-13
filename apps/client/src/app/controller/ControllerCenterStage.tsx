'use client';

import type { RefObject } from 'react';
import type { CenterStageMode } from '@/utils/controllerOrchestrationUtils';
import { ControllerRoomCard } from './ControllerRoomCard';
import { ControllerSensorCard } from './ControllerSensorCard';
import { ControllerGimbalPad } from './ControllerGimbalPad';
import {
  getCenterStageAriaLabel,
  getCenterStageContainerClass,
} from '@/utils/controllerCenterStageUtils';

export interface ControllerCenterStageProps {
  stageMode: CenterStageMode;
  // Room card props
  manualRoomInput: string;
  setManualRoomInput: (val: string) => void;
  roomFormError: string | null;
  setRoomFormError: (err: string | null) => void;
  recentRooms: string[];
  activeRoomCode: string;
  onCloseRoomEditor?: () => void;
  onSubmitRoomCode: (e: React.FormEvent) => void;
  // Sensor card props
  isInsecureContext: boolean;
  onActivateSensors: () => void;
  onEnableTouchMode: () => void;
  // Gimbal pad props
  gimbalPadRef: RefObject<HTMLDivElement | null>;
  gimbalDotRef: RefObject<HTMLDivElement | null>;
  pitchValueRef: RefObject<HTMLSpanElement | null>;
  rollValueRef: RefObject<HTMLSpanElement | null>;
  playerSlot: 1 | 2;
  onSelectSlot: (slot: 1 | 2) => void;
  controllerTouchOverride: boolean;
  onToggleTouchOverride: (touch: boolean) => void;
  controllerSensitivity: 0.75 | 1 | 1.35;
  onSelectSensitivity: (val: 0.75 | 1 | 1.35) => void;
  isControllerPaired: boolean;
  errorMessage: string | null;
  sensorSignalTimedOut: boolean;
  hasSensorSignal: boolean;
  onPointerDownOnGimbal: (e: React.PointerEvent<HTMLDivElement>) => void;
  onPointerMoveOnGimbal: (e: React.PointerEvent<HTMLDivElement>) => void;
  onPointerEndOnGimbal: (e: React.PointerEvent<HTMLDivElement>) => void;
}

/**
 * Mobil kontrolcü ekranının merkezindeki içerik aşamasını (Oda Kartı, İzin Kartı veya Canlı Gimbal) yönetir.
 */
export function ControllerCenterStage({
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
}: ControllerCenterStageProps) {
  return (
    <section
      role="region"
      aria-label={getCenterStageAriaLabel(stageMode)}
      className={getCenterStageContainerClass()}
    >
      {stageMode === 'room' ? (
        <ControllerRoomCard
          manualRoomInput={manualRoomInput}
          setManualRoomInput={setManualRoomInput}
          roomFormError={roomFormError}
          setRoomFormError={setRoomFormError}
          recentRooms={recentRooms}
          activeRoomCode={activeRoomCode}
          onClose={onCloseRoomEditor}
          onSubmit={onSubmitRoomCode}
        />
      ) : stageMode === 'sensor' ? (
        <ControllerSensorCard
          isInsecureContext={isInsecureContext}
          onActivateSensors={onActivateSensors}
          onEnableTouchMode={onEnableTouchMode}
        />
      ) : (
        <ControllerGimbalPad
          gimbalPadRef={gimbalPadRef}
          gimbalDotRef={gimbalDotRef}
          pitchValueRef={pitchValueRef}
          rollValueRef={rollValueRef}
          playerSlot={playerSlot}
          onSelectSlot={onSelectSlot}
          controllerTouchOverride={controllerTouchOverride}
          onToggleTouchOverride={onToggleTouchOverride}
          controllerSensitivity={controllerSensitivity}
          onSelectSensitivity={onSelectSensitivity}
          isControllerPaired={isControllerPaired}
          errorMessage={errorMessage}
          sensorSignalTimedOut={sensorSignalTimedOut}
          hasSensorSignal={hasSensorSignal}
          onPointerDown={onPointerDownOnGimbal}
          onPointerMove={onPointerMoveOnGimbal}
          onPointerEnd={onPointerEndOnGimbal}
        />
      )}
    </section>
  );
}
