'use client';

import { AlertCircle } from 'lucide-react';

interface ControllerErrorBannerProps {
  errorMessage: string | null;
  onOpenRoomEditor: () => void;
}

/**
 * Mobil kontrolcü üzerinde oluşan sunucu veya bağlantı hatalarını ve "Yeni kod" aksiyonunu gösterir.
 */
export function ControllerErrorBanner({
  errorMessage,
  onOpenRoomEditor,
}: ControllerErrorBannerProps) {
  if (!errorMessage) return null;

  return (
    <div
      role="alert"
      className="mt-2.5 flex items-center justify-between gap-2 rounded-2xl border border-danger/40 bg-surface px-3.5 py-2.5 text-xs text-danger"
    >
      <div className="flex items-center gap-2">
        <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
        <span>{errorMessage}</span>
      </div>
      <button
        type="button"
        onClick={onOpenRoomEditor}
        className="min-h-[34px] shrink-0 rounded-lg border border-danger/40 bg-danger/10 px-2.5 text-xs font-semibold text-danger"
      >
        Yeni kod
      </button>
    </div>
  );
}
