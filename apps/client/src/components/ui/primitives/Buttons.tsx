'use client';

import type { ReactNode, ButtonHTMLAttributes } from 'react';
import {
  cx,
  formatShortcutTitle,
} from '@/utils/primitiveUtils';

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
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
      title={formatShortcutTitle(label, shortcut)}
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

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
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
