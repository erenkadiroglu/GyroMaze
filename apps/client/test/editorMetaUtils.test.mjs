import test from 'node:test';
import assert from 'node:assert/strict';

import {
  BOARD_SIZE_OPTIONS,
  MAX_MAP_TITLE_LENGTH,
  sanitizeMapTitle,
  formatBoardSizeLabel,
  isBoardSizeSelected,
  resolveBoardSizeButtonClass,
} from '../src/utils/editorMetaUtils.ts';

test('editorMetaUtils — Harita Editörü Üst Bilgi ve Boyut Seçici Yardımcıları', async (t) => {
  await t.test('BOARD_SIZE_OPTIONS beklenen boyutları içerir', () => {
    assert.deepEqual(BOARD_SIZE_OPTIONS, [12, 14, 16]);
    assert.equal(MAX_MAP_TITLE_LENGTH, 40);
  });

  await t.test('sanitizeMapTitle: uzun metinleri 40 karaktere kırpar ve string olmayanları yönetir', () => {
    assert.equal(sanitizeMapTitle('Kısa Başlık'), 'Kısa Başlık');
    const long = 'A'.repeat(50);
    assert.equal(sanitizeMapTitle(long).length, 40);
    // @ts-expect-error test gecersiz tip
    assert.equal(sanitizeMapTitle(null), '');
  });

  await t.test('formatBoardSizeLabel: NxN boyut etiketini doğru formatlar', () => {
    assert.equal(formatBoardSizeLabel(12), '12×12');
    assert.equal(formatBoardSizeLabel(14), '14×14');
    assert.equal(formatBoardSizeLabel(16), '16×16');
    // @ts-expect-error fallback
    assert.equal(formatBoardSizeLabel(null), '12×12');
  });

  await t.test('isBoardSizeSelected: boyut eşleşmesini doğrular', () => {
    assert.equal(isBoardSizeSelected(14, 14), true);
    assert.equal(isBoardSizeSelected(14, 12), false);
  });

  await t.test('resolveBoardSizeButtonClass: seçili ve pasif durum sınıflarını döner', () => {
    const selectedClass = resolveBoardSizeButtonClass(true);
    assert.ok(selectedClass.includes('border-signal bg-signal/15 text-signal'));

    const unselectedClass = resolveBoardSizeButtonClass(false);
    assert.ok(unselectedClass.includes('text-muted'));
  });
});
