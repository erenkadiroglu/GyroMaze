import type { ShortcutAction } from './keyboardShortcuts.ts';
import { resolveKeyboardShortcut } from './keyboardShortcuts.ts';

export interface DesktopShortcutHandlers {
  onHelpToggle: (nextState: boolean) => void;
  onBallReset: () => void;
  onCycleCamera: () => void;
  onToggleMute: () => void;
  onToggleTheme: () => void;
  onOpenEditor: () => void;
  onOpenLeaderboard: () => void;
  onOpenPairing: () => void;
  onCalibrate: () => void;
  onSetLevel: (level: number) => void;
}

export interface DesktopShortcutContext {
  isAnyOverlayOpen: boolean;
  isHelpOpen: boolean;
  gameStatus: string;
}

/**
 * Hedef DOM öğesinin metin girişi veya düzenlenebilir bir alan olup olmadığını doğrular.
 */
export function isEditableElement(target: EventTarget | null): boolean {
  if (!target || typeof target !== 'object') {
    return false;
  }
  const el = target as Partial<HTMLElement>;
  const tag = el.tagName?.toUpperCase();
  return (
    tag === 'INPUT' ||
    tag === 'TEXTAREA' ||
    tag === 'SELECT' ||
    Boolean(el.isContentEditable)
  );
}

/**
 * Oyun durumunun sonlanma (kazanıldı / kaybedildi) olup olmadığını denetler.
 */
export function isGameOverStatus(status: string | null | undefined): boolean {
  return status === 'won' || status === 'lost';
}

export interface ExecuteShortcutResult {
  shouldPreventDefault: boolean;
  executed: boolean;
}

/**
 * Çözümlenmiş kısayol eylemini uygun işleyici fonksiyonuna yönlendirir ve
 * varsayılan tarayıcı davranışının engellenip engellenmeyeceğini belirler.
 */
export function executeDesktopShortcut(
  action: ShortcutAction,
  handlers: DesktopShortcutHandlers,
  isHelpOpen: boolean,
): ExecuteShortcutResult {
  if (action === 'help') {
    handlers.onHelpToggle(!isHelpOpen);
    return { shouldPreventDefault: true, executed: true };
  }
  if (action === 'reset') {
    handlers.onBallReset();
    return { shouldPreventDefault: false, executed: true };
  }
  if (action === 'camera') {
    handlers.onCycleCamera();
    return { shouldPreventDefault: false, executed: true };
  }
  if (action === 'mute') {
    handlers.onToggleMute();
    return { shouldPreventDefault: false, executed: true };
  }
  if (action === 'theme') {
    handlers.onToggleTheme();
    return { shouldPreventDefault: false, executed: true };
  }
  if (action === 'editor') {
    handlers.onOpenEditor();
    return { shouldPreventDefault: true, executed: true };
  }
  if (action === 'leaderboard') {
    handlers.onOpenLeaderboard();
    return { shouldPreventDefault: true, executed: true };
  }
  if (action === 'pairing') {
    handlers.onOpenPairing();
    return { shouldPreventDefault: true, executed: true };
  }
  if (action === 'calibrate') {
    handlers.onCalibrate();
    return { shouldPreventDefault: true, executed: true };
  }
  if (typeof action === 'object' && action.type === 'level') {
    handlers.onSetLevel(action.level);
    return { shouldPreventDefault: true, executed: true };
  }

  return { shouldPreventDefault: false, executed: false };
}

/**
 * Masaüstü keydown olayını girdi odağı, oyun durumu ve açık pencerelere göre işler.
 */
export function handleDesktopKeyDown(
  e: {
    key: string;
    code?: string;
    ctrlKey?: boolean;
    metaKey?: boolean;
    altKey?: boolean;
    repeat?: boolean;
    target?: EventTarget | null;
    preventDefault?: () => void;
  },
  context: DesktopShortcutContext,
  handlers: DesktopShortcutHandlers,
): boolean {
  const isInputFocused = isEditableElement(e.target ?? null);

  const action = resolveKeyboardShortcut({
    key: e.key,
    code: e.code,
    ctrlKey: e.ctrlKey,
    metaKey: e.metaKey,
    altKey: e.altKey,
    repeat: e.repeat,
    isInputFocused,
    isGameOver: isGameOverStatus(context.gameStatus),
    isAnyOverlayOpen: context.isAnyOverlayOpen,
    isHelpOpen: context.isHelpOpen,
  });

  if (!action) {
    return false;
  }

  const { shouldPreventDefault, executed } = executeDesktopShortcut(
    action,
    handlers,
    context.isHelpOpen,
  );

  if (shouldPreventDefault && typeof e.preventDefault === 'function') {
    e.preventDefault();
  }

  return executed;
}
