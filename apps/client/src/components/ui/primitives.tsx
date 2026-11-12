'use client';

import {
  useEffect,
  useId,
  useRef,
  type ReactNode,
  type ButtonHTMLAttributes,
} from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

/* -------------------------------------------------------------------------- */
/*  Ortak yardımcılar                                                         */
/* -------------------------------------------------------------------------- */

/** Koşullu sınıf adlarını birleştirir. */
export function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ');
}

/**
 * Pencere / panel açıkken `Esc` tuşuyla kapatma ve odak yönetimi.
 * Açılışta kapsayıcıya odaklanır, kapanışta odağı önceki öğeye geri verir.
 */
function useDialogBehavior(
  open: boolean,
  onClose: () => void,
  containerRef: React.RefObject<HTMLElement | null>,
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
      if (e.key === 'Escape') {
        e.stopPropagation();
        onCloseRef.current();
        return;
      }

      if (e.key === 'Tab' && containerRef.current) {
        const focusables = Array.from(
          containerRef.current.querySelectorAll<HTMLElement>(
            'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
          ),
        ).filter((el) => el.offsetParent !== null);

        if (focusables.length === 0) {
          e.preventDefault();
          containerRef.current.focus({ preventScroll: true });
          return;
        }

        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        const activeEl = document.activeElement as HTMLElement | null;

        if (e.shiftKey) {
          if (!activeEl || activeEl === first || !containerRef.current.contains(activeEl)) {
            e.preventDefault();
            last.focus({ preventScroll: true });
          }
        } else if (!activeEl || activeEl === last || !containerRef.current.contains(activeEl)) {
          e.preventDefault();
          first.focus({ preventScroll: true });
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener('keydown', onKeyDown);
      previouslyFocused?.focus?.({ preventScroll: true });
    };
  }, [open, containerRef]);
}

/* -------------------------------------------------------------------------- */
/*  Modal pencere                                                             */
/* -------------------------------------------------------------------------- */

interface ModalProps {
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

const MODAL_WIDTH: Record<NonNullable<ModalProps['size']>, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-3xl',
};

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
            if (e.target === e.currentTarget) onClose();
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
              MODAL_WIDTH[size],
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

/* -------------------------------------------------------------------------- */
/*  Sağdan açılan panel (Drawer)                                              */
/* -------------------------------------------------------------------------- */

interface DrawerProps {
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

/* -------------------------------------------------------------------------- */
/*  Düğmeler                                                                  */
/* -------------------------------------------------------------------------- */

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  /** Klavye kısayolu ipucu (ör. "R") */
  shortcut?: string;
  size?: 'sm' | 'md';
  pressed?: boolean;
  variant?: 'ghost' | 'panel';
}

/**
 * Yalnızca ikon içeren, erişilebilir adlı düğme.
 */
