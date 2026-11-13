'use client';

import type { EditorTemplate } from '@/utils/editorTemplates';
import {
  getTemplateCardAriaLabel,
  resolveTemplateCardClass,
} from '@/utils/editorTemplateListUtils';

interface EditorTemplateCardProps {
  template: EditorTemplate;
  onApplyTemplate: (template: EditorTemplate) => void;
}

/**
 * Harita editörü tekil şablon seçim kartı
 */
export function EditorTemplateCard({
  template,
  onApplyTemplate,
}: EditorTemplateCardProps) {
  return (
    <button
      type="button"
      onClick={() => onApplyTemplate(template)}
      aria-label={getTemplateCardAriaLabel(template)}
      className={resolveTemplateCardClass()}
    >
      <span className="text-xs font-semibold text-fg group-hover:text-brass">
        {template.name}
      </span>
      <span className="mt-0.5 line-clamp-2 text-[10px] leading-snug text-muted">
        {template.description}
      </span>
    </button>
  );
}
