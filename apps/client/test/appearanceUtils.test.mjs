import test from 'node:test';
import assert from 'node:assert/strict';
import {
  COLOR_SCHEME_OPTIONS,
  BOARD_THEME_OPTIONS,
  CAMERA_MODE_OPTIONS,
  resolveBallSkinButtonClass,
  resolveBallSkinSwatchClass,
  formatBallSkinAriaLabel,
} from '../src/utils/appearanceUtils.ts';

test('appearanceUtils — Ayarlar Görünüm ve Sahne Seçenekleri Yardımcıları', async (t) => {
  await t.test('sabit seçenek listeleri eksiksiz ve geçerli değerler içerir', () => {
    assert.equal(COLOR_SCHEME_OPTIONS.length, 2);
    assert.deepEqual(COLOR_SCHEME_OPTIONS.map((o) => o.value), ['dark', 'light']);

    assert.equal(BOARD_THEME_OPTIONS.length, 4);
    assert.deepEqual(BOARD_THEME_OPTIONS.map((o) => o.value), [
      'emerald',
      'cyberpunk',
      'crimson',
      'daylight',
    ]);

    assert.equal(CAMERA_MODE_OPTIONS.length, 3);
    assert.deepEqual(CAMERA_MODE_OPTIONS.map((o) => o.value), [
      'isometric',
      'topdown',
      'follow',
    ]);
  });

  await t.test('resolveBallSkinButtonClass aktif ve pasif duruma göre doğru kenarlık sınıflarını döner', () => {
    const activeClass = resolveBallSkinButtonClass(true);
    assert.match(activeClass, /border-brass/);
    assert.match(activeClass, /bg-surface-2/);

    const inactiveClass = resolveBallSkinButtonClass(false);
    assert.match(inactiveClass, /border-line/);
    assert.match(inactiveClass, /text-muted/);
  });

  await t.test('resolveBallSkinSwatchClass bilinen kaplamalara doğru renk ataması yapar', () => {
    assert.equal(resolveBallSkinSwatchClass('chrome'), 'bg-zinc-200');
    assert.equal(resolveBallSkinSwatchClass('emerald'), 'bg-emerald-500');
    assert.equal(resolveBallSkinSwatchClass('plasma'), 'bg-purple-500');
    assert.equal(resolveBallSkinSwatchClass('crimson'), 'bg-rose-500');
  });

  await t.test('resolveBallSkinSwatchClass bilinmeyen kaplamada varsayılan kroma döner', () => {
    assert.equal(resolveBallSkinSwatchClass('unknown-skin'), 'bg-zinc-200');
  });

  await t.test('formatBallSkinAriaLabel seçili ve seçili olmayan durumlarda doğru metin formatlar', () => {
    assert.equal(formatBallSkinAriaLabel('Krom', true), 'Krom (Seçili)');
    assert.equal(formatBallSkinAriaLabel('Krom', false), 'Krom');
  });
});
