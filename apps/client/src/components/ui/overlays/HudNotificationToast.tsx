'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  getToastMotionVariants,
  resolveToastAriaLive,
  isNotificationPresent,
} from '@/utils/overlayBarUtils';
import { ToastContent } from './toast';

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
  const isVisible = isNotificationPresent(notification);
  const ariaLive = resolveToastAriaLive(notification?.tone);
  const variants = getToastMotionVariants();

  return (
    <AnimatePresence>
      {isVisible && notification && (
        <motion.div
          key={notification.id}
          role="status"
          aria-live={ariaLive}
          initial={variants.initial}
          animate={variants.animate}
          exit={variants.exit}
          className="pointer-events-none fixed top-20 left-1/2 z-30 -translate-x-1/2"
        >
          <ToastContent
            message={notification.message}
            tone={notification.tone}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
