export const APP_META_TITLE = 'GyroMaze | Telefonunla Yönettiğin 3B Labirent';
export const APP_META_DESCRIPTION =
  'Telefonunu eğerek masaüstü ekranındaki 3B labirent tablasını yönettiğin, gecikmesiz çok oyunculu beceri oyunu.';

export const VIEWPORT_THEME_COLORS = [
  { media: '(prefers-color-scheme: dark)', color: '#0f1a2b' },
  { media: '(prefers-color-scheme: light)', color: '#e9eef5' },
] as const;

export const DEFAULT_ROOT_BODY_CLASSES =
  'min-h-screen bg-base font-sans text-fg antialiased selection:bg-brass/30';

/**
 * Uygulamanın SEO ve sekme başlığı için standart başlık metnini döner.
 */
export function getAppMetadataTitle(): string {
  return APP_META_TITLE;
}

/**
 * Uygulamanın meta açıklamasını döner.
 */
export function getAppMetadataDescription(): string {
  return APP_META_DESCRIPTION;
}

/**
 * Viewport için tema rengi yapılandırmasını döner.
 */
export function getViewportThemeColors(): Array<{ media: string; color: string }> {
  return [...VIEWPORT_THEME_COLORS];
}

/**
 * `<html>` elemanı için erişilebilir öznitelikleri üretir.
 */
export function resolveHtmlAttributes(scheme: string = 'dark'): {
  lang: string;
  'data-scheme': string;
  suppressHydrationWarning: boolean;
} {
  const safeScheme = scheme === 'light' ? 'light' : 'dark';
  return {
    lang: 'tr',
    'data-scheme': safeScheme,
    suppressHydrationWarning: true,
  };
}

/**
 * `<body>` etiketine uygulanacak Tailwind stil sınıflarını güvenle birleştirir.
 */
export function resolveRootBodyClasses(customClasses?: string): string {
  if (!customClasses || typeof customClasses !== 'string' || !customClasses.trim()) {
    return DEFAULT_ROOT_BODY_CLASSES;
  }
  return `${DEFAULT_ROOT_BODY_CLASSES} ${customClasses.trim()}`;
}