export function IconButton({
  label,
  shortcut,
  size = 'md',
  pressed,
  variant = 'ghost',
  className,
  children,
  ...rest
}: IconButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={pressed}
      title={shortcut ? `${label} (${shortcut})` : label}
      className={cx(
        'inline-flex shrink-0 cursor-pointer items-center justify-center rounded-xl text-muted transition-colors hover:text-fg active:scale-95 aria-pressed:text-brass',
        size === 'sm' ? 'h-8 w-8' : 'h-10 w-10',
        variant === 'panel'
          ? 'gm-panel hover:bg-surface-2'
          : 'hover:bg-surface-2',
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: ReactNode;
}

/**
 * Metinli standart düğme. Birincil eylem pirinç dolgulu, ikincil eylem çerçevelidir.
 */
export function Button({
  variant = 'secondary',
  size = 'md',
  icon,
  className,
  children,
  type = 'button',
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cx(
        'inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl font-semibold whitespace-nowrap transition-colors active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50',
        size === 'sm' && 'h-8 px-3 text-xs',
        size === 'md' && 'h-10 px-4 text-sm',
        size === 'lg' && 'h-12 px-5 text-sm',
        variant === 'primary' &&
          'bg-brass text-brass-fg hover:brightness-110',
        variant === 'secondary' &&
          'border border-line bg-surface-2 text-fg hover:border-muted/60',
        variant === 'ghost' && 'text-muted hover:bg-surface-2 hover:text-fg',
        className,
      )}
      {...rest}
    >
      {icon}
      {children}
    </button>
  );
}

/* -------------------------------------------------------------------------- */
/*  Form denetimleri                                                          */
/* -------------------------------------------------------------------------- */

interface SegmentedProps<T extends string | number> {
  label: string;
  value: T;
  options: ReadonlyArray<{ value: T; label: string; hint?: string }>;
  onChange: (value: T) => void;
}

/**
 * Birbirini dışlayan seçenekler için segmentli seçici (radyo grubu).
 */
export function Segmented<T extends string | number>({
  label,
  value,
  options,
  onChange,
}: SegmentedProps<T>) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className="grid gap-1 rounded-xl border border-line bg-surface-2/70 p-1"
      style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}
    >
      {options.map((opt, idx) => {
        const active = opt.value === value;
        return (
          <button
            key={String(opt.value)}
            type="button"
            role="radio"
            aria-checked={active}
            tabIndex={active ? 0 : -1}
            title={opt.hint}
            onClick={() => onChange(opt.value)}
            onKeyDown={(e) => {
              if (options.length < 2) return;
              let nextIdx = -1;
              if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                nextIdx = (idx + 1) % options.length;
              } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                nextIdx = (idx - 1 + options.length) % options.length;
              }
              if (nextIdx >= 0) {
                e.preventDefault();
                onChange(options[nextIdx].value);
                const sibling = e.currentTarget.parentElement?.children.item(
                  nextIdx,
                ) as HTMLElement | null;
                sibling?.focus({ preventScroll: true });
              }
            }}
            className={cx(
              'min-h-9 cursor-pointer rounded-lg px-2 text-sm font-medium transition-colors',
              active
                ? 'bg-surface text-fg shadow-[0_1px_0_0_var(--gm-line),0_0_0_1px_var(--gm-line)]'
                : 'text-muted hover:text-fg',
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

interface SwitchRowProps {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

/**
 * Açık / kapalı anahtarı ve açıklamasıyla bir ayar satırı.
 */
export function SwitchRow({
  label,
  description,
  checked,
  onChange,
}: SwitchRowProps) {
  const id = useId();
  return (
    <div className="flex items-center justify-between gap-4 py-2">
      <label htmlFor={id} className="min-w-0 cursor-pointer">
        <span className="block text-sm font-medium">{label}</span>
        {description && (
          <span className="block text-xs text-muted">{description}</span>
        )}
      </label>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cx(
          'relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border transition-colors',
          checked ? 'border-brass bg-brass' : 'border-line bg-surface-2',
        )}
      >
        <span
          aria-hidden="true"
          className={cx(
            'inline-block h-4.5 w-4.5 rounded-full shadow transition-transform',
            checked
              ? 'translate-x-[22px] bg-brass-fg'
              : 'translate-x-[3px] bg-muted',
          )}
        />
      </button>
    </div>
  );
}

/**
 * Ayarlar panelinde başlıklı bir bölüm.
 */
export function SettingsSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="border-b border-line px-5 py-4 last:border-b-0">
      <h3 className="mb-3 text-sm font-semibold text-fg">{title}</h3>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

/**
 * Bir denetimin üstündeki küçük etiket.
 */
export function FieldLabel({
  children,
  value,
}: {
  children: ReactNode;
  value?: ReactNode;
}) {
  return (
    <div className="mb-1.5 flex items-baseline justify-between text-xs text-muted">
      <span>{children}</span>
      {value !== undefined && <span className="gm-num text-sm text-fg">{value}</span>}
    </div>
  );
}

/**
 * Klavye tuşu görünümü.
 */
export function Kbd({ children }: { children: ReactNode }) {
  return (
    <kbd className="gm-num inline-flex min-w-6 items-center justify-center rounded-md border border-line bg-surface-2 px-1.5 py-0.5 text-xs text-fg">
      {children}
    </kbd>
  );
}
