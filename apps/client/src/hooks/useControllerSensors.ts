'use client';

import { useState, useEffect, useCallback, RefObject } from 'react';
import { GyroData } from '@gyromaze/shared';
import { useDeviceOrientation } from './useDeviceOrientation';
import { useWakeLock } from './useWakeLock';
import {
  resolveGimbalSurfaceVisibility,
  shouldTriggerSensorTimeout,
  resolveSensorActivation,
  resolveTouchOverrideToggle,
  isContextInsecure,
} from '@/utils/controllerUtils';

export interface UseControllerSensorsOptions {
  controllerTouchOverride: boolean;
  setControllerTouchOverride: (touch: boolean) => void;
  isRoomEditorOpen: boolean;
  activeRoomCode: string;
  isPointerDraggingRef: RefObject<boolean>;
  pushGyroSample: (beta: number, gamma: number) => void;
  emitCalibrate: () => void;
}

export interface UseControllerSensorsReturn {
  isInsecureContext: boolean;
  sensorSignalTimedOut: boolean;
  permissionState: string;
  hasSensorSignal: boolean;
  showGimbalSurface: boolean;
  handleActivateSensors: () => Promise<void>;
  handleRecalibrate: () => void;
  handleToggleTouchOverride: (touch: boolean) => Promise<void>;
}

/**
 * Mobil kontrolcü HTML5 jiroskop sensör yaşam döngüsü, izin istekleri,
 * güvensiz bağlam tespiti, sensör zaman aşımı ve ekran uyanık kalma (wake lock) kancası.
 */
export function useControllerSensors({
  controllerTouchOverride,
  setControllerTouchOverride,
  isRoomEditorOpen,
  activeRoomCode,
  isPointerDraggingRef,
  pushGyroSample,
  emitCalibrate,
}: UseControllerSensorsOptions): UseControllerSensorsReturn {
  const [isInsecureContext, setIsInsecureContext] = useState(false);
  const [sensorSignalTimedOut, setSensorSignalTimedOut] = useState(false);

  const handleOrientationData = useCallback(
    (data: GyroData) => {
      if (isPointerDraggingRef.current) return;
      pushGyroSample(data.beta, data.gamma);
    },
    [isPointerDraggingRef, pushGyroSample],
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

  // Sensör sinyali bekleme zaman aşımı kontrolü (1500ms)
  useEffect(() => {
    const shouldTimeout = shouldTriggerSensorTimeout(
      controllerTouchOverride,
      isRoomEditorOpen,
      permissionState,
      hasSensorSignal,
    );

    if (!shouldTimeout) {
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

  // Güvensiz bağlam (HTTP) tespiti
  useEffect(() => {
    if (typeof window !== 'undefined' && isContextInsecure(window)) {
      setIsInsecureContext(true);
    }
  }, []);

  const showGimbalSurface = resolveGimbalSurfaceVisibility(
    permissionState,
    controllerTouchOverride,
    activeRoomCode,
    isRoomEditorOpen,
  );

  // Kontrolcü aktifken telefon ekranının kapanmasını Wake Lock API ile engelle
  useWakeLock(showGimbalSurface);

  const handleActivateSensors = useCallback(async () => {
    const granted = await requestSensorPermission();
    const { setTouchOverride, shouldCalibrate } =
      resolveSensorActivation(granted);
    setControllerTouchOverride(setTouchOverride);

    if (shouldCalibrate) {
      calibrate();
      emitCalibrate();
    }
  }, [
    requestSensorPermission,
    setControllerTouchOverride,
    calibrate,
    emitCalibrate,
  ]);

  const handleRecalibrate = useCallback(() => {
    calibrate();
    emitCalibrate();
    pushGyroSample(0, 0);
  }, [calibrate, emitCalibrate, pushGyroSample]);

  const handleToggleTouchOverride = useCallback(
    async (touch: boolean) => {
      const { touchOverride, action } = resolveTouchOverrideToggle(
        touch,
        permissionState,
      );

      if (action === 'activateSensors') {
        await handleActivateSensors();
      } else if (action === 'calibrate') {
        setControllerTouchOverride(false);
        pushGyroSample(0, 0);
      } else {
        setControllerTouchOverride(touchOverride);
        pushGyroSample(0, 0);
      }
    },
    [
      permissionState,
      handleActivateSensors,
      setControllerTouchOverride,
      pushGyroSample,
    ],
  );

  return {
    isInsecureContext,
    sensorSignalTimedOut,
    permissionState,
    hasSensorSignal,
    showGimbalSurface,
    handleActivateSensors,
    handleRecalibrate,
    handleToggleTouchOverride,
  };
}

