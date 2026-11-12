'use client';

import { Sparkles } from 'lucide-react';
import { EDITOR_TEMPLATES, type EditorTemplate } from '@/utils/editorTemplates';

interface LevelEditorTemplatesListProps {
  onApplyTemplate: (template: EditorTemplate) => void;
}

export function LevelEditorTemplatesList({
  onApplyTemplate,
}: LevelEditorTemplatesListProps) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-muted">
        <span>Hazır şablonlar</span>
        <span className="inline-flex items-center gap-1 text-[10px] normal-case text-brass">
          <Sparkles className="h-3 w-3" aria-hidden="true" />
          Hızlı başla
        </span>
      </div>
      <div className="grid grid-cols-2 gap-1.5">
        {EDITOR_TEMPLATES.map((tmpl) => (
          <button
            key={tmpl.id}
            type="button"
            onClick={() => onApplyTemplate(tmpl)}
            className="group flex flex-col items-start rounded-xl border border-line bg-surface-2/30 p-2 text-left transition-colors hover:border-brass/50 hover:bg-surface-2"
          >
            <span className="text-xs font-semibold text-fg group-hover:text-brass">
              {tmpl.name}
            </span>
            <span className="mt-0.5 line-clamp-2 text-[10px] leading-snug text-muted">
              {tmpl.description}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

