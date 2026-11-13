import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getDefeatModalTitle,
  formatDefeatModalDescription,
  formatDefeatCrystalMessage,
  getDefeatActionsConfig,
} from '../src/utils/defeatModalUtils.ts';

test('defeatModalUtils — Süre Doldu (Yenilgi) Modalı Yardımcıları', async (t) => {
  await t.test('getDefeatModalTitle standart başlığı döner', () => {
    assert.equal(getDefeatModalTitle(), 'Süre doldu');
  });

  await t.test('formatDefeatModalDescription süreyi doğru formatlar ve sınır değerleri korur', () => {
    assert.equal(
      formatDefeatModalDescription(28),
      '28 saniyelik süre içinde portala ulaşılamadı.',
    );
    assert.equal(
      formatDefeatModalDescription(NaN),
      '24 saniyelik süre içinde portala ulaşılamadı.',
    );
    assert.equal(
      formatDefeatModalDescription(-5),
      '1 saniyelik süre içinde portala ulaşılamadı.',
    );
  });

  await t.test('formatDefeatCrystalMessage kristal oranını ve ipucunu formatlar', () => {
    assert.equal(
      formatDefeatCrystalMessage('3/4'),
      'Toplanan kristal: 3/4. Daha hızlı bir başlangıç için bilyeyi sıfırlayıp yeniden dene.',
    );
    assert.equal(
      formatDefeatCrystalMessage(''),
      'Toplanan kristal: 0/0. Daha hızlı bir başlangıç için bilyeyi sıfırlayıp yeniden dene.',
    );
  });

  await t.test('getDefeatActionsConfig eylem butonları metinlerini döner', () => {
    const config = getDefeatActionsConfig();
    assert.equal(config.switchModeLabel, 'Modu değiştir');
    assert.equal(config.retryLabel, 'Tekrar dene');
  });
});

