'use client';

import { formatShortcutKeyAriaLabel } from '@/utils/keyboardShortcuts';

export interface ShortcutRowProps {
  keys: string[];
  description: string;
}

/**
 * Klavye kısayolu kılavuz satırı:
 * Tuş etiketleri kbd öğeleriyle ve erişilebilir aria-label ile sunulur.
 */
export function ShortcutRow({ keys, description }: ShortcutRowProps) {
  return (
    <div
      className="flex items-center justify-between gap-3 py-1.5 text-xs"
      aria-label={`${description}: ${formatShortcutKeyAriaLabel(keys)}`}
    >
      <span className="text-muted">{description}</span>
      <div className="flex items-center gap-1">
        {keys.map((k) => (
          <kbd
            key={k}
            className="inline-flex min-h-[22px] min-w-[22px] items-center justify-center rounded-md border border-line bg-surface-2 px-1.5 py-0.5 font-mono text-[11px] font-semibold text-brass shadow-xs"
          >
            {k}
          </kbd>
        ))}
      </div>
    </div>
  );
}

