import test from 'node:test';
import assert from 'node:assert/strict';
import {
  resolveIsInteractive,
  stepHazardElapsed,
  resolveP2BallVisibility,
} from '../src/utils/stageLoopUtils.ts';

test('stageLoopUtils — 3B Sahne Kare Döngüsü ve Etkileşim Kuralları', async (t) => {
  await t.test('resolveIsInteractive tüm koşullar sağlandığında true döner', () => {
    assert.equal(resolveIsInteractive('playing', false, false), true);
    assert.equal(resolveIsInteractive('waiting', false, false), false);
    assert.equal(resolveIsInteractive('won', false, false), false);
    assert.equal(resolveIsInteractive('lost', false, false), false);
    assert.equal(resolveIsInteractive('playing', true, false), false); // Sayfa gizli
    assert.equal(resolveIsInteractive('playing', false, true), false); // Modal açık
  });

  await t.test('stepHazardElapsed etkileşimliyken güvenli delta ekler, duraklatıldığında sabit kalır', () => {
    assert.equal(stepHazardElapsed(10, 0.016, true), 10.016);
    assert.equal(stepHazardElapsed(10, 0.016, false), 10);
    // 0.05 sınırlandırması (max clamp)
    assert.equal(stepHazardElapsed(10, 0.2, true), 10.05);
    // Negatif veya geçersiz delta koruması
    assert.equal(stepHazardElapsed(10, -0.01, true), 10);
  });

  await t.test('resolveP2BallVisibility multiplayer ve gövde varlığında true döner', () => {
    assert.equal(resolveP2BallVisibility(true, true), true);
    assert.equal(resolveP2BallVisibility(true, false), false);
    assert.equal(resolveP2BallVisibility(false, true), false);
    assert.equal(resolveP2BallVisibility(false, false), false);
  });
});

