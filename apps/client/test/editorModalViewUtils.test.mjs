import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getEditorModalTitle,
  getEditorModalDescription,
  getEditorModalSize,
  resolveEditorModalInitialTitle,
  formatEditorModalAriaLabel,
  isEditorGridEmpty,
  formatEditorToolDescription,
} from '../src/utils/editorModalViewUtils.ts';

test('editorModalViewUtils — Harita Editörü Modalı Görünüm Yardımcıları', async (t) => {
  await t.test('getEditorModalTitle, description ve size standart değerleri döner', () => {
    assert.equal(getEditorModalTitle(), '3B Harita Editörü');
    assert.equal(
      getEditorModalDescription(),
      '8×8 ızgara üzerinde duvar, engel ve hedef noktalarını yerleştirin',
    );
    assert.equal(getEditorModalSize(), 'xl');
  });

  await t.test('resolveEditorModalInitialTitle başlığı temizler ve fallback uygular', () => {
    assert.equal(resolveEditorModalInitialTitle('  Labirent A  '), 'Labirent A');
    assert.equal(resolveEditorModalInitialTitle(''), 'Özel Labirent Haritası');
    assert.equal(resolveEditorModalInitialTitle(null), 'Özel Labirent Haritası');
    assert.equal(resolveEditorModalInitialTitle(undefined), 'Özel Labirent Haritası');
  });

  await t.test('formatEditorModalAriaLabel başlık ve ızgara boyutunu birleştirir', () => {
    assert.equal(
      formatEditorModalAriaLabel('Neon Kale', 16),
      'Neon Kale (16x16 Izgara)',
    );
    assert.equal(
      formatEditorModalAriaLabel('', 0),
      'Özel Harita (12x12 Izgara)',
    );
  });

  await t.test('isEditorGridEmpty tamamen boş veya sıfır dolu matriste true döner', () => {
    assert.equal(
      isEditorGridEmpty([
        [0, 0],
        [0, 0],
      ]),
      true,
    );
    assert.equal(
      isEditorGridEmpty([
        ['empty', null],
        [undefined, 0],
      ]),
      true,
    );
  });

  await t.test('isEditorGridEmpty dolu hücre veya geçersiz matris durumlarını doğru çözer', () => {
    assert.equal(
      isEditorGridEmpty([
        [0, 'wall'],
        [0, 0],
      ]),
      false,
    );
    assert.equal(isEditorGridEmpty([]), true);
    assert.equal(isEditorGridEmpty(undefined), true);
  });

  await t.test('formatEditorToolDescription bilinen tüm araç tiplerini Türkçeleştirir', () => {
    assert.equal(formatEditorToolDescription('wall'), 'Duvar Bloğu');
    assert.equal(formatEditorToolDescription('goal'), 'Hedef Portalı');
    assert.equal(formatEditorToolDescription('crystal'), 'Toplanabilir Kristal');
    assert.equal(formatEditorToolDescription('hole'), 'Boşluk Çukuru');
    assert.equal(formatEditorToolDescription('boost'), 'Hızlandırıcı Rampa');
    assert.equal(formatEditorToolDescription('laser'), 'Lazer Bariyeri');
    assert.equal(formatEditorToolDescription('eraser'), 'Silgi Aracı');
  });

  await t.test('formatEditorToolDescription bilinmeyen araçta varsayılan metne döner', () => {
    assert.equal(formatEditorToolDescription('unknown'), 'Bilinmeyen Araç');
    assert.equal(formatEditorToolDescription(''), 'Bilinmeyen Araç');
  });
});

