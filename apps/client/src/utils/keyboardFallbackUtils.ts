/**
 * Masaüstü klavye yönlendirme ve sanal eğim yardımcı motoru.
 */

export const DEFAULT_KEYBOARD_TILT_DEGREES = 20;

export const MOVEMENT_KEY_CODES = [
  'KeyW',
  'KeyA',
  'KeyS',
  'KeyD',
  'ArrowUp',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
] as const;

export type MovementKeyCode = (typeof MOVEMENT_KEY_CODES)[number];

const MOVEMENT_KEY_SET = new Set<string>(MOVEMENT_KEY_CODES);

/**
 * Klavyeyle labirent eğim kontrolünün engellenip engellenmeyeceğini belirler.
 * Modallar açıkken veya oyun 'playing' durumunda değilken eğim güncellenmez.
 */
export function isKeyboardFallbackBlocked(
  isPairingModalOpen: boolean,
  isSettingsOpen: boolean,
  isEditorOpen: boolean,
  isLeaderboardOpen: boolean,
  gameStatus: string,
): boolean {
  return (
    isPairingModalOpen ||
    isSettingsOpen ||
    isEditorOpen ||
    isLeaderboardOpen ||
    gameStatus !== 'playing'
  );
}

export interface KeyboardEventContext {
  ctrlKey?: boolean;
  metaKey?: boolean;
  altKey?: boolean;
  target?: {
    tagName?: string;
    isContentEditable?: boolean;
  } | null;
}

/**
 * Kullanıcı bir form girdisi (input/textarea vb.) içindeyse veya kısayol değiştirici
 * tuşları (Ctrl, Meta, Alt) basılıysa klavye hareket olaylarını yoksayar.
 */
export function shouldIgnoreKeyboardEvent(ctx: KeyboardEventContext): boolean {
  if (ctx.ctrlKey || ctx.metaKey || ctx.altKey) {
    return true;
  }
  const tag = ctx.target?.tagName?.toUpperCase();
  if (
    tag === 'INPUT' ||
    tag === 'TEXTAREA' ||
    tag === 'SELECT' ||
    Boolean(ctx.target?.isContentEditable)
  ) {
    return true;
  }
  return false;
}

/**
 * Verilen tuş kodunun hareket tuşu (WASD veya Ok Tuşları) olup olmadığını denetler.
 */
export function isMovementKey(code: unknown): code is MovementKeyCode {
  if (typeof code !== 'string') return false;
  return MOVEMENT_KEY_SET.has(code);
}

/**
 * Sayfa kaydırmasını önlemek için Ok tuşlarının varsayılan tarayıcı davranışını engeller.
 */
export function shouldPreventDefaultMovementKey(code: string): boolean {
  return typeof code === 'string' && code.startsWith('Arrow');
}

export interface TiltAngles {
  beta: number;
  gamma: number;
}

/**
 * Tek oyunculu modda basılı tuşlara göre (WASD ve Ok Tuşları) bilye eğim açılarını hesaplar.
 */
export function calculateSinglePlayerKeyboardTilt(
  pressedKeys: ReadonlySet<string> | readonly string[],
  tiltDegrees: number = DEFAULT_KEYBOARD_TILT_DEGREES,
): TiltAngles {
  const has = (code: string) =>
    pressedKeys instanceof Set
      ? pressedKeys.has(code)
      : Array.isArray(pressedKeys) && pressedKeys.includes(code);

  let beta = 0;
  let gamma = 0;

  if (has('KeyW') || has('ArrowUp')) {
    beta -= tiltDegrees;
  }
  if (has('KeyS') || has('ArrowDown')) {
    beta += tiltDegrees;
  }
  if (has('KeyA') || has('ArrowLeft')) {
    gamma -= tiltDegrees;
  }
  if (has('KeyD') || has('ArrowRight')) {
    gamma += tiltDegrees;
  }

  return { beta, gamma };
}

export interface MultiplayerTiltAngles {
  p1: TiltAngles;
  p2: TiltAngles;
}

/**
 * Çok oyunculu (2P) modda basılı tuşlara ve bağlı kontrolcülere göre eğim açılarını paylaştırır.
 * 1. Oyuncu: WASD (Telefon bağlı değilse)
 * 2. Oyuncu: Ok Tuşları (Telefon bağlı değilse)
 */
export function calculateMultiplayerKeyboardTilt(
  pressedKeys: ReadonlySet<string> | readonly string[],
  isP1ControllerPaired: boolean,
  isP2ControllerPaired: boolean,
  tiltDegrees: number = DEFAULT_KEYBOARD_TILT_DEGREES,
): MultiplayerTiltAngles {
  const has = (code: string) =>
    pressedKeys instanceof Set
      ? pressedKeys.has(code)
      : Array.isArray(pressedKeys) && pressedKeys.includes(code);

  let p1Beta = 0;
  let p1Gamma = 0;
  if (!isP1ControllerPaired) {
    if (has('KeyW')) p1Beta -= tiltDegrees;
    if (has('KeyS')) p1Beta += tiltDegrees;
    if (has('KeyA')) p1Gamma -= tiltDegrees;
    if (has('KeyD')) p1Gamma += tiltDegrees;
  }

  let p2Beta = 0;
  let p2Gamma = 0;
  if (!isP2ControllerPaired) {
    if (has('ArrowUp')) p2Beta -= tiltDegrees;
    if (has('ArrowDown')) p2Beta += tiltDegrees;
    if (has('ArrowLeft')) p2Gamma -= tiltDegrees;
    if (has('ArrowRight')) p2Gamma += tiltDegrees;
  }

  return {
    p1: { beta: p1Beta, gamma: p1Gamma },
    p2: { beta: p2Beta, gamma: p2Gamma },
  };
}
