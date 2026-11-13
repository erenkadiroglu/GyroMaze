import test from 'node:test';
import assert from 'node:assert/strict';
import {
  shouldShowPauseRecoveryBar,
  getToastMotionVariants,
} from '../src/utils/overlayBarUtils.ts';

test('overlayBarUtils — Sahne Üstü Kurtarma Çubuğu ve Bildirim Kartı Kuralları', async (t) => {
  await t.test('shouldShowPauseRecoveryBar oyun duraklatıldığında ve başka modal açık değilken true döner', () => {
    assert.equal(shouldShowPauseRecoveryBar('paused', false), true);
    assert.equal(shouldShowPauseRecoveryBar('paused', true), false);
    assert.equal(shouldShowPauseRecoveryBar('playing', false), false);
    assert.equal(shouldShowPauseRecoveryBar('won', false), false);
    assert.equal(shouldShowPauseRecoveryBar('lost', false), false);
  });

  await t.test('getToastMotionVariants geçerli framer-motion geçiş koordinatlarını döner', () => {
    const variants = getToastMotionVariants();
    assert.deepEqual(variants.initial, { opacity: 0, y: -10, scale: 0.97 });
    assert.deepEqual(variants.animate, { opacity: 1, y: 0, scale: 1 });
    assert.deepEqual(variants.exit, { opacity: 0, y: -10, scale: 0.97 });
  });
});
