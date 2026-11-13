import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getControllerMainAriaLabel,
  getControllerMainContainerClass,
  getControllerFallbackText,
  getControllerFallbackClass,
  formatControllerDocumentTitle,
  isControllerReady,
} from '../src/utils/controllerViewUtils.ts';

test('controllerViewUtils — Mobil Kontrolcü Görünüm ve Sayfa Yardımcıları', async (t) => {
  await t.test('getControllerMainAriaLabel ve container sınıfları doğru döner', () => {
    assert.equal(getControllerMainAriaLabel(), 'GyroMaze Mobil Kontrolcü Paneli');
    const cls = getControllerMainContainerClass();
    assert.match(cls, /min-h-dvh/);
    assert.match(cls, /flex/);
    assert.match(cls, /justify-between/);
  });

  await t.test('fallback metni ve sınıfları standart yükleme durumunu temsil eder', () => {
    assert.equal(getControllerFallbackText(), 'Kontrolcü yükleniyor...');
    const cls = getControllerFallbackClass();
    assert.match(cls, /min-h-dvh/);
    assert.match(cls, /items-center/);
    assert.match(cls, /justify-center/);
  });

  await t.test('formatControllerDocumentTitle oda kodu ve oyuncu yuvasını formatlar', () => {
    assert.equal(
      formatControllerDocumentTitle('ab12cd', 1),
      'GyroMaze Kontrolcü [AB12CD - P1]',
    );
    assert.equal(
      formatControllerDocumentTitle('xy99zz', 2),
      'GyroMaze Kontrolcü [XY99ZZ - P2]',
    );
    assert.equal(formatControllerDocumentTitle(''), 'GyroMaze Kontrolcü');
    assert.equal(formatControllerDocumentTitle(null), 'GyroMaze Kontrolcü');
    assert.equal(formatControllerDocumentTitle(undefined), 'GyroMaze Kontrolcü');
  });

  await t.test('isControllerReady soket ve eşleşme durumlarını doğrular', () => {
    assert.equal(isControllerReady(true, true), true);
    assert.equal(isControllerReady(true, false), false);
    assert.equal(isControllerReady(false, true), false);
    assert.equal(isControllerReady(false, false), false);
    assert.equal(isControllerReady(null, undefined), false);
  });
});

