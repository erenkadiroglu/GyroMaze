import {
  getDesktopLoadingContainerClassName,
  getDesktopLoadingSpinnerClassName,
  getDesktopLoadingMessage,
} from './desktopHomeViewUtils.ts';

export interface DesktopLoaderContainerProps {
  className: string;
  role: 'status';
  'aria-live': 'polite';
  'aria-label': string;
  'data-state': 'loading';
}

export interface DesktopLoaderSpinnerProps {
  className: string;
  'aria-hidden': true;
}

export interface DesktopLoaderMessageProps {
  className: string;
}

export interface ResolvedDesktopSceneLoaderState {
  containerProps: DesktopLoaderContainerProps;
  spinnerProps: DesktopLoaderSpinnerProps;
  messageProps: DesktopLoaderMessageProps;
  message: string;
  telemetrySummary: string;
}

export const DESKTOP_LOADER_MESSAGE_CLASS = 'mt-4 text-sm font-medium text-muted';

/**
 * Masaüstü yükleme kapsayıcısı için semantik DOM niteliklerini üretir.
 */
export function resolveDesktopLoaderContainerProps(
  customMessage?: string,
): DesktopLoaderContainerProps {
  const message = customMessage?.trim() || getDesktopLoadingMessage();

  return {
    className: getDesktopLoadingContainerClassName(),
    role: 'status',
    'aria-live': 'polite',
    'aria-label': message,
    'data-state': 'loading',
  };
}

/**
 * Masaüstü yükleme animasyonu (çember/spinner) için DOM niteliklerini üretir.
 */
export function getDesktopLoaderSpinnerProps(): DesktopLoaderSpinnerProps {
  return {
    className: getDesktopLoadingSpinnerClassName(),
    'aria-hidden': true,
  };
}

/**
 * Masaüstü yükleme mesajı etiketi için stil ve içerik niteliklerini üretir.
 */
export function getDesktopLoaderMessageProps(): DesktopLoaderMessageProps {
  return {
    className: DESKTOP_LOADER_MESSAGE_CLASS,
  };
}

/**
 * 3B Sahne yükleme durumu için tek satırlık telemetri ve günlük metni formatlar.
 */
export function formatDesktopSceneLoaderTelemetry(
  customMessage?: string,
): string {
  const message = customMessage?.trim() || getDesktopLoadingMessage();
  return `Masaüstü Sahne Yükleyici: ${message} | Durum: Yükleniyor (CSR)`;
}

/**
 * 3B Sahne yükleme bileşeninin tüm durum ve DOM özniteliklerini saf nesne halinde birleştirir.
 */
export function resolveDesktopSceneLoaderState(
  customMessage?: string,
): ResolvedDesktopSceneLoaderState {
  const message = customMessage?.trim() || getDesktopLoadingMessage();
  const containerProps = resolveDesktopLoaderContainerProps(message);
  const spinnerProps = getDesktopLoaderSpinnerProps();
  const messageProps = getDesktopLoaderMessageProps();
  const telemetrySummary = formatDesktopSceneLoaderTelemetry(message);

  return {
    containerProps,
    spinnerProps,
    messageProps,
    message,
    telemetrySummary,
  };
}
