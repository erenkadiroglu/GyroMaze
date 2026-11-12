'use client';

import { useEffect, useRef } from 'react';

/**
 * Mobil cihazlarda oyun oynanırken ekranın kararmasını veya uykuya geçmesini
 * Screen Wake Lock API üzerinden engeller.
 * Sekme arka plana geçtiğinde ve geri geldiğinde kilidi otomatik yeniden kazanır.
 */
export function useWakeLock(enabled: boolean): void {
  const sentinelRef = useRef<{ release: () => Promise<void> } | null>(null);

  useEffect(() => {
    if (!enabled || typeof navigator === 'undefined') return;

    const nav = navigator as Navigator & {
      wakeLock?: {
        request: (type: 'screen') => Promise<{ release: () => Promise<void> }>;
      };
    };

    if (!nav.wakeLock) return;

    let cancelled = false;

    const acquireLock = async () => {
      try {
        const lock = await nav.wakeLock!.request('screen');
        if (cancelled) {
          void lock.release().catch(() => {});
        } else {
          sentinelRef.current = lock;
        }
      } catch {
        // Pil tasarruf modu veya işletim sistemi kısıtlamasında sessizce geç
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
        void sentinelRef.current.release().catch(() => {});
        sentinelRef.current = null;
      }
    };
  }, [enabled]);
}

