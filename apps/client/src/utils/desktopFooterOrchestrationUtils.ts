import {
  getFooterAriaLabel,
  getFooterContainerClass,
} from './desktopFooterUtils.ts';
import {
  formatKeyboardHintAriaLabel,
  getSoloKeyboardHintItems,
  getMultiplayerP1Hint,
  getMultiplayerP2Hint,
  type KeyboardHintItemConfig,
} from './footerKeyboardHintUtils.ts';

export interface DesktopFooterStateOptions {
  isControllerPaired: boolean;
  isSecondControllerPaired: boolean;
  isMultiplayer: boolean;
  showMiniMap: boolean;
}

export interface DesktopFooterResolvedState {
  isControllerPaired: boolean;
  isSecondControllerPaired: boolean;
  isMultiplayer: boolean;
  showMiniMap: boolean;
  p1NeedsKeyboard: boolean;
  p2NeedsKeyboard: boolean;
  keyboardHintAriaLabel: string;
  hintItems: KeyboardHintItemConfig[];
  footerContainerClass: string;
  footerAriaLabel: string;
}

/**
 * Masaüstü HUD alt paneli (DesktopFooter) için kontrolcü durumları, klavye ipuçları
 * ve erişilebilirlik etiketlerini tek bir saf yapıda çözümler.
 */
export function resolveDesktopFooterState(
  options: DesktopFooterStateOptions,
): DesktopFooterResolvedState {
  const {
    isControllerPaired,
    isSecondControllerPaired,
    isMultiplayer,
    showMiniMap,
  } = options;

  const p1NeedsKeyboard = isMultiplayer && !isControllerPaired;
  const p2NeedsKeyboard = isMultiplayer && !isSecondControllerPaired;

  const keyboardHintAriaLabel = formatKeyboardHintAriaLabel(
    isMultiplayer,
    p1NeedsKeyboard,
    p2NeedsKeyboard,
  );

  let hintItems: KeyboardHintItemConfig[] = [];
  if (!isMultiplayer) {
    hintItems = getSoloKeyboardHintItems();
  } else {
    if (p1NeedsKeyboard) {
      hintItems.push(getMultiplayerP1Hint());
    }
    if (p2NeedsKeyboard) {
      hintItems.push(getMultiplayerP2Hint());
    }
  }

  return {
    isControllerPaired,
    isSecondControllerPaired,
    isMultiplayer,
    showMiniMap,
    p1NeedsKeyboard,
    p2NeedsKeyboard,
    keyboardHintAriaLabel,
    hintItems,
    footerContainerClass: getFooterContainerClass(),
    footerAriaLabel: getFooterAriaLabel(),
  };
}

/**
 * 2B Mini-Harita radarı için anlık durum metnini üretir.
 */
export function formatRadarSummary(
  remainingCount: number,
  isUnlocked: boolean,
): string {
  if (isUnlocked || remainingCount <= 0) {
    return 'Radar: Hedef portalı açık ve aktif';
  }
  return `Radar: ${remainingCount} kristal toplanmayı bekliyor`;
}

/**
 * Ekran genişliğine göre alt çubuk yerleşim yapılandırmasını çözer.
 */
export function resolveFooterLayoutConfig(isCompact = false): {
  isCompact: boolean;
  gapClass: string;
} {
  return {
    isCompact,
    gapClass: isCompact ? 'gap-2' : 'gap-4',
  };
}
