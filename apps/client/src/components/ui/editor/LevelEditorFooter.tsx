'use client';

import {
  Trash2,
  Shuffle,
  Copy,
  Check,
  Link2,
  Upload,
  Play,
} from 'lucide-react';
import { Button } from '../primitives';

interface LevelEditorFooterProps {
  onClearGrid: () => void;
  onRandomizeGrid: () => void;
  copiedKind: 'json' | 'link' | null;
  onCopyExport: (kind: 'json' | 'link') => void;
  onImportFromClipboard: () => void;
  onPlayCustomLevel: () => void;
  importError: string | null;
}

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
      {importError && (
        <div
          role="alert"
          className="rounded-xl border border-danger/40 bg-danger/10 px-3 py-2 text-xs text-danger"
        >
          {importError}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2">
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
              copiedKind === 'json' ? (
                <Check className="h-3.5 w-3.5 text-ok" aria-hidden="true" />
              ) : (
                <Copy className="h-3.5 w-3.5" aria-hidden="true" />
              )
            }
            onClick={() => onCopyExport('json')}
          >
            {copiedKind === 'json' ? 'JSON kopyalandı' : 'JSON kopyala'}
          </Button>
          <Button
            variant="secondary"
            size="sm"
            icon={
              copiedKind === 'link' ? (
                <Check className="h-3.5 w-3.5 text-ok" aria-hidden="true" />
              ) : (
                <Link2 className="h-3.5 w-3.5 text-brass" aria-hidden="true" />
              )
            }
            onClick={() => onCopyExport('link')}
          >
            {copiedKind === 'link' ? 'Bağlantı kopyalandı' : 'Bağlantı kopyala'}
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

        <Button
          variant="primary"
          size="sm"
          icon={<Play className="h-3.5 w-3.5" aria-hidden="true" />}
          onClick={onPlayCustomLevel}
        >
          Bu haritayı oyna
        </Button>
      </div>
    </div>
  );
}

