import type { EditorTemplate } from './editorTemplates.ts';

/**
 * Şablon butonu için erişilebilir ARIA etiketini üretir.
 */
export function getTemplateCardAriaLabel(template: EditorTemplate): string {
  if (!template || !template.name) return 'Hazır şablon';
  return `${template.name} şablonunu uygula`;
}

/**
 * Şablon kartı butonu için stil sınıfını üretir.
 */
export function resolveTemplateCardClass(): string {
  return 'group flex flex-col items-start rounded-xl border border-line bg-surface-2/30 p-2 text-left transition-colors hover:border-brass/50 hover:bg-surface-2 cursor-pointer';
}

/**
 * Şablonun verilen ID ile eşleşip eşleşmediğini doğrular.
 */
export function isTemplateMatchingId(template: EditorTemplate, id: string): boolean {
  if (!template || !template.id) return false;
  return template.id === id;
}
