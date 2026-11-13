import test from 'node:test';
import assert from 'node:assert/strict';

import {
  getTemplateCardAriaLabel,
  resolveTemplateCardClass,
  isTemplateMatchingId,
} from '../src/utils/editorTemplateListUtils.ts';
import { EDITOR_TEMPLATES } from '../src/utils/editorTemplates.ts';

test('editorTemplateListUtils — Harita Editörü Şablon Listesi Yardımcıları', async (t) => {
  const sampleTemplate = EDITOR_TEMPLATES[0];

  await t.test('getTemplateCardAriaLabel: şablon adı içeren açıklayıcı etiket üretir', () => {
    assert.equal(
      getTemplateCardAriaLabel(sampleTemplate),
      `${sampleTemplate.name} şablonunu uygula`,
    );
    // @ts-expect-error fallback
    assert.equal(getTemplateCardAriaLabel(null), 'Hazır şablon');
  });

  await t.test('resolveTemplateCardClass: hover ve geçiş sınıflarını içerir', () => {
    const className = resolveTemplateCardClass();
    assert.ok(className.includes('hover:border-brass/50'));
    assert.ok(className.includes('cursor-pointer'));
  });

  await t.test('isTemplateMatchingId: ID eşleşmesini doğrular', () => {
    assert.equal(isTemplateMatchingId(sampleTemplate, sampleTemplate.id), true);
    assert.equal(isTemplateMatchingId(sampleTemplate, 'non-existent'), false);
    // @ts-expect-error fallback
    assert.equal(isTemplateMatchingId(null, 'test'), false);
  });
});
