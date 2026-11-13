/**
 * 3B WebGL Sahnesi Hata ve Bağlam Kurtarma (Scene Recovery) Orkestrasyon Motoru.
 * WebGL bağlam kesilmesi, başlatma çökmeleri ve kurtarma kartlarının metin, stil ve erişilebilirlik
 * yapılandırmalarını saf mimariyle hesaplar.
 */

export type SceneRecoveryVariant =
  | 'context_lost'
  | 'init_error'
  | 'generic_error';

export interface SceneRecoveryConfig {
  variant: SceneRecoveryVariant;
  title: string;
  message: string;
  buttonText: string;
  ariaRole: 'alert' | 'status';
  ariaLive: 'assertive' | 'polite';
}

export interface SceneRecoveryContainerProps {
  className: string;
  role: 'alert' | 'status';
  'aria-live': 'assertive' | 'polite';
  'aria-label': string;
  'data-recovery-variant': SceneRecoveryVariant;
  'data-revision': number;
}

export interface ResolvedSceneRecoveryState {
  config: SceneRecoveryConfig;
  containerProps: SceneRecoveryContainerProps;
  telemetrySummary: string;
}

export const SCENE_RECOVERY_CONTAINER_CLASS =
  'flex h-full w-full flex-col items-center justify-center bg-base p-6 text-center text-fg';

export const SCENE_RECOVERY_CARD_CLASS =
  'max-w-sm rounded-2xl border border-line bg-surface p-6 shadow-xl';

export const SCENE_RECOVERY_TITLE_CLASS = 'text-base font-semibold text-fg';

export const SCENE_RECOVERY_MESSAGE_CLASS =
  'mt-2 text-xs leading-relaxed text-muted';

export const SCENE_RECOVERY_BUTTON_CLASS =
  'mt-4 min-h-10 cursor-pointer rounded-xl bg-brass px-4 text-xs font-semibold text-brass-fg transition-all active:scale-95';

/**
 * Kurtarma varyantına göre metin, erişilebilirlik ve öncelik yapılandırmasını döner.
 */
export function getSceneRecoveryConfig(
  variant: SceneRecoveryVariant = 'context_lost',
): SceneRecoveryConfig {
  switch (variant) {
    case 'init_error':
      return {
        variant: 'init_error',
        title: '3B sahne başlatılamadı',
        message:
          'Tarayıcı WebGL grafik bağlamı kullanılamıyor veya sıfırlandı.',
        buttonText: 'Sahneyi yeniden başlat',
        ariaRole: 'alert',
        ariaLive: 'assertive',
      };
    case 'generic_error':
      return {
        variant: 'generic_error',
        title: '3B sahne hatası',
        message:
          'Beklenmeyen bir görsel oluşturma veya fizik simülasyonu hatası oluştu.',
        buttonText: 'Sahneyi yeniden dene',
        ariaRole: 'alert',
        ariaLive: 'assertive',
      };
    case 'context_lost':
    default:
      return {
        variant: 'context_lost',
        title: '3B grafik bağlamı kesildi',
        message: 'Tarayıcı WebGL bağlamını geçici olarak serbest bıraktı.',
        buttonText: 'Sahneyi yeniden başlat',
        ariaRole: 'alert',
        ariaLive: 'assertive',
      };
  }
}

/**
 * Kurtarma konteyneri için semantik DOM niteliklerini üretir.
 */
export function resolveSceneRecoveryContainerProps(
  variant: SceneRecoveryVariant = 'context_lost',
  revision: number = 0,
): SceneRecoveryContainerProps {
  const config = getSceneRecoveryConfig(variant);
  const safeRevision =
    Number.isFinite(revision) && revision >= 0 ? Math.floor(revision) : 0;

  return {
    className: SCENE_RECOVERY_CONTAINER_CLASS,
    role: config.ariaRole,
    'aria-live': config.ariaLive,
    'aria-label': config.title,
    'data-recovery-variant': config.variant,
    'data-revision': safeRevision,
  };
}

/**
 * 3B Kurtarma durumu için tek satırlık telemetri dizesi formatlar.
 */
export function formatSceneRecoveryTelemetry(
  variant: SceneRecoveryVariant = 'context_lost',
  revision: number = 0,
): string {
  const config = getSceneRecoveryConfig(variant);
  const safeRevision =
    Number.isFinite(revision) && revision >= 0 ? Math.floor(revision) : 0;

  return `3B Kurtarma: ${config.title} | Varyant: ${config.variant} | Revizyon: ${safeRevision}`;
}

/**
 * 3B Sahne kurtarma durumunun tüm bileşenlerini saf nesne halinde birleştirir.
 */
export function resolveSceneRecoveryState(options?: {
  variant?: SceneRecoveryVariant;
  revision?: number;
}): ResolvedSceneRecoveryState {
  const variant = options?.variant || 'context_lost';
  const revision = options?.revision ?? 0;
  const config = getSceneRecoveryConfig(variant);
  const containerProps = resolveSceneRecoveryContainerProps(variant, revision);
  const telemetrySummary = formatSceneRecoveryTelemetry(variant, revision);

  return {
    config,
    containerProps,
    telemetrySummary,
  };
}

