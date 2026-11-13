export type CopiedKind = 'json' | 'link' | null;

export interface CopyButtonState {
  isCopied: boolean;
  label: string;
}

/**
 * Kopyalama butonunun aktif kopyalandı durumunu ve metnini çözer.
 */
export function resolveCopyButtonState(
  activeCopiedKind: CopiedKind,
  targetKind: 'json' | 'link',
): CopyButtonState {
  const isCopied = activeCopiedKind === targetKind;
  if (targetKind === 'json') {
    return {
      isCopied,
      label: isCopied ? 'JSON kopyalandı' : 'JSON kopyala',
    };
  }
  return {
    isCopied,
    label: isCopied ? 'Bağlantı kopyalandı' : 'Bağlantı kopyala',
  };
}

/**
 * İçe aktarma hatasının gösterilip gösterilmeyeceğini belirler.
 */
export function shouldShowImportError(importError: string | null | undefined): boolean {
  return typeof importError === 'string' && importError.trim().length > 0;
}

/**
 * İçe aktarma hata mesajını temizler ve biçimlendirir.
 */
export function formatImportErrorMessage(rawError: string | null | undefined): string {
  if (!shouldShowImportError(rawError)) {
    return '';
  }
  return (rawError as string).trim();
}
