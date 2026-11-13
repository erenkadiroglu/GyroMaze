import test from 'node:test';
import assert from 'node:assert/strict';
import {
  isLightSceneActive,
  resolveSceneColors,
  calculateShadowMargin,
} from '../src/utils/sceneConfigUtils.ts';

test('sceneConfigUtils — 3B Sahne Arka Plan ve Gölge Hesaplamaları', async (t) => {
  await t.test('isLightSceneActive renk şeması veya temaya göre doğru boolean döner', () => {
    assert.equal(isLightSceneActive('light', 'cyberpunk'), true);
    assert.equal(isLightSceneActive('dark', 'daylight'), true);
    assert.equal(isLightSceneActive('dark', 'emerald'), false);
    assert.equal(isLightSceneActive('dark', 'crimson'), false);
  });

  await t.test('resolveSceneColors aydınlık ve karanlık mod renklerini döner', () => {
    const light = resolveSceneColors(true);
    assert.equal(light.sceneBgColor, '#e9eef5');
    assert.equal(light.fogNear, 18);
    assert.equal(light.fogFar, 38);

    const dark = resolveSceneColors(false);
    assert.equal(dark.sceneBgColor, '#0f1a2b');
    assert.equal(dark.fogNear, 18);
    assert.equal(dark.fogFar, 38);
  });

  await t.test('calculateShadowMargin tahta boyutuna göre en az 9 olmak üzere gölge alanı hesaplar', () => {
    // 12x12 tahta -> ceil(12 * 0.78) = ceil(9.36) = 10 -> max(9, 10) = 10
    assert.equal(calculateShadowMargin(12), 10);
    // 8x8 küçük tahta -> ceil(8 * 0.78) = ceil(6.24) = 7 -> max(9, 7) = 9
    assert.equal(calculateShadowMargin(8), 9);
    // 20x20 büyük tahta -> ceil(20 * 0.78) = ceil(15.6) = 16 -> max(9, 16) = 16
    assert.equal(calculateShadowMargin(20), 16);
    // Geçersiz boardSize -> varsayılan 12
    assert.equal(calculateShadowMargin(0), 10);
  });
});

