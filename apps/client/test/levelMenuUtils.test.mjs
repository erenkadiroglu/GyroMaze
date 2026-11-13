import test from 'node:test';
import assert from 'node:assert/strict';

import {
  isStandardLevelActive,
  formatLevelBestTimeText,
  formatLevelStarsText,
  isProceduralActive,
  formatProceduralBadgeText,
} from '../src/utils/levelMenuUtils.ts';

test('levelMenuUtils — Bölüm Seçici Menü Kuralları ve Metin Formatlayıcıları', async (t) => {
  await t.test('isStandardLevelActive: yalniz ozel harita degilken ve id eslesirken true doner', () => {
    assert.equal(isStandardLevelActive(1, 1, 1), true);
    assert.equal(isStandardLevelActive(1, 2, 1), false);
    assert.equal(isStandardLevelActive(1, 1, 99), false);
  });

  await t.test('formatLevelBestTimeText: tamamlanmissa tam saniye, tamamlanmamissa -- doner', () => {
    assert.equal(formatLevelBestTimeText(true, 14.8), '15s');
    assert.equal(formatLevelBestTimeText(true, 6.2), '6s');
    assert.equal(formatLevelBestTimeText(false, 10), '--');
    assert.equal(formatLevelBestTimeText(true, undefined), '--');
  });

  await t.test('formatLevelStarsText: tamamlanmis ve yildiz varsa yildiz glifleri, yoksa ··· doner', () => {
    assert.equal(formatLevelStarsText(true, 3), '★★★');
    assert.equal(formatLevelStarsText(true, 2), '★★');
    assert.equal(formatLevelStarsText(true, 1), '★');
    assert.equal(formatLevelStarsText(true, 0), '···');
    assert.equal(formatLevelStarsText(false, 3), '···');
  });

  await t.test('isProceduralActive: 6 ve uzeri standart disi bolumlerde true, 99da false doner', () => {
    assert.equal(isProceduralActive(5), false);
    assert.equal(isProceduralActive(6), true);
    assert.equal(isProceduralActive(12), true);
    assert.equal(isProceduralActive(99), false);
  });

  await t.test('formatProceduralBadgeText: aktifken shortTag +1, pasifken 06+ doner', () => {
    assert.equal(formatProceduralBadgeText(6, '#06'), '#06 +1');
    assert.equal(formatProceduralBadgeText(2, '#02'), '06+');
    assert.equal(formatProceduralBadgeText(99, 'Özel'), '06+');
  });
});
