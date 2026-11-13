'use client';

import {
  shouldShowImportError,
  formatImportErrorMessage,
} from '@/utils/editorFooterUtils';

interface EditorImportErrorAlertProps {
  importError: string | null;
}

/**
 * Harita içe aktarma hatası bildirimi (role="alert")
 */
export function EditorImportErrorAlert({
  importError,
}: EditorImportErrorAlertProps) {
  if (!shouldShowImportError(importError)) {
    return null;
  }

  return (
    <div
      role="alert"
      className="rounded-xl border border-danger/40 bg-danger/10 px-3 py-2 text-xs text-danger"
    >
      {formatImportErrorMessage(importError)}
    </div>
  );
}
