'use client';

import { EDITOR_TEMPLATES, type EditorTemplate } from '@/utils/editorTemplates';
import { EditorTemplatesHeader } from './templates/EditorTemplatesHeader';
import { EditorTemplateCard } from './templates/EditorTemplateCard';

interface LevelEditorTemplatesListProps {
  onApplyTemplate: (template: EditorTemplate) => void;
}

/**
 * Harita editörü hazır şablonlar paleti:
 * Başlık ve 4 doğrulanmış hazır şablon kartı (spiral, kuantum-köprü, kristal-avı, hız-pisti).
 */
export function LevelEditorTemplatesList({
  onApplyTemplate,
}: LevelEditorTemplatesListProps) {
  return (
    <div>
      <EditorTemplatesHeader />
      <div className="grid grid-cols-2 gap-1.5">
        {EDITOR_TEMPLATES.map((tmpl) => (
          <EditorTemplateCard
            key={tmpl.id}
            template={tmpl}
            onApplyTemplate={onApplyTemplate}
          />
        ))}
      </div>
    </div>
  );
}
