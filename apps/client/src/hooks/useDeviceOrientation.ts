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
    smoothedRef.current.beta = 0;
    smoothedRef.current.gamma = 0;
    calibratedRef.current.beta = 0;
    calibratedRef.current.gamma = 0;
    calibratedRef.current.timestamp = Date.now();
  }, []);

  useEffect(() => {
    if (!enabled || permissionState !== 'granted') {
      return;
    }

    const wrapDelta = (angle: number) => ((((angle + 540) % 360) - 180));

    const handleOrientation = (event: DeviceOrientationEvent) => {
      const alpha = event.alpha ?? 0;
      const beta = event.beta ?? 0;
      const gamma = event.gamma ?? 0;

      rawAnglesRef.current.alpha = alpha;
      rawAnglesRef.current.beta = beta;
      rawAnglesRef.current.gamma = gamma;

      let deltaBeta = wrapDelta(beta - calibrationRef.current.betaOffset);
      let deltaGamma = wrapDelta(gamma - calibrationRef.current.gammaOffset);

      // Mikro el titremelerini sönümlemek için 0.2 derecelik minimal ölü bölge
      if (Math.abs(deltaBeta) < 0.2) deltaBeta = 0;
      if (Math.abs(deltaGamma) < 0.2) deltaGamma = 0;

      // MEMS sensör gürültüsünü gecikme yaratmadan temizleyen hızlı üstel filtre (EMA = 0.72)
      smoothedRef.current.beta +=
        (deltaBeta - smoothedRef.current.beta) * 0.72;
      smoothedRef.current.gamma +=
        (deltaGamma - smoothedRef.current.gamma) * 0.72;

      // Maksimum ±35 derece sınırlandırma ve saf kayan nokta yuvarlama (sıfır nesne/string tahsisi)
      const clampedBeta =
        Math.round(Math.max(-35, Math.min(35, smoothedRef.current.beta)) * 10) /
        10;
      const clampedGamma =
        Math.round(
          Math.max(-35, Math.min(35, smoothedRef.current.gamma)) * 10,
        ) / 10;

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
