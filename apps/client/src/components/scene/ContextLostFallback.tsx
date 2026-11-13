'use client';

import { SceneRecoveryCard } from './SceneRecoveryCard';

export interface ContextLostFallbackProps {
  onRetry: () => void;
  revision?: number;
}

/**
 * 3B WebGL grafik bağlamı kesildiğinde kullanıcıya kurtarma seçeneği sunan Türkçe arayüz kartı.
 * SceneRecoveryCard bileşenine delege ederek saf orkestrasyon motoruna bağlanır.
 */
export function ContextLostFallback({
  onRetry,
  revision = 0,
}: ContextLostFallbackProps) {
  return (
    <SceneRecoveryCard
      variant="context_lost"
      revision={revision}
      onRetry={onRetry}
    />
  );
}
