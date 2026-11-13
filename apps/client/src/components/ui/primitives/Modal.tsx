'use client';

import { useId, useRef, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { cx, getModalWidthClass } from '@/utils/primitiveUtils';
import { useDialogBehavior } from './useDialogBehavior';
import { IconButton } from './Buttons';

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  icon?: ReactNode;
  /** Pencere genişliği */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** Kapatma düğmesini gizler (ör. zafer ekranı) */
  hideClose?: boolean;
  children: ReactNode;
  footer?: ReactNode;
}

/**
 * Erişilebilir modal pencere: `role="dialog"`, `Esc` ve arka plana tıklama ile kapanır.
 */
export function Modal({
  open,
  onClose,
  title,
  description,
  icon,
  size = 'md',
  hideClose,
  children,
  footer,
}: ModalProps) {
  const titleId = useId();
  const descId = useId();
  const containerRef = useRef<HTMLDivElement | null>(null);
  useDialogBehavior(open, onClose, containerRef);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.16 }}
          className="pointer-events-auto fixed inset-0 z-50 flex items-center justify-center bg-base/70 p-4 backdrop-blur-sm"
          onMouseDown={(e) => {
            if (!hideClose && e.target === e.currentTarget) onClose();
          }}
        >
          <motion.div
            ref={containerRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={description ? descId : undefined}
            tabIndex={-1}
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 420, damping: 34 }}
            className={cx(
              'flex max-h-[min(88dvh,820px)] w-full flex-col overflow-hidden rounded-2xl border border-line bg-surface text-fg shadow-[0_24px_60px_-20px_rgb(0_0_0/0.55)] outline-none',
              getModalWidthClass(size),
            )}
          >
            <header className="flex items-start gap-3 border-b border-line px-5 py-4">
              {icon && (
                <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-brass/35 bg-brass/10 text-brass">
                  {icon}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <h2 id={titleId} className="text-lg leading-tight font-semibold">
                  {title}
                </h2>
                {description && (
                  <p id={descId} className="mt-0.5 text-sm text-muted">
                    {description}
                  </p>
                )}
              </div>
              {!hideClose && (
                <IconButton label="Kapat" onClick={onClose} size="sm">
                  <X className="h-4 w-4" aria-hidden="true" />
                </IconButton>
              )}
            </header>

            <div className="gm-scroll min-h-0 flex-1 overflow-y-auto px-5 py-4">
              {children}
            </div>

            {footer && (
              <footer className="flex flex-wrap items-center justify-end gap-2 border-t border-line bg-surface-2/60 px-5 py-3">
                {footer}
              </footer>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
