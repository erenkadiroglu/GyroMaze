import { DESKTOP_MODAL_KEYS } from './desktopModalsUtils.ts';

export type DesktopModalKey = (typeof DESKTOP_MODAL_KEYS)[number];

export interface DesktopModalsStateInput {
  isEditorOpen?: boolean;
  isSettingsOpen?: boolean;
  isHelpOpen?: boolean;
  isPairingModalOpen?: boolean;
  isLeaderboardOpen?: boolean;
  gameStatus?: string;
}

export interface ModalGroupRenderFlags {
  hasUtilityModal: boolean;
  hasSocialModal: boolean;
  hasOutcomeModal: boolean;
  totalActiveModals: number;
  topmostModal: DesktopModalKey | null;
  preventBackdropClose: boolean;
}

export interface ModalsContainerAria {
  id: string;
  'aria-live': 'polite';
  'data-active-modals': string;
  'data-topmost': string;
  'data-has-modal': boolean;
}

export interface ResolvedDesktopModalsLayerState {
  activeModals: DesktopModalKey[];
  topmostModal: DesktopModalKey | null;
  hasActiveModal: boolean;
  preventBackdropClose: boolean;
  groupFlags: ModalGroupRenderFlags;
  containerAria: ModalsContainerAria;
}

/**
 * Masaüstü modallarının öncelik hiyerarşisi (en yüksekten en düşüğe).
 * Eşzamanlı açılma durumlarında veya z-index sıralamasında bu düzen esas alınır.
 */
export const MODAL_PRIORITY_HIERARCHY: readonly DesktopModalKey[] = [
  'outcome',
  'pairing',
  'editor',
  'leaderboard',
  'settings',
  'help',
] as const;

/**
 * Giriş bayraklarına göre açık olan modal anahtarlarını öncelik sırasına göre çözer.
 */
export function resolveActiveModals(
  input: DesktopModalsStateInput = {},
): DesktopModalKey[] {
  const isOutcome = input.gameStatus === 'won' || input.gameStatus === 'lost';

  const rawMap: Record<DesktopModalKey, boolean> = {
    outcome: Boolean(isOutcome),
    pairing: Boolean(input.isPairingModalOpen),
    editor: Boolean(input.isEditorOpen),
    leaderboard: Boolean(input.isLeaderboardOpen),
    settings: Boolean(input.isSettingsOpen),
    help: Boolean(input.isHelpOpen),
  };

  return MODAL_PRIORITY_HIERARCHY.filter((key) => rawMap[key]);
}

/**
 * Aktif modallar arasından en yüksek öncelikli modal anahtarını belirler.
 */
export function resolveTopmostModal(
  activeModals: DesktopModalKey[],
): DesktopModalKey | null {
  if (!activeModals || activeModals.length === 0) {
    return null;
  }
  return activeModals[0];
}

/**
 * Belirtilen modalın arkaplan (backdrop) tıklaması ile kapatılmasının
 * engellenip engellenmeyeceğini belirler (örn. oyun sonu pencereleri).
 */
export function shouldPreventBackdropClose(
  modalKey: DesktopModalKey | null,
): boolean {
  return modalKey === 'outcome';
}

/**
 * Modal anahtarına göre deterministik z-index katman seviyesini döner.
 */
export function resolveModalZIndex(modalKey: DesktopModalKey | null): number {
  switch (modalKey) {
    case 'outcome':
      return 70;
    case 'pairing':
      return 65;
    case 'editor':
      return 60;
    case 'leaderboard':
      return 55;
    case 'settings':
    case 'help':
      return 50;
    default:
      return 40;
  }
}

/**
 * Yardımcı, sosyal ve oyun sonu modal gruplarının render bayraklarını üretir.
 */
export function resolveModalGroupRenderFlags(
  activeModals: DesktopModalKey[],
): ModalGroupRenderFlags {
  const activeSet = new Set(activeModals);
  const topmost = resolveTopmostModal(activeModals);

  const hasUtilityModal =
    activeSet.has('editor') || activeSet.has('settings') || activeSet.has('help');
  const hasSocialModal =
    activeSet.has('pairing') || activeSet.has('leaderboard');
  const hasOutcomeModal = activeSet.has('outcome');

  return {
    hasUtilityModal,
    hasSocialModal,
    hasOutcomeModal,
    totalActiveModals: activeModals.length,
    topmostModal: topmost,
    preventBackdropClose: shouldPreventBackdropClose(topmost),
  };
}

/**
 * Modallar katmanı kapsayıcısı için erişilebilirlik ve denetim özniteliklerini döner.
 */
export function resolveModalsContainerAria(
  activeModals: DesktopModalKey[],
): ModalsContainerAria {
  const topmost = resolveTopmostModal(activeModals);
  return {
    id: 'desktop-modals-layer',
    'aria-live': 'polite',
    'data-active-modals': activeModals.join(',') || 'none',
    'data-topmost': topmost || 'none',
    'data-has-modal': activeModals.length > 0,
  };
}

/**
 * Masaüstü modallar katmanının tüm orkestrasyon durumunu tek noktada çözer.
 */
export function resolveDesktopModalsLayerState(
  input: DesktopModalsStateInput = {},
): ResolvedDesktopModalsLayerState {
  const activeModals = resolveActiveModals(input);
  const topmostModal = resolveTopmostModal(activeModals);
  const hasActiveModal = activeModals.length > 0;
  const preventBackdropClose = shouldPreventBackdropClose(topmostModal);
  const groupFlags = resolveModalGroupRenderFlags(activeModals);
  const containerAria = resolveModalsContainerAria(activeModals);

  return {
    activeModals,
    topmostModal,
    hasActiveModal,
    preventBackdropClose,
    groupFlags,
    containerAria,
  };
}
