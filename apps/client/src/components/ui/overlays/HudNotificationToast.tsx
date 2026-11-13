'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { resolveHudNotificationTone } from '@/utils/hudUtils';
import { getToastMotionVariants } from '@/utils/overlayBarUtils';
import { cx } from '../primitives';

export interface HudNotificationData {
  id: number;
  message: string;
  tone: 'warn' | 'info' | 'success';
  seq?: number;
}

interface HudNotificationToastProps {
  notification: HudNotificationData | null;
}

/**
 * Sahne üstünde beliren geçici durum veya başarı bildirim kartı (HUD Toast).
 */
export function HudNotificationToast({ notification }: HudNotificationToastProps) {
  const toneClasses = resolveHudNotificationTone(notification?.tone);
  const variants = getToastMotionVariants();

  return (
    <AnimatePresence>
      {notification && (
        <motion.div
          key={notification.id}
          role="status"
          aria-live="polite"
          initial={variants.initial}
          animate={variants.animate}
          exit={variants.exit}
          className="pointer-events-none fixed top-20 left-1/2 z-30 -translate-x-1/2"
        >
          <div
            className={cx(
              'rounded-2xl border bg-surface/95 px-4 py-2 text-sm font-medium shadow-xl backdrop-blur-md',
              toneClasses.borderClass,
              toneClasses.textClass,
            )}
          >
            {notification.message}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
