'use client';

import { Sparkles } from 'lucide-react';

/**
 * Harita editörü hazır şablonlar bölüm başlığı
 */
export function EditorTemplatesHeader() {
  return (
    <div className="mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-muted">
      <span>Hazır şablonlar</span>
      <span className="inline-flex items-center gap-1 text-[10px] normal-case text-brass">
        <Sparkles className="h-3 w-3" aria-hidden="true" />
        Hızlı başla
      </span>
    </div>
  );
}
