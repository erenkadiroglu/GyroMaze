'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { GyroData, CalibrationOffset } from '@gyromaze/shared';
import {
  calculateFilteredOrientation,
  resolveSensorInitialPermission,
} from '@/utils/orientationFilterUtils';

/**
 * iOS 13+ Safari tarayıcılarında bulunan izin fonksiyonu için genişletilmiş tip.
 */
interface DeviceOrientationEventiOS extends DeviceOrientationEvent {
  requestPermission?: () => Promise<'granted' | 'denied'>;
}

interface UseDeviceOrientationOptions {
  /** Jiroskop verisi her güncellendiğinde tetiklenen geri çağırım */
  onOrientationData?: (data: GyroData) => void;
  /** Veri gönderiminin aktif olup olmadığı */
  enabled?: boolean;
}

/**
 * HTML5 Device Orientation API üzerinden mobil cihazın eğim açılarını sıfır GC (Garbage Collection)
 * maliyetiyle okuyan, kalibrasyon (tare) ve ölü bölge filtrelemesi uygulayan hook.
 */
export function useDeviceOrientation({
  onOrientationData,
  enabled = true,
}: UseDeviceOrientationOptions = {}) {
  const [permissionState, setPermissionState] = useState<
    'prompt' | 'granted' | 'denied' | 'unsupported'
  >(() =>
    resolveSensorInitialPermission(
      typeof window !== 'undefined',
      typeof window !== 'undefined' && 'DeviceOrientationEvent' in window,
    ),
  );
  const [hasSensorSignal, setHasSensorSignal] = useState(false);

  const onOrientationDataRef = useRef(onOrientationData);
  onOrientationDataRef.current = onOrientationData;
  const hasSignalRef = useRef(false);
  const pendingAutoCalibrateRef = useRef(false);

  const rawAnglesRef = useRef<{ alpha: number; beta: number; gamma: number }>({
    alpha: 0,
    beta: 0,
    gamma: 0,
  });

  const calibrationRef = useRef<CalibrationOffset>({
    betaOffset: 0,
    gammaOffset: 0,
  });

  const calibratedRef = useRef<GyroData>({
    alpha: 0,
    beta: 0,
    gamma: 0,
    timestamp: 0,
  });

  const smoothedRef = useRef<{ beta: number; gamma: number }>({
    beta: 0,
    gamma: 0,
  });

  /**
   * iOS 13+ cihazlarda kullanıcı etkileşimiyle sensör izni ister.
   */
  const requestSensorPermission = useCallback(async (): Promise<boolean> => {
    if (typeof window === 'undefined' || !('DeviceOrientationEvent' in window)) {
      setPermissionState('unsupported');
      return false;
    }

    const OrientationEvent =
      DeviceOrientationEvent as unknown as DeviceOrientationEventiOS;

    if (typeof OrientationEvent.requestPermission === 'function') {
      try {
        const response = await OrientationEvent.requestPermission();
        if (response === 'granted') {
          pendingAutoCalibrateRef.current = true;
        }
        setPermissionState(response);
        return response === 'granted';
      } catch {
        setPermissionState('denied');
        return false;
      }
    }

    pendingAutoCalibrateRef.current = true;
    setPermissionState('granted');
    return true;
  }, []);

  /**
   * Kullanıcının telefonu o an tuttuğu açıyı (0, 0) referans noktası olarak kaydeder.
   */
  const calibrate = useCallback(() => {
    if (!hasSignalRef.current) {
      pendingAutoCalibrateRef.current = true;
    }
    calibrationRef.current.betaOffset = rawAnglesRef.current.beta;
    calibrationRef.current.gammaOffset = rawAnglesRef.current.gamma;
    smoothedRef.current.beta = 0;
    smoothedRef.current.gamma = 0;
    calibratedRef.current.beta = 0;
    calibratedRef.current.gamma = 0;
    calibratedRef.current.timestamp = Date.now();
  }, []);

  useEffect(() => {
    if (!enabled || permissionState !== 'granted') {
      hasSignalRef.current = false;
      setHasSensorSignal(false);
      return;
    }

    const handleOrientation = (event: DeviceOrientationEvent) => {
      if (event.beta === null && event.gamma === null) {
        return;
      }

      const alpha =
        typeof event.alpha === 'number' && Number.isFinite(event.alpha)
          ? event.alpha
          : 0;
      const beta =
        typeof event.beta === 'number' && Number.isFinite(event.beta)
          ? event.beta
          : 0;
      const gamma =
        typeof event.gamma === 'number' && Number.isFinite(event.gamma)
          ? event.gamma
          : 0;

      rawAnglesRef.current.alpha = alpha;
      rawAnglesRef.current.beta = beta;
      rawAnglesRef.current.gamma = gamma;

      if (!hasSignalRef.current) {
        hasSignalRef.current = true;
        setHasSensorSignal(true);
      }
      if (pendingAutoCalibrateRef.current) {
        pendingAutoCalibrateRef.current = false;
        calibrationRef.current.betaOffset = beta;
        calibrationRef.current.gammaOffset = gamma;
        smoothedRef.current.beta = 0;
        smoothedRef.current.gamma = 0;
      }

      const { gyroData, nextSmoothed } = calculateFilteredOrientation({
        rawAlpha: alpha,
        rawBeta: beta,
        rawGamma: gamma,
        calibration: calibrationRef.current,
        currentSmoothed: smoothedRef.current,
      });

      smoothedRef.current = nextSmoothed;
      calibratedRef.current = gyroData;

      onOrientationDataRef.current?.(calibratedRef.current);
    };

    window.addEventListener('deviceorientation', handleOrientation, {
      passive: true,
    });
    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, [enabled, permissionState]);

  return {
    permissionState,
    hasSensorSignal,
    requestSensorPermission,
    calibrate,
    calibratedRef,
  };
}
