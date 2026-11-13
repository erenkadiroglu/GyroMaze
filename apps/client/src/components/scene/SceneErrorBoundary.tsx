'use client';

import { Component, type ErrorInfo, type ReactNode } from 'react';
import { SceneRecoveryCard } from './SceneRecoveryCard';

export interface SceneErrorBoundaryProps {
  children: ReactNode;
  onRetry: () => void;
  revision?: number;
}

interface SceneErrorBoundaryState {
  hasError: boolean;
}

/**
 * WebGL / Rapier WASM başlatma hatalarında uygulamanın çökmesini önleyen sınır bileşeni.
 * Hata durumunda SceneRecoveryCard bileşenine delege ederek saf orkestrasyon motoruna bağlanır.
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
        <SceneRecoveryCard
          variant="init_error"
          revision={this.props.revision ?? 0}
          onRetry={() => {
            this.setState({ hasError: false });
            this.props.onRetry();
          }}
        />
      );
    }
    return this.props.children;
  }
}
