'use client';

import { useId, type KeyboardEvent } from 'react';
import { cx, calculateNextRadioIndex } from '@/utils/primitiveUtils';

/**
 * WAI-ARIA radyo grupları için ortak klavye yön tuşu (Ok / Home / End) gezinti yardımcısı.
 */
export function handleRadioGroupKeyDown(
  e: KeyboardEvent<HTMLButtonElement>,
  idx: number,
  total: number,
  onSelectIndex: (nextIndex: number) => void,
) {
  const nextIdx = calculateNextRadioIndex(e.key, idx, total);
  if (nextIdx >= 0) {
    e.preventDefault();
    onSelectIndex(nextIdx);
    const sibling = e.currentTarget.parentElement?.children.item(
      nextIdx,
    ) as HTMLElement | null;
    sibling?.focus({ preventScroll: true });
  }
}

export interface SegmentedProps<T extends string | number> {
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
  const hasMatchedValue = options.some((opt) => opt.value === value);

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
            tabIndex={active || (!hasMatchedValue && idx === 0) ? 0 : -1}
            title={opt.hint}
            onClick={() => onChange(opt.value)}
            onKeyDown={(e) =>
              handleRadioGroupKeyDown(e, idx, options.length, (nextIdx) =>
                onChange(options[nextIdx].value),
              )
            }
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

export interface SwitchRowProps {
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
