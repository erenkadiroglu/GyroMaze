'use client';

import { useEffect, useRef } from 'react';
import {
  isWakeLockSupported,
  shouldAcquireWakeLock,
  requestScreenWakeLock,
  releaseWakeLock,
  type WakeLockSentinelLike,
} from '@/utils/wakeLockUtils';

/**
 * Mobil cihazlarda oyun oynanırken ekranın kararmasını veya uykuya geçmesini
 * Screen Wake Lock API üzerinden engeller.
 * Sekme arka plana geçtiğinde ve geri geldiğinde kilidi otomatik yeniden kazanır.
 */
export function useWakeLock(enabled: boolean): void {
  const sentinelRef = useRef<WakeLockSentinelLike | null>(null);

  useEffect(() => {
    if (typeof navigator === 'undefined') return;

    const supported = isWakeLockSupported(navigator);
    if (!supported) return;

    let cancelled = false;

    const acquireLock = async () => {
      const visibility = typeof document !== 'undefined' ? document.visibilityState : 'visible';
      if (!shouldAcquireWakeLock(enabled, supported, visibility)) return;

      const lock = await requestScreenWakeLock(navigator);
      if (cancelled) {
        void releaseWakeLock(lock);
      } else {
        sentinelRef.current = lock;
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        void acquireLock();
      }
    };

    void acquireLock();
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (sentinelRef.current) {
        void releaseWakeLock(sentinelRef.current);
        sentinelRef.current = null;
      }
    };
  }, [enabled]);
}
