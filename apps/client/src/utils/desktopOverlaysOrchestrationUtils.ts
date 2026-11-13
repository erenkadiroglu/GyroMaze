import {
  shouldShowPauseRecoveryBar,
  resolveToastAriaLive,
  isNotificationPresent,
} from './overlayBarUtils.ts';

export interface HudNotificationPayload {
  id: number;
  message: string;
  tone: 'warn' | 'info' | 'success';
  seq?: number;
}

export interface DesktopOverlaysStateInput {
  gameStatus?: string;
  isAnyOverlayOpen?: boolean;
  hudNotification?: HudNotificationPayload | null;
}

export interface OverlaysContainerProps {
  id: string;
  className: string;
  'data-recovery-open': boolean;
  'data-toast-visible': boolean;
  'data-tone': string;
  'data-has-overlay': boolean;
}

export interface ResolvedDesktopOverlaysState {
  showRecoveryBar: boolean;
  isNotificationVisible: boolean;
  notificationAriaLive: 'assertive' | 'polite';
  hasActiveOverlay: boolean;
  telemetrySummary: string;
  containerProps: OverlaysContainerProps;
}

/**
 * Sahne üstü duraklatma ve bildirim katmanı için kapsayıcı stil sınıfını döner.
 */
export function getOverlaysContainerClassName(): string {
  return 'pointer-events-none fixed inset-0 z-20 overflow-hidden';
}

/**
 * Sahne üstü bildirimlerin durumunu insan tarafından okunabilir özet metne formatlar.
 */
export function formatOverlaysTelemetry(
  showRecoveryBar: boolean,
  hudNotification?: HudNotificationPayload | null,
): string {
  const hasToast = isNotificationPresent(hudNotification);

  if (showRecoveryBar && hasToast && hudNotification) {
    return `Kurtarma Çubuğu Aktif | Bildirim: ${hudNotification.message}`;
  }

  if (showRecoveryBar) {
    return 'Kurtarma Çubuğu Aktif';
  }

  if (hasToast && hudNotification) {
    return `Bildirim: ${hudNotification.message}`;
  }

  return 'Sahne Bildirimi Yok';
}

/**
 * Sahne üstü bildirim ve duraklatma katmanı kapsayıcısı için DOM özniteliklerini üretir.
 */
export function resolveOverlaysContainerProps(
  showRecoveryBar: boolean,
  hudNotification?: HudNotificationPayload | null,
): OverlaysContainerProps {
  const isNotificationVisible = isNotificationPresent(hudNotification);
  const tone = hudNotification?.tone || 'none';
  const hasActiveOverlay = showRecoveryBar || isNotificationVisible;

  return {
    id: 'desktop-hud-overlays',
    className: getOverlaysContainerClassName(),
    'data-recovery-open': showRecoveryBar,
    'data-toast-visible': isNotificationVisible,
    'data-tone': tone,
    'data-has-overlay': hasActiveOverlay,
  };
}

/**
 * Masaüstü HUD sahne üstü duraklatma ve bildirim katmanının tüm orkestrasyon durumunu çözer.
 */
export function resolveDesktopOverlaysState(
  input: DesktopOverlaysStateInput = {},
): ResolvedDesktopOverlaysState {
  const gameStatus = input.gameStatus ?? 'idle';
  const isAnyOverlayOpen = Boolean(input.isAnyOverlayOpen);
  const showRecoveryBar = shouldShowPauseRecoveryBar(gameStatus, isAnyOverlayOpen);
  const isNotificationVisible = isNotificationPresent(input.hudNotification);
  const notificationAriaLive = resolveToastAriaLive(input.hudNotification?.tone);
  const hasActiveOverlay = showRecoveryBar || isNotificationVisible;
  const telemetrySummary = formatOverlaysTelemetry(showRecoveryBar, input.hudNotification);
  const containerProps = resolveOverlaysContainerProps(showRecoveryBar, input.hudNotification);

  return {
    showRecoveryBar,
    isNotificationVisible,
    notificationAriaLive,
    hasActiveOverlay,
    telemetrySummary,
    containerProps,
  };
}
