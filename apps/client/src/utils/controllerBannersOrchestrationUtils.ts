import {
  shouldShowLevelNavBanner,
  shouldShowVictoryBanner,
  shouldShowDefeatBanner,
  isPrevLevelDisabled,
} from './controllerBannerUtils.ts';
import {
  formatControllerLevelLabel,
  formatCrystalRatio,
} from './controllerUtils.ts';

export type ControllerBannerType = 'error' | 'victory' | 'defeat' | 'nav' | 'none';

export interface ControllerBannersStateInput {
  errorMessage?: string | null;
  isControllerPaired?: boolean;
  isRoomEditorOpen?: boolean;
  gameStatus?: string;
  level?: number;
  remoteCrystalsCollected?: number;
  remoteCrystalsTotal?: number;
}

export interface ControllerBannersVisibility {
  showError: boolean;
  showNav: boolean;
  showVictory: boolean;
  showDefeat: boolean;
  activeBannerCount: number;
  primaryBannerType: ControllerBannerType;
  isPrevDisabled: boolean;
}

export interface ControllerBannersContainerProps {
  id: string;
  role: 'region';
  'aria-label': string;
  'data-active-banners': string;
  'data-primary-banner': ControllerBannerType;
  'data-banner-count': number;
}

export interface ResolvedControllerBannersState {
  visibility: ControllerBannersVisibility;
  telemetrySummary: string;
  levelLabel: string;
  crystalRatio: string;
  containerProps: ControllerBannersContainerProps;
}

/**
 * Mobil kontrolcü durum şeritlerinin görünürlük bayraklarını ve baskın banner türünü çözer.
 */
export function resolveControllerBannersVisibility(
  input: ControllerBannersStateInput = {},
): ControllerBannersVisibility {
  const isPaired = Boolean(input.isControllerPaired);
  const isEditorOpen = Boolean(input.isRoomEditorOpen);
  const gameStatus = input.gameStatus ?? 'idle';
  const level = typeof input.level === 'number' ? input.level : 1;

  const showError = Boolean(
    input.errorMessage && typeof input.errorMessage === 'string' && input.errorMessage.trim().length > 0,
  );
  const showNav = shouldShowLevelNavBanner(isPaired, isEditorOpen);
  const showVictory = shouldShowVictoryBanner(isPaired, gameStatus, isEditorOpen);
  const showDefeat = shouldShowDefeatBanner(isPaired, gameStatus, isEditorOpen);
  const isPrevDisabled = isPrevLevelDisabled(level);

  let activeBannerCount = 0;
  if (showError) activeBannerCount++;
  if (showNav) activeBannerCount++;
  if (showVictory) activeBannerCount++;
  if (showDefeat) activeBannerCount++;

  // Baskın (en yüksek öncelikli) bildirim türü
  let primaryBannerType: ControllerBannerType = 'none';
  if (showError) {
    primaryBannerType = 'error';
  } else if (showVictory) {
    primaryBannerType = 'victory';
  } else if (showDefeat) {
    primaryBannerType = 'defeat';
  } else if (showNav) {
    primaryBannerType = 'nav';
  }

  return {
    showError,
    showNav,
    showVictory,
    showDefeat,
    activeBannerCount,
    primaryBannerType,
    isPrevDisabled,
  };
}

/**
 * Mobil kontrolcü banner durumunu insan tarafından okunabilir özet telemetri metnine dönüştürür.
 */
export function formatControllerBannersTelemetry(
  visibility: ControllerBannersVisibility,
  input: ControllerBannersStateInput = {},
): string {
  if (visibility.showError && input.errorMessage) {
    return `Hata Bildirimi: ${input.errorMessage.trim()}`;
  }

  const level = typeof input.level === 'number' ? input.level : 1;
  const levelLabel = formatControllerLevelLabel(level);

  if (visibility.showVictory) {
    return `Zafer Şeridi Aktif (${levelLabel})`;
  }

  if (visibility.showDefeat) {
    return 'Yenilgi Şeridi Aktif (Süre Doldu)';
  }

  if (visibility.showNav) {
    const ratio = formatCrystalRatio(
      input.remoteCrystalsCollected ?? 0,
      input.remoteCrystalsTotal ?? 0,
    );
    return `Gezinme Şeridi Aktif (${levelLabel} · ${ratio})`;
  }

  return 'Aktif Banner Yok';
}

/**
 * Kontrolcü durum şeritleri kapsayıcısı için semantik DOM ve denetim özniteliklerini üretir.
 */
export function resolveControllerBannersContainerProps(
  visibility: ControllerBannersVisibility,
): ControllerBannersContainerProps {
  const activeBannersList: string[] = [];
  if (visibility.showError) activeBannersList.push('error');
  if (visibility.showNav) activeBannersList.push('nav');
  if (visibility.showVictory) activeBannersList.push('victory');
  if (visibility.showDefeat) activeBannersList.push('defeat');

  return {
    id: 'controller-status-banners',
    role: 'region',
    'aria-label': 'Mobil Kontrolcü Durum Bildirimleri',
    'data-active-banners': activeBannersList.join(',') || 'none',
    'data-primary-banner': visibility.primaryBannerType,
    'data-banner-count': visibility.activeBannerCount,
  };
}

/**
 * Mobil kontrolcü durum şeritlerinin tüm orkestrasyon durumunu çözer.
 */
export function resolveControllerBannersState(
  input: ControllerBannersStateInput = {},
): ResolvedControllerBannersState {
  const visibility = resolveControllerBannersVisibility(input);
  const telemetrySummary = formatControllerBannersTelemetry(visibility, input);
  const level = typeof input.level === 'number' ? input.level : 1;
  const levelLabel = formatControllerLevelLabel(level);
  const crystalRatio = formatCrystalRatio(
    input.remoteCrystalsCollected ?? 0,
    input.remoteCrystalsTotal ?? 0,
  );
  const containerProps = resolveControllerBannersContainerProps(visibility);

  return {
    visibility,
    telemetrySummary,
    levelLabel,
    crystalRatio,
    containerProps,
  };
}
