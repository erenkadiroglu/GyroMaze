import test from 'node:test';
import assert from 'node:assert/strict';
import {
  shouldShowPauseRecoveryBar,
  getToastMotionVariants,
  getPauseRecoveryMessage,
  getPauseRecoveryActionsConfig,
  resolveToastAriaLive,
  isNotificationPresent,
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

  await t.test('getPauseRecoveryMessage beklenen uyarı metnini döner', () => {
    assert.equal(
      getPauseRecoveryMessage(),
      'Kontrolcü bağlantısı koptu — oyun duraklatıldı',
    );
  });

  await t.test('getPauseRecoveryActionsConfig buton etiketlerini döner', () => {
    const config = getPauseRecoveryActionsConfig();
    assert.equal(config.pairLabel, 'Bağla');
    assert.equal(config.resumeLabel, 'Devam et');
  });

  await t.test('resolveToastAriaLive warn için assertive, diğer durumlar için polite döner', () => {
    assert.equal(resolveToastAriaLive('warn'), 'assertive');
    assert.equal(resolveToastAriaLive('info'), 'polite');
    assert.equal(resolveToastAriaLive('success'), 'polite');
    assert.equal(resolveToastAriaLive(undefined), 'polite');
  });

  await t.test('isNotificationPresent nesne geçerliliğini doğru tespit eder', () => {
    assert.equal(
      isNotificationPresent({ id: 1, message: 'Test bildirim' }),
      true,
    );
    assert.equal(isNotificationPresent(null), false);
    assert.equal(isNotificationPresent(undefined), false);
    assert.equal(isNotificationPresent({ id: 2 }), false);
    assert.equal(isNotificationPresent('string'), false);
  });
});
