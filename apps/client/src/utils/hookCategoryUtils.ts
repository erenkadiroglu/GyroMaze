/**
 * İstemci Kanca (Hooks) kategorileri ve mimari sınıflandırma yardımcıları.
 */

export const HOOK_CATEGORIES = [
  'desktop',
  'controller',
  'scene',
  'settings',
  'lifecycle',
] as const;

export type HookCategory = (typeof HOOK_CATEGORIES)[number];

/**
 * Kanca adına göre ait olduğu mimari etki alanını tespit eder.
 */
export function resolveHookCategory(hookName: string): HookCategory {
  const name = (hookName ?? '').trim();

  if (name.includes('Controller') || name.includes('Gimbal') || name.includes('DeviceOrientation')) {
    return 'controller';
  }

  if (name.includes('Maze') || name.includes('Ball') || name.includes('MotionTrail') || name.includes('Ghost') || name.includes('WebGL')) {
    return 'scene';
  }

  if (name.includes('Desktop') || name.includes('Header') || name.includes('HUD') || name.includes('Attitude') || name.includes('QuickControls')) {
    return 'desktop';
  }

  if (name.includes('Settings') || name.includes('AppPreferences') || name.includes('Theme')) {
    return 'settings';
  }

  return 'lifecycle';
}

/**
 * Belirtilen kancanın 3B sahne simülasyonuna ait olup olmadığını doğrular.
 */
export function isSceneHook(hookName: string): boolean {
  return resolveHookCategory(hookName) === 'scene';
}

/**
 * Belirtilen kancanın mobil kontrolcüye ait olup olmadığını doğrular.
 */
export function isControllerHook(hookName: string): boolean {
  return resolveHookCategory(hookName) === 'controller';
}

/**
 * Geliştirici ve hata ayıklama telemetrisi için kanca adı ve kategorisini etiketler.
 */
export function formatHookDebugLabel(hookName: string): string {
  const safeName = (hookName ?? '').trim() || 'useAnonymousHook';
  const category = resolveHookCategory(safeName);
  return `[${category.toUpperCase()}] ${safeName}`;
}
