import {
  isResetBallDisabled,
  resolveRecalibrateAriaLabel,
  resolveResetBallAriaLabel,
} from './controllerFooterUtils.ts';

export interface ControllerFooterStateInput {
  showGimbalSurface?: boolean;
  isControllerPaired?: boolean;
  isSocketConnected?: boolean;
}

export interface FooterVisibleContainerProps {
  role: 'contentinfo';
  'aria-label': string;
  className: string;
  'data-visible': true;
  'data-paired': boolean;
  'data-connected': boolean;
  'data-reset-disabled': boolean;
}

export interface FooterHiddenContainerProps {
  'aria-hidden': true;
  className: string;
  'data-visible': false;
}

export type FooterContainerProps =
  | FooterVisibleContainerProps
  | FooterHiddenContainerProps;

export interface ResolvedControllerFooterState {
  isVisible: boolean;
  isResetDisabled: boolean;
  recalibrateAriaLabel: string;
  resetBallAriaLabel: string;
  telemetrySummary: string;
  containerProps: FooterContainerProps;
}

/**
 * Mobil kontrolcü alt çubuğu standart grid sınıfını döner.
 */
export function getControllerFooterClassName(): string {
  return 'grid grid-cols-2 gap-2.5';
}

/**
 * Gimbal yüzeyi kapalıyken yer tutan boşluk sınıfını döner.
 */
export function getControllerFooterSpacerClassName(): string {
  return 'h-2';
}

/**
 * Mobil kontrolcü alt çubuğunun durumunu insan tarafından okunabilir özet metne formatlar.
 */
export function formatControllerFooterTelemetry(
  input: ControllerFooterStateInput = {},
): string {
  if (!input.showGimbalSurface) {
    return 'Alt Çubuk: Gizli (Gimbal Pasif)';
  }

  const isPaired = Boolean(input.isControllerPaired);
  const isConnected = Boolean(input.isSocketConnected);
  const resetDisabled = isResetBallDisabled(isPaired, isConnected);

  const resetStatus = resetDisabled
    ? 'Top Sıfırlama Devre Dışı (Eşleşme Bekleniyor)'
    : 'Top Sıfırlama Aktif';

  return `Alt Çubuk: Aktif | Kalibrasyon Hazır | ${resetStatus}`;
}

/**
 * Alt araç çubuğu kapsayıcısı için semantik DOM ve denetim özniteliklerini döner.
 */
export function resolveControllerFooterContainerProps(
  input: ControllerFooterStateInput = {},
): FooterContainerProps {
  if (!input.showGimbalSurface) {
    return {
      'aria-hidden': true,
      className: getControllerFooterSpacerClassName(),
      'data-visible': false,
    };
  }

  const isPaired = Boolean(input.isControllerPaired);
  const isConnected = Boolean(input.isSocketConnected);
  const resetDisabled = isResetBallDisabled(isPaired, isConnected);

  return {
    role: 'contentinfo',
    'aria-label': 'Mobil Kontrolcü Alt Araç Çubuğu',
    className: getControllerFooterClassName(),
    'data-visible': true,
    'data-paired': isPaired,
    'data-connected': isConnected,
    'data-reset-disabled': resetDisabled,
  };
}

/**
 * Mobil kontrolcü alt çubuğunun tüm orkestrasyon durumunu çözer.
 */
export function resolveControllerFooterState(
  input: ControllerFooterStateInput = {},
): ResolvedControllerFooterState {
  const isVisible = Boolean(input.showGimbalSurface);
  const isPaired = Boolean(input.isControllerPaired);
  const isConnected = Boolean(input.isSocketConnected);
  const isResetDisabled = isResetBallDisabled(isPaired, isConnected);
  const recalibrateAriaLabel = resolveRecalibrateAriaLabel();
  const resetBallAriaLabel = resolveResetBallAriaLabel(isResetDisabled);
  const telemetrySummary = formatControllerFooterTelemetry(input);
  const containerProps = resolveControllerFooterContainerProps(input);

  return {
    isVisible,
    isResetDisabled,
    recalibrateAriaLabel,
    resetBallAriaLabel,
    telemetrySummary,
    containerProps,
  };
}

