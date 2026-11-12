'use client';

import { Component, ErrorInfo, ReactNode } from 'react';

interface SceneErrorBoundaryProps {
  children: ReactNode;
  onRetry: () => void;
}

interface SceneErrorBoundaryState {
  hasError: boolean;
}

/**
 * WebGL / Rapier WASM başlatma hatalarında uygulamanın çökmesini önleyen sınır bileşeni.
 */
export class SceneErrorBoundary extends Component<
  SceneErrorBoundaryProps,
  SceneErrorBoundaryState
> {
  public constructor(props: SceneErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  public static getDerivedStateFromError(): { hasError: boolean } {
    return { hasError: true };
  }

  public override componentDidCatch(_err: Error, _info: ErrorInfo): void {
    // WebGL veya fizik başlatma hatası kurtarma ekranına yönlendirildi.
  }

  public override render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-full w-full flex-col items-center justify-center bg-base p-6 text-center text-fg">
          <div className="max-w-sm rounded-2xl border border-line bg-surface p-6 shadow-xl">
            <h2 className="text-base font-semibold">3B sahne başlatılamadı</h2>
            <p className="mt-2 text-xs leading-relaxed text-muted">
              Tarayıcı WebGL grafik bağlamı kullanılamıyor veya sıfırlandı.
            </p>
            <button
              type="button"
              onClick={() => {
                this.setState({ hasError: false });
                this.props.onRetry();
              }}
              className="mt-4 min-h-10 cursor-pointer rounded-xl bg-brass px-4 text-xs font-semibold text-brass-fg"
            >
              Sahneyi yeniden başlat
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

