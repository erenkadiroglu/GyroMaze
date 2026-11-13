export const NOT_FOUND_TITLE = '404';
export const NOT_FOUND_MESSAGE = 'Aradığınız labirent sayfası bulunamadı.';
export const NOT_FOUND_BACK_ACTION_TEXT = 'Ana Ekrana Dön';

export const NOT_FOUND_CONTAINER_CLASSES =
  'flex min-h-screen flex-col items-center justify-center bg-surface p-4 text-center';

export const NOT_FOUND_BUTTON_CLASSES =
  'mt-6 inline-flex items-center justify-center rounded-xl bg-brass px-4 py-2 text-xs font-semibold text-surface-2 shadow-sm transition-transform hover:scale-105';

/**
 * 404 başlık metnini döner.
 */
export function getNotFoundTitle(): string {
  return NOT_FOUND_TITLE;
}

/**
 * 404 açıklama mesajını döner.
 */
export function getNotFoundMessage(): string {
  return NOT_FOUND_MESSAGE;
}

/**
 * 404 geri dön buton metnini döner.
 */
export function getNotFoundBackActionText(): string {
  return NOT_FOUND_BACK_ACTION_TEXT;
}

/**
 * 404 sayfası için kapsayıcı stillerini döner.
 */
export function getNotFoundContainerClass(): string {
  return NOT_FOUND_CONTAINER_CLASSES;
}

/**
 * 404 geri dön butonu için stil sınıflarını döner.
 */
export function getNotFoundButtonClass(): string {
  return NOT_FOUND_BUTTON_CLASSES;
}

