'use client';

import {
  Trash2,
  Shuffle,
  Copy,
  Check,
  Link2,
  Upload,
} from 'lucide-react';
import { Button } from '../../primitives';
import {
  type CopiedKind,
  resolveCopyButtonState,
} from '@/utils/editorFooterUtils';

interface EditorGridActionsProps {
  onClearGrid: () => void;
  onRandomizeGrid: () => void;
  copiedKind: CopiedKind;
  onCopyExport: (kind: 'json' | 'link') => void;
  onImportFromClipboard: () => void;
}

/**
 * Harita editörü yardımcı eylemler kümesi:
 * Temizle, Rastgele doldur, JSON/Bağlantı kopyalama ve Panodan içe aktarma
 */
export function EditorGridActions({
  onClearGrid,
  onRandomizeGrid,
  copiedKind,
  onCopyExport,
  onImportFromClipboard,
}: EditorGridActionsProps) {
  const jsonCopyState = resolveCopyButtonState(copiedKind, 'json');
  const linkCopyState = resolveCopyButtonState(copiedKind, 'link');

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        variant="secondary"
        size="sm"
        icon={<Trash2 className="h-3.5 w-3.5 text-danger" aria-hidden="true" />}
        onClick={onClearGrid}
      >
        Temizle
      </Button>

      <Button
        variant="secondary"
        size="sm"
        icon={<Shuffle className="h-3.5 w-3.5 text-brass" aria-hidden="true" />}
        onClick={onRandomizeGrid}
      >
        Rastgele doldur
      </Button>

      <Button
        variant="secondary"
        size="sm"
        icon={
          jsonCopyState.isCopied ? (
            <Check className="h-3.5 w-3.5 text-ok" aria-hidden="true" />
          ) : (
            <Copy className="h-3.5 w-3.5" aria-hidden="true" />
          )
        }
        onClick={() => onCopyExport('json')}
      >
        {jsonCopyState.label}
      </Button>

      <Button
        variant="secondary"
        size="sm"
        icon={
          linkCopyState.isCopied ? (
            <Check className="h-3.5 w-3.5 text-ok" aria-hidden="true" />
          ) : (
            <Link2 className="h-3.5 w-3.5 text-brass" aria-hidden="true" />
          )
        }
        onClick={() => onCopyExport('link')}
      >
        {linkCopyState.label}
      </Button>

      <Button
        variant="secondary"
        size="sm"
        icon={<Upload className="h-3.5 w-3.5" aria-hidden="true" />}
        onClick={onImportFromClipboard}
      >
        Panodan yükle
      </Button>
    </div>
  );
}
