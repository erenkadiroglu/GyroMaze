import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getHeaderAriaLabel,
  getHeaderStatusPanelClass,
  formatHeaderStateSummary,
  isHeaderActionAvailable,
} from '../src/utils/desktopHeaderUtils.ts';

test('desktopHeaderUtils — Masaüstü HUD Üst Bilgi Çubuğu Yardımcıları', async (t) => {
  await t.test('getHeaderAriaLabel erişilebilir başlık metnini döner', () => {
    assert.equal(getHeaderAriaLabel(), 'Masaüstü oyun üst bilgi çubuğu');
  });

  await t.test('getHeaderStatusPanelClass panel ve gölge stillerini içerir', () => {
    const cls = getHeaderStatusPanelClass();
    assert.match(cls, /gm-panel/);
    assert.match(cls, /pointer-events-auto/);
    assert.match(cls, /rounded-2xl/);
  });

  await t.test('formatHeaderStateSummary solo modda kristal, süre ve oyun modunu birleştirir', () => {
    assert.equal(
      formatHeaderStateSummary('3/5', '00:15.2', false),
      'Kristaller: 3/5, Süre: 00:15.2, Mod: Tek Oyunculu',
    );
  });

  await t.test('formatHeaderStateSummary çok oyunculu ve boş değer fallback durumlarını korur', () => {
    assert.equal(
      formatHeaderStateSummary('', '', true),
      'Kristaller: 0/0, Süre: 00:00.0, Mod: Çok Oyunculu',
    );
  });

  await t.test('isHeaderActionAvailable bilinen aksiyonları kabul eder, diğerlerini reddeder', () => {
    assert.equal(isHeaderActionAvailable('pairing'), true);
    assert.equal(isHeaderActionAvailable('settings'), true);
    assert.equal(isHeaderActionAvailable('help'), true);
    assert.equal(isHeaderActionAvailable('unknown'), false);
    assert.equal(isHeaderActionAvailable(''), false);
  });
});

