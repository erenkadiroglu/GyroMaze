export type ShortcutAction =
  | 'help'
  | 'reset'
  | 'camera'
  | 'mute'
  | 'theme'
  | 'editor'
  | 'leaderboard'
  | 'pairing'
  | 'calibrate'
  | { type: 'level'; level: number };

export interface ResolveShortcutOptions {
  key: string;
  code?: string;
  ctrlKey?: boolean;
  metaKey?: boolean;
  altKey?: boolean;
  repeat?: boolean;
  isInputFocused?: boolean;
  isGameOver?: boolean;
  isAnyOverlayOpen?: boolean;
  isHelpOpen?: boolean;
}

/**
 * Masaüstü sahnesi için klavye girdisini çözümleyip ilgili oyun/HUD eylemine dönüştürür.
 * Giriş alanı odağı, değiştirici tuşlar ve açık modal durumlarını dikkate alır.
 */
export function resolveKeyboardShortcut(
  opts: ResolveShortcutOptions,
): ShortcutAction | null {
  if (
    opts.repeat ||
    opts.ctrlKey ||
    opts.metaKey ||
    opts.altKey ||
    opts.isInputFocused
  ) {
    return null;
  }

  const rawKey = opts.key;
  const lowerKey = rawKey.toLowerCase();

  // Yardım / Kısayol modalı her zaman H veya ? tuşuyla açılıp kapanabilir
  if (rawKey === '?' || lowerKey === 'h') {
    return 'help';
  }

  // Oyun sonlandıysa veya bir modal açıksa diğer kısayollar engellenir
  if (opts.isGameOver || opts.isAnyOverlayOpen) {
    return null;
  }

  if (lowerKey === 'r') return 'reset';
  if (lowerKey === 'c') return 'camera';
  if (lowerKey === 'm') return 'mute';
  if (lowerKey === 'l') return 'theme';
  if (lowerKey === 'e') return 'editor';
  if (lowerKey === 'k') return 'leaderboard';
  if (lowerKey === 'p') return 'pairing';
  if (rawKey === ' ' || opts.code === 'Space') return 'calibrate';

  if (rawKey >= '1' && rawKey <= '5') {
    const lvl = parseInt(rawKey, 10);
    return { type: 'level', level: lvl };
  }

  return null;
}

