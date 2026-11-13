import test from 'node:test';
import assert from 'node:assert/strict';
import {
  cx,
  getModalWidthClass,
  formatShortcutTitle,
  calculateNextRadioIndex,
} from '../src/utils/primitiveUtils.ts';

test('primitiveUtils — Arayüz Temel Bileşen Yardımcıları', async (t) => {
  await t.test('cx falsy değerleri filtreleyip doğru birleştirir', () => {
    assert.equal(cx('btn', false, null, undefined, 'btn-primary'), 'btn btn-primary');
    assert.equal(cx('', false, null), '');
    assert.equal(cx('a', 'b', 'c'), 'a b c');
  });

  await t.test('getModalWidthClass her boyut için doğru sınıfı döner', () => {
    assert.equal(getModalWidthClass('sm'), 'max-w-sm');
    assert.equal(getModalWidthClass('md'), 'max-w-md');
    assert.equal(getModalWidthClass('lg'), 'max-w-lg');
    assert.equal(getModalWidthClass('xl'), 'max-w-3xl');
    assert.equal(getModalWidthClass(), 'max-w-md');
  });

  await t.test('formatShortcutTitle kısayol metnini doğru ekler', () => {
    assert.equal(formatShortcutTitle('Sıfırla', 'R'), 'Sıfırla (R)');
    assert.equal(formatShortcutTitle('Kapat'), 'Kapat');
    assert.equal(formatShortcutTitle('Kapat', ''), 'Kapat');
    assert.equal(formatShortcutTitle('Kapat', '   '), 'Kapat');
  });

  await t.test('calculateNextRadioIndex yön tuşlarıyla döngüsel index hesaplar', () => {
    // ArrowRight / ArrowDown (ileri)
    assert.equal(calculateNextRadioIndex('ArrowRight', 0, 3), 1);
    assert.equal(calculateNextRadioIndex('ArrowDown', 2, 3), 0); // döngü

    // ArrowLeft / ArrowUp (geri)
    assert.equal(calculateNextRadioIndex('ArrowLeft', 0, 3), 2); // döngü
    assert.equal(calculateNextRadioIndex('ArrowUp', 2, 3), 1);

    // Home / End
    assert.equal(calculateNextRadioIndex('Home', 2, 3), 0);
    assert.equal(calculateNextRadioIndex('End', 0, 3), 2);

    // Tanımsız tuş veya tek öğe
    assert.equal(calculateNextRadioIndex('Enter', 0, 3), -1);
    assert.equal(calculateNextRadioIndex('ArrowRight', 0, 1), -1);
  });
});

