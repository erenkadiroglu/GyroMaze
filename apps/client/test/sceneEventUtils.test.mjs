import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateWallHitIntensity,
  shouldThrottleWallHit,
  isBallSpeedSufficientForWallHit,
  shouldWarnLockedPortal,
  getRemainingCrystalsCount,
  formatLockedPortalMessage,
  formatAllCrystalsCollectedMessage,
  canTriggerGoal,
  resolveHazardFallAction,
} from '../src/utils/sceneEventUtils.ts';

test('sceneEventUtils — 3B Labirent Sahnesi Olay ve Ses/Haptik Kuralları Motoru', async (t) => {
  await t.test(
    'calculateWallHitIntensity hız büyüklüğüne göre ses ve haptik değerlerini doğru ölçekler',
    () => {
      // Düşük hız: haptik yok, ses orantılı
      const low = calculateWallHitIntensity(1.6);
      assert.equal(low.volume, 1.6 / 8);
      assert.equal(low.triggerHaptic, false);

      // Yüksek hız: haptik var (> 2.4)
      const high = calculateWallHitIntensity(3.2);
      assert.equal(high.volume, 3.2 / 8);
      assert.equal(high.triggerHaptic, true);

      // Aşırı hız: ses 1.0 ile sınırlı
      const max = calculateWallHitIntensity(12.0);
      assert.equal(max.volume, 1.0);
      assert.equal(max.triggerHaptic, true);

      // Negatif veya sıfır hız
      const zero = calculateWallHitIntensity(-2);
      assert.equal(zero.volume, 0);
      assert.equal(zero.triggerHaptic, false);
    },
  );

  await t.test(
    'shouldThrottleWallHit ve isBallSpeedSufficientForWallHit çarpışma filtreleme kurallarını uygular',
    () => {
      // 95ms içi ardışık çarpmalar engellenir (throttle = true)
      assert.equal(shouldThrottleWallHit(150, 100, 95), true);
      assert.equal(shouldThrottleWallHit(200, 100, 95), false);

      // 1.3 altı hızlar sessiz sayılır
      assert.equal(isBallSpeedSufficientForWallHit(1.2, 1.3), false);
      assert.equal(isBallSpeedSufficientForWallHit(1.3, 1.3), false);
      assert.equal(isBallSpeedSufficientForWallHit(1.35, 1.3), true);
    },
  );

  await t.test(
    'shouldWarnLockedPortal kilitli portal uyarılarını 1300ms soğuma süresiyle sınırlar',
    () => {
      // 1300ms geçmemişse false döner
      assert.equal(shouldWarnLockedPortal(1500, 1000, 1300), false);
      // 1300ms aşıldığında true döner
      assert.equal(shouldWarnLockedPortal(2400, 1000, 1300), true);
    },
  );

  await t.test(
    'getRemainingCrystalsCount, formatLockedPortalMessage ve formatAllCrystalsCollectedMessage metinleri üretir',
    () => {
      assert.equal(getRemainingCrystalsCount(5, 2), 3);
      assert.equal(getRemainingCrystalsCount(4, 4), 1); // Güvenli asgari 1

      assert.equal(
        formatLockedPortalMessage(3),
        '🔒 Portal Kilitli! Önce kalan 3 enerji kristalini toplayın.',
      );
      assert.equal(
        formatAllCrystalsCollectedMessage(),
        '🔓 Tüm enerji kristalleri toplandı! Hedef Portalı açıldı!',
      );
    },
  );

  await t.test(
    'canTriggerGoal oyun durumu, sekme görünürlüğü ve modal durumlarına göre hedef iznini denetler',
    () => {
      // Oyun devam ediyor, sekme aktif, modal yok -> izin verilir
      assert.equal(canTriggerGoal('playing', false, false), true);

      // Oyun durumu oynanmıyor (won, paused vs.) -> reddedilir
      assert.equal(canTriggerGoal('won', false, false), false);

      // Sekme arka planda (hidden) -> reddedilir
      assert.equal(canTriggerGoal('playing', true, false), false);

      // Herhangi bir modal açık -> reddedilir
      assert.equal(canTriggerGoal('playing', false, true), false);
    },
  );

  await t.test(
    'resolveHazardFallAction tek ve çok oyunculu modlarda doğru bilye sıfırlama ve bildirim aksiyonu üretir',
    () => {
      // Tek oyunculu: otomatik reset, ek bildirim yok
      const singleHole = resolveHazardFallAction(false, 1, 'hole');
      assert.equal(singleHole.shouldResetBall, true);
      assert.equal(singleHole.notificationMessage, undefined);

      const singleLaser = resolveHazardFallAction(false, 1, 'laser');
      assert.equal(singleLaser.shouldResetBall, true);
      assert.equal(singleLaser.notificationMessage, undefined);

      // Çok oyunculu: reset yok (rakip yarışmaya devam eder), slot bazlı uyarı mesajı var
      const multiHoleP1 = resolveHazardFallAction(true, 1, 'hole');
      assert.equal(multiHoleP1.shouldResetBall, false);
      assert.equal(multiHoleP1.notificationMessage, 'Oyuncu 1 boşluğa düştü');

      const multiLaserP2 = resolveHazardFallAction(true, 2, 'laser');
      assert.equal(multiLaserP2.shouldResetBall, false);
      assert.equal(multiLaserP2.notificationMessage, 'Oyuncu 2 lazere çarptı');
    },
  );
});
