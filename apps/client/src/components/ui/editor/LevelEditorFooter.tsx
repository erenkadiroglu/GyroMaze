'use client';

import type { CopiedKind } from '@/utils/editorFooterUtils';
import { EditorImportErrorAlert } from './footer/EditorImportErrorAlert';
import { EditorGridActions } from './footer/EditorGridActions';
import { EditorPlayButton } from './footer/EditorPlayButton';

interface LevelEditorFooterProps {
  onClearGrid: () => void;
  onRandomizeGrid: () => void;
  copiedKind: CopiedKind;
  onCopyExport: (kind: 'json' | 'link') => void;
  onImportFromClipboard: () => void;
  onPlayCustomLevel: () => void;
  importError: string | null;
}

/**
 * Harita editörü alt çubuğu:
 * İçe aktarma hataları uyarısı, yardımcı eylemler ve seviye başlatma butonu.
 */
export function LevelEditorFooter({
  onClearGrid,
  onRandomizeGrid,
  copiedKind,
  onCopyExport,
  onImportFromClipboard,
  onPlayCustomLevel,
  importError,
}: LevelEditorFooterProps) {
  return (
    <div className="w-full space-y-3">
      <EditorImportErrorAlert importError={importError} />

      <div className="flex flex-wrap items-center justify-between gap-2">
        <EditorGridActions
          onClearGrid={onClearGrid}
          onRandomizeGrid={onRandomizeGrid}
          copiedKind={copiedKind}
          onCopyExport={onCopyExport}
          onImportFromClipboard={onImportFromClipboard}
        />

        <EditorPlayButton onPlayCustomLevel={onPlayCustomLevel} />
      </div>
    </div>
  );
}
