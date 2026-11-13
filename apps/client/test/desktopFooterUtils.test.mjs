import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getFooterAriaLabel,
  getFooterContainerClass,
  shouldRenderMiniMap,
  formatFooterSummary,
} from '../src/utils/desktopFooterUtils.ts';

test('desktopFooterUtils — Masaüstü HUD Alt Paneli Yardımcıları', async (t) => {
  await t.test('getFooterAriaLabel erişilebilir başlık metnini döner', () => {
    assert.equal(getFooterAriaLabel(), 'Masaüstü oyun alt kontroller paneli');
  });

  await t.test('getFooterContainerClass flex ve hizalama sınıflarını içerir', () => {
    const cls = getFooterContainerClass();
    assert.match(cls, /flex/);
    assert.match(cls, /items-end/);
    assert.match(cls, /justify-between/);
    assert.match(cls, /gap-4/);
  });

  await t.test('shouldRenderMiniMap boolean bayrağı doğrular', () => {
    assert.equal(shouldRenderMiniMap(true), true);
    assert.equal(shouldRenderMiniMap(false), false);
    assert.equal(shouldRenderMiniMap(null), false);
    assert.equal(shouldRenderMiniMap(undefined), false);
  });

  await t.test('formatFooterSummary aktif durumlara göre net özet üretir', () => {
    assert.equal(
      formatFooterSummary(true, true, true),
      'Alt Panel: Çok Oyunculu, Kontrolcü Bağlı, Radar Açık',
    );
    assert.equal(
      formatFooterSummary(false, false, false),
      'Alt Panel: Tek Oyunculu, Klavye Aktif, Radar Gizli',
    );
  });
});

