'use client';

import type { ReactNode } from 'react';

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
