import test from 'node:test';
import assert from 'node:assert/strict';
import {
  shouldShowLevelNavBanner,
  shouldShowVictoryBanner,
  shouldShowDefeatBanner,
  isPrevLevelDisabled,
} from '../src/utils/controllerBannerUtils.ts';

test('controllerBannerUtils — Mobil Kontrolcü Durum ve Gezinme Şeritleri Kuralları', async (t) => {
  await t.test('shouldShowLevelNavBanner eşleştiğinde ve oda editörü kapalıyken true döner', () => {
    assert.equal(shouldShowLevelNavBanner(true, false), true);
    assert.equal(shouldShowLevelNavBanner(true, true), false);
    assert.equal(shouldShowLevelNavBanner(false, false), false);
  });

  await t.test('shouldShowVictoryBanner yalnız oyun kazanıldığında ve oda editörü kapalıyken true döner', () => {
    assert.equal(shouldShowVictoryBanner(true, 'won', false), true);
    assert.equal(shouldShowVictoryBanner(true, 'won', true), false);
    assert.equal(shouldShowVictoryBanner(true, 'playing', false), false);
    assert.equal(shouldShowVictoryBanner(false, 'won', false), false);
  });

  await t.test('shouldShowDefeatBanner yalnız oyun kaybedildiğinde ve oda editörü kapalıyken true döner', () => {
    assert.equal(shouldShowDefeatBanner(true, 'lost', false), true);
    assert.equal(shouldShowDefeatBanner(true, 'lost', true), false);
    assert.equal(shouldShowDefeatBanner(true, 'playing', false), false);
    assert.equal(shouldShowDefeatBanner(false, 'lost', false), false);
  });

  await t.test('isPrevLevelDisabled seviye 1 veya daha küçükken true döner', () => {
    assert.equal(isPrevLevelDisabled(1), true);
    assert.equal(isPrevLevelDisabled(0), true);
    assert.equal(isPrevLevelDisabled(2), false);
    assert.equal(isPrevLevelDisabled(5), false);
  });
});
