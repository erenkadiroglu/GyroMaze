import test from 'node:test';
import assert from 'node:assert/strict';
import {
  formatPhysicsScaleLabel,
  formatTiltResponsivenessLabel,
  isTurboPhysics,
  isInstantTilt,
} from '../src/utils/physicsSectionUtils.ts';

test('physicsSectionUtils — Ayarlar Fizik ve Kontrol Yardımcıları', async (t) => {
  await t.test('formatPhysicsScaleLabel bilinen ve bilinmeyen değerleri doğru formatlar', () => {
    assert.equal(formatPhysicsScaleLabel(28), 'Yavaş (28)');
    assert.equal(formatPhysicsScaleLabel(36), 'Standart (36)');
    assert.equal(formatPhysicsScaleLabel(46), 'Turbo (46)');
    assert.equal(formatPhysicsScaleLabel(50), '50');
  });

  await t.test('formatTiltResponsivenessLabel tepki seçeneklerini doğru formatlar', () => {
    assert.equal(formatTiltResponsivenessLabel(18), 'Yumuşak (18)');
    assert.equal(formatTiltResponsivenessLabel(32), 'Standart (32)');
    assert.equal(formatTiltResponsivenessLabel(48), 'Anında (48)');
    assert.equal(formatTiltResponsivenessLabel(60), '60');
  });

  await t.test('isTurboPhysics turbo mod eşiğini doğru doğrular', () => {
    assert.equal(isTurboPhysics(46), true);
    assert.equal(isTurboPhysics(50), true);
    assert.equal(isTurboPhysics(36), false);
    assert.equal(isTurboPhysics(28), false);
  });

  await t.test('isInstantTilt anında tepki eşiğini doğru doğrular', () => {
    assert.equal(isInstantTilt(48), true);
    assert.equal(isInstantTilt(55), true);
    assert.equal(isInstantTilt(32), false);
    assert.equal(isInstantTilt(18), false);
  });
});
