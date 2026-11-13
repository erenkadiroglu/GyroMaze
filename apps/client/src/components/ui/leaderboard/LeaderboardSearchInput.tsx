'use client';

import { Search, X } from 'lucide-react';

export interface LeaderboardSearchInputProps {
  value: string;
  onChange: (value: string) => void;
}

/**
 * Liderlik tablosu oyuncu arama ve tek tıkla temizleme kutusu.
 */
export function LeaderboardSearchInput({
  value,
  onChange,
}: LeaderboardSearchInputProps) {
  return (
    <div className="relative flex items-center">
      <Search
        className="pointer-events-none absolute left-3.5 h-3.5 w-3.5 text-muted"
        aria-hidden="true"
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Oyuncu adına göre filtrele..."
        aria-label="Oyuncu ara"
        className="h-9 w-full rounded-xl border border-line bg-surface-2/60 pr-9 pl-9 text-xs font-medium text-fg placeholder:text-muted/60 outline-none focus:border-brass/70 focus:ring-1 focus:ring-brass/40"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label="Aramayı temizle"
          className="absolute right-2.5 flex h-5 w-5 cursor-pointer items-center justify-center rounded-md text-muted hover:text-fg"
        >
          <X className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}

