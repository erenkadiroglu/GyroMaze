'use client';

import type { RefObject } from 'react';
import type { CenterStageMode } from '@/utils/controllerOrchestrationUtils';
import { useControllerCenterStage } from '@/hooks/useControllerCenterStage';
import { ControllerRoomCard } from './ControllerRoomCard';
import { ControllerSensorCard } from './ControllerSensorCard';
import { ControllerGimbalPad } from './ControllerGimbalPad';

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
 * Mobil kontrolcü ekranının merkezindeki içerik aşamasını (Oda Kartı, İzin Kartı veya Canlı Gimbal)
 * useControllerCenterStage kancası ile koordine eden orkestratör bileşen.
 */
export function ControllerCenterStage(props: ControllerCenterStageProps) {
  const {
    state,
    containerProps,
    roomCardProps,
    sensorCardProps,
    gimbalPadProps,
  } = useControllerCenterStage(props);

  const { descriptor } = state;

  return (
    <section {...containerProps}>
      {descriptor.isRoom ? (
        <ControllerRoomCard {...roomCardProps} />
      ) : descriptor.isSensor ? (
        <ControllerSensorCard {...sensorCardProps} />
      ) : (
        <ControllerGimbalPad {...gimbalPadProps} />
      )}
    </section>
  );
}
