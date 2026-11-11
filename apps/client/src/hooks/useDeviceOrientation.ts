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
 * HTML5 Device Orientation API üzerinden mobil cihazın eğim açılarını sıfır GC (Garbage Collection)
 * maliyetiyle okuyan, kalibrasyon (tare) ve ölü bölge filtrelemesi uygulayan hook.
 */
export function useDeviceOrientation({
  onOrientationData,
  enabled = true,
}: UseDeviceOrientationOptions = {}) {
  const [permissionState, setPermissionState] = useState<
    'prompt' | 'granted' | 'denied' | 'unsupported'
  >('prompt');

  const onOrientationDataRef = useRef(onOrientationData);
  onOrientationDataRef.current = onOrientationData;

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
    calibrationRef.current.betaOffset = rawAnglesRef.current.beta;
    calibrationRef.current.gammaOffset = rawAnglesRef.current.gamma;
  }, []);

  useEffect(() => {
    if (!enabled || permissionState !== 'granted') {
      return;
    }

    const handleOrientation = (event: DeviceOrientationEvent) => {
      const alpha = event.alpha ?? 0;
      const beta = event.beta ?? 0;
      const gamma = event.gamma ?? 0;

      rawAnglesRef.current.alpha = alpha;
      rawAnglesRef.current.beta = beta;
      rawAnglesRef.current.gamma = gamma;

      let deltaBeta = beta - calibrationRef.current.betaOffset;
      let deltaGamma = gamma - calibrationRef.current.gammaOffset;

      // Mikro el titremelerini sönümlemek için 0.25 derecelik minimal ölü bölge
      if (Math.abs(deltaBeta) < 0.25) deltaBeta = 0;
      if (Math.abs(deltaGamma) < 0.25) deltaGamma = 0;

      // Maksimum ±35 derece sınırlandırma ve saf kayan nokta yuvarlama (sıfır string tahsisi)
      const clampedBeta =
        Math.round(Math.max(-35, Math.min(35, deltaBeta)) * 10) / 10;
      const clampedGamma =
        Math.round(Math.max(-35, Math.min(35, deltaGamma)) * 10) / 10;

      calibratedRef.current.alpha = Math.round(alpha * 10) / 10;
      calibratedRef.current.beta = clampedBeta;
      calibratedRef.current.gamma = clampedGamma;
      calibratedRef.current.timestamp = Date.now();

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
    requestSensorPermission,
    calibrate,
    calibratedRef,
  };
}
