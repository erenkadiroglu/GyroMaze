'use client';

import {
  resolveDesktopSceneLoaderState,
} from '@/utils/desktopSceneLoaderOrchestrationUtils';

export interface DesktopSceneLoadingFallbackProps {
  customMessage?: string;
}

/**
 * 3B Sahne İstemci Tarafı (CSR) Yükleme Göstergesi.
 * desktopSceneLoaderOrchestrationUtils saf motoru üzerinden semantik status rolü,
 * animasyonlu döner çember ve bilgilendirme metnini render eder.
 */
export function DesktopSceneLoadingFallback({
  customMessage,
}: DesktopSceneLoadingFallbackProps) {
  const { containerProps, spinnerProps, messageProps, message } =
    resolveDesktopSceneLoaderState(customMessage);

  return (
    <div {...containerProps}>
      <div {...spinnerProps} />
      <span {...messageProps}>{message}</span>
    </div>
  );
}
