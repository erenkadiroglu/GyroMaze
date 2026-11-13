'use client';

import { useId, useRef, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useDialogBehavior } from './useDialogBehavior';
import { IconButton } from './Buttons';

export interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
}

/**
 * Sağ kenardan kayarak açılan ayarlar paneli.
 */
export function Drawer({ open, onClose, title, children, footer }: DrawerProps) {
  const titleId = useId();
  const containerRef = useRef<HTMLElement | null>(null);
  useDialogBehavior(open, onClose, containerRef);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="drawer-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.16 }}
          className="pointer-events-auto fixed inset-0 z-50 bg-base/45"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <motion.aside
            ref={containerRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            tabIndex={-1}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 380, damping: 38 }}
            className="absolute top-0 right-0 flex h-full w-full max-w-[400px] flex-col border-l border-line bg-surface text-fg shadow-[-24px_0_60px_-30px_rgb(0_0_0/0.6)] outline-none"
          >
            <header className="flex items-center justify-between border-b border-line px-5 py-4">
              <h2 id={titleId} className="text-lg font-semibold">
                {title}
              </h2>
              <IconButton label="Paneli kapat" onClick={onClose} size="sm">
                <X className="h-4 w-4" aria-hidden="true" />
              </IconButton>
            </header>
            <div className="gm-scroll min-h-0 flex-1 overflow-y-auto">
              {children}
            </div>
            {footer && (
              <footer className="border-t border-line bg-surface-2/60 px-5 py-3">
                {footer}
              </footer>
            )}
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
