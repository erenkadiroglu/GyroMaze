'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { GyroData, CalibrationOffset } from '@gyromaze/shared';

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
 * HTML5 Device Orientation API üzerinden mobil cihazın eğim açılarını okuyan,
 * kalibrasyon (tare) ve ölü bölge (deadzone) filtrelemesi uygulayan hook.
 */
export function useDeviceOrientation({
  onOrientationData,
  enabled = true,
}: UseDeviceOrientationOptions = {}) {
  const [permissionState, setPermissionState] = useState<
    'prompt' | 'granted' | 'denied' | 'unsupported'
  >('prompt');

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

  /**
   * iOS 13+ cihazlarda kullanıcı etkileşimiyle sensör izni ister.
   * Android ve standart tarayıcılarda doğrudan izin verilmiş kabul eder.
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
        setPermissionState(response);
        return response === 'granted';
      } catch {
        setPermissionState('denied');
        return false;
      }
    }

    setPermissionState('granted');
    return true;
  }, []);

  /**
   * Kullanıcının telefonu o an tuttuğu açıyı (0, 0) referans noktası olarak kaydeder.
   */
  const calibrate = useCallback(() => {
    calibrationRef.current = {
      betaOffset: rawAnglesRef.current.beta,
      gammaOffset: rawAnglesRef.current.gamma,
    };
  }, []);

  useEffect(() => {
    if (!enabled || permissionState !== 'granted') {
      return;
    }

    const handleOrientation = (event: DeviceOrientationEvent) => {
      const alpha = event.alpha ?? 0;
      const beta = event.beta ?? 0;
      const gamma = event.gamma ?? 0;

      rawAnglesRef.current = { alpha, beta, gamma };

      let deltaBeta = beta - calibrationRef.current.betaOffset;
      let deltaGamma = gamma - calibrationRef.current.gammaOffset;

      // Mikro el titremelerini sönümlemek için 0.4 derecelik ölü bölge (deadzone)
      if (Math.abs(deltaBeta) < 0.4) deltaBeta = 0;
      if (Math.abs(deltaGamma) < 0.4) deltaGamma = 0;

      // Maksimum ±35 derece sınırlandırma (Clamping)
      const clampedBeta = Math.max(-35, Math.min(35, deltaBeta));
      const clampedGamma = Math.max(-35, Math.min(35, deltaGamma));

      const payload: GyroData = {
        alpha: Number(alpha.toFixed(2)),
        beta: Number(clampedBeta.toFixed(2)),
        gamma: Number(clampedGamma.toFixed(2)),
        timestamp: Date.now(),
      };

      calibratedRef.current = payload;
      onOrientationData?.(payload);
    };

    window.addEventListener('deviceorientation', handleOrientation, true);
    return () => {
      window.removeEventListener('deviceorientation', handleOrientation, true);
    };
  }, [enabled, permissionState, onOrientationData]);

  return {
    permissionState,
    requestSensorPermission,
    calibrate,
    calibratedRef,
  };
}

