'use client';

import type { RefObject } from 'react';
import { GimbalTouchSurface } from './gimbal/GimbalTouchSurface';
import { GimbalInstructionStatus } from './gimbal/GimbalInstructionStatus';
import { GimbalPitchRollReadout } from './gimbal/GimbalPitchRollReadout';
import { GimbalControlSelectors } from './gimbal/GimbalControlSelectors';

interface ControllerGimbalPadProps {
  gimbalPadRef: RefObject<HTMLDivElement | null>;
  gimbalDotRef: RefObject<HTMLDivElement | null>;
  pitchValueRef: RefObject<HTMLSpanElement | null>;
  rollValueRef: RefObject<HTMLSpanElement | null>;
  playerSlot: 1 | 2;
  onSelectSlot: (slot: 1 | 2) => void;
  controllerTouchOverride: boolean;
  onToggleTouchOverride: (touch: boolean) => void;
  controllerSensitivity: 0.75 | 1 | 1.35;
  onSelectSensitivity: (mult: 0.75 | 1 | 1.35) => void;
  isControllerPaired: boolean;
  errorMessage: string | null;
  sensorSignalTimedOut: boolean;
  hasSensorSignal: boolean;
  onPointerDown: (e: React.PointerEvent<HTMLDivElement>) => void;
  onPointerMove: (e: React.PointerEvent<HTMLDivElement>) => void;
  onPointerEnd: (e: React.PointerEvent<HTMLDivElement>) => void;
}

/**
 * 2B Sanal Gimbal Pad'i, canlı telemetri değerlerini ve kontrol radyo butonlarını birleştiren modüler bileşen.
 */
export function ControllerGimbalPad({
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
  onPointerDown,
  onPointerMove,
  onPointerEnd,
}: ControllerGimbalPadProps) {
  return (
    <div className="flex flex-col items-center">
      {/* Canlı 2B Ufuk Pad Dairesi */}
      <GimbalTouchSurface
        gimbalPadRef={gimbalPadRef}
        gimbalDotRef={gimbalDotRef}
        playerSlot={playerSlot}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerEnd={onPointerEnd}
      />

      {/* Yönerge Metni ve Eşleşme/Sensör Durumları */}
      <GimbalInstructionStatus
        controllerTouchOverride={controllerTouchOverride}
        isControllerPaired={isControllerPaired}
        errorMessage={errorMessage}
        sensorSignalTimedOut={sensorSignalTimedOut}
        hasSensorSignal={hasSensorSignal}
      />

      {/* Sayısal Eğim ve Yatış Telemetri Göstergesi */}
      <GimbalPitchRollReadout
        pitchValueRef={pitchValueRef}
        rollValueRef={rollValueRef}
      />

      {/* Kontrol Modu, Hassasiyet ve Yuva Seçicileri */}
      <GimbalControlSelectors
        controllerTouchOverride={controllerTouchOverride}
        onToggleTouchOverride={onToggleTouchOverride}
        controllerSensitivity={controllerSensitivity}
        onSelectSensitivity={onSelectSensitivity}
        playerSlot={playerSlot}
        onSelectSlot={onSelectSlot}
      />
    </div>
  );
}
