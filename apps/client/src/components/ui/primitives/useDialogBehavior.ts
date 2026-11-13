'use client';

import { useEffect, useRef, type RefObject } from 'react';
import {
  FOCUSABLE_ELEMENTS_SELECTOR,
  isEscapeKey,
  isTabKey,
  resolveNextFocusElement,
} from '@/utils/dialogBehaviorUtils';

/**
 * Pencere / panel açıkken `Esc` tuşuyla kapatma ve odak yönetimi.
 * Açılışta kapsayıcıya odaklanır, kapanışta odağı önceki öğeye geri verir.
 */
export function useDialogBehavior(
  open: boolean,
  onClose: () => void,
  containerRef: RefObject<HTMLElement | null>,
) {
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const raf = window.requestAnimationFrame(() => {
      containerRef.current?.focus({ preventScroll: true });
    });

    const onKeyDown = (e: KeyboardEvent) => {
      if (isEscapeKey(e.key)) {
        e.stopPropagation();
        onCloseRef.current();
        return;
      }

      if (isTabKey(e.key) && containerRef.current) {
        const focusables = Array.from(
          containerRef.current.querySelectorAll<HTMLElement>(
            FOCUSABLE_ELEMENTS_SELECTOR,
          ),
        ).filter((el) => el.offsetParent !== null);

        if (focusables.length === 0) {
          e.preventDefault();
          containerRef.current.focus({ preventScroll: true });
          return;
        }

        const activeEl = document.activeElement as HTMLElement | null;
        const targetFocus = resolveNextFocusElement(
          focusables,
          activeEl,
          e.shiftKey,
          containerRef.current,
        );

        if (targetFocus) {
          e.preventDefault();
          targetFocus.focus({ preventScroll: true });
        }
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener('keydown', onKeyDown);
      if (previouslyFocused && previouslyFocused.isConnected) {
        previouslyFocused.focus({ preventScroll: true });
      }
    };
  }, [open, containerRef]);
}
