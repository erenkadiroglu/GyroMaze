'use client';

import { Smartphone, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/useGameStore';
import { resolveHudNotificationTone } from '@/utils/hudUtils';
import { Button, cx } from './primitives';

export interface DesktopHUDOverlaysProps {
  isAnyOverlayOpen: boolean;
}

/**
 * Masaüstü HUD sahne üzeri duraklatma/bağlantı kurtarma çubuğu ve
 * geçici durum bildirim kartları (HUD Notifications).
 */
export function DesktopHUDOverlays({
  isAnyOverlayOpen,
}: DesktopHUDOverlaysProps) {
  const gameStatus = useGameStore((s) => s.gameStatus);
  const setGameStatus = useGameStore((s) => s.setGameStatus);
  const setPairingModalOpen = useGameStore((s) => s.setPairingModalOpen);
  const hudNotification = useGameStore((s) => s.hudNotification);

  const toneClasses = resolveHudNotificationTone(hudNotification?.tone);

  return (
    <>
      {/* DURAKLATMA / BAĞLANTI KOPTU KURTARMA ÇUBUĞU */}
      {gameStatus === 'paused' && !isAnyOverlayOpen && (
        <div
          role="status"
          aria-live="polite"
          className="pointer-events-auto fixed top-20 left-1/2 z-20 flex -translate-x-1/2 items-center gap-3 rounded-2xl border border-warn/45 bg-surface/95 px-4 py-2 text-sm shadow-xl backdrop-blur-md"
        >
          <span className="font-medium text-warn">
            Kontrolcü bağlantısı koptu — oyun duraklatıldı
          </span>
          <div className="flex items-center gap-1.5">
            <Button
              variant="secondary"
              size="sm"
              icon={<Smartphone className="h-3.5 w-3.5" aria-hidden="true" />}
              onClick={() => setPairingModalOpen(true)}
            >
              Bağla
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={<ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />}
              onClick={() => setGameStatus('playing')}
            >
              Devam et
            </Button>
          </div>
        </div>
      )}

      {/* SAHNE ÜSTÜ KISA BİLDİRİM */}
      <AnimatePresence>
        {hudNotification && (
          <motion.div
            key={hudNotification.id}
            role="status"
            aria-live="polite"
            initial={{ opacity: 0, y: -10, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.97 }}
            className="pointer-events-none fixed top-20 left-1/2 z-30 -translate-x-1/2"
          >
            <div
              className={cx(
                'rounded-2xl border bg-surface/95 px-4 py-2 text-sm font-medium shadow-xl backdrop-blur-md',
                toneClasses.borderClass,
                toneClasses.textClass,
              )}
            >
              {hudNotification.message}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

