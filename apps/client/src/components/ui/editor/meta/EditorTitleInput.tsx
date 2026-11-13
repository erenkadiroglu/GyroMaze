'use client';

import { MAX_MAP_TITLE_LENGTH } from '@/utils/editorMetaUtils';

interface EditorTitleInputProps {
  customTitle: string;
  onTitleChange: (title: string) => void;
}

/**
 * Harita adı metin giriş alanı
 */
export function EditorTitleInput({
  customTitle,
  onTitleChange,
}: EditorTitleInputProps) {
  return (
    <div>
      <label
        htmlFor="level-title-input"
        className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted"
      >
        Harita adı
      </label>
      <input
        id="level-title-input"
        type="text"
        value={customTitle}
        maxLength={MAX_MAP_TITLE_LENGTH}
        onChange={(e) => onTitleChange(e.target.value)}
        className="w-full rounded-xl border border-line bg-surface-2/40 px-3 py-2 text-xs text-fg focus:border-signal focus:outline-none"
      />
    </div>
  );
}
