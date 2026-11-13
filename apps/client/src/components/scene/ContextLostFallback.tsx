'use client';

interface ContextLostFallbackProps {
  onRetry: () => void;
}

/**
 * 3B WebGL grafik bağlamı kesildiğinde kullanıcıya kurtarma seçeneği sunan Türkçe arayüz kartı.
 */
export function ContextLostFallback({ onRetry }: ContextLostFallbackProps) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center bg-base p-6 text-center text-fg">
      <div className="max-w-sm rounded-2xl border border-line bg-surface p-6 shadow-xl">
        <h2 className="text-base font-semibold">
          3B grafik bağlamı kesildi
        </h2>
        <p className="mt-2 text-xs leading-relaxed text-muted">
          Tarayıcı WebGL bağlamını geçici olarak serbest bıraktı.
        </p>
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 min-h-10 cursor-pointer rounded-xl bg-brass px-4 text-xs font-semibold text-brass-fg transition-all active:scale-95"
        >
          Sahneyi yeniden başlat
        </button>
      </div>
    </div>
  );
}

