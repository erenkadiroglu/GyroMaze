import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateGoalRingRotation,
  calculateCrystalFloatTransform,
  calculateObstacleMeshPosition,
  calculateObstacleRotationY,
  isWithinInteractionCooldown,
} from '../src/utils/sceneActorUtils.ts';

test('sceneActorUtils — 3B Aktör Animasyonları ve Etkileşim Zamanlayıcı Motoru', async (t) => {
  await t.test(
    'calculateGoalRingRotation kilitliyken yavaş (0.8 rad/s), açıkken hızlı (2.4 rad/s) döner',
    () => {
      const lockedRot = calculateGoalRingRotation(0, false, 0.05);
      assert.ok(Math.abs(lockedRot - 0.04) < 0.0001);

      const unlockedRot = calculateGoalRingRotation(0, true, 0.05);
      assert.ok(Math.abs(unlockedRot - 0.12) < 0.0001);
    },
  );

  await t.test(
    'calculateCrystalFloatTransform sinüzoidal yükseklik ve 2.5 rad/s dönme üretir',
    () => {
      const { y, rotationY } = calculateCrystalFloatTransform(0, 0, 1.0, 0.02);
      assert.equal(y, 0.42); // sin(0) = 0
      assert.ok(Math.abs(rotationY - 1.05) < 0.0001); // 1.0 + 0.02 * 2.5 = 1.05
    },
  );

  await t.test(
    'calculateObstacleMeshPosition x ve z eksenlerinde doğru 3B koordinat hesaplar',
    () => {
      // X ekseninde salınım
      const obsX = {
        center: [2, 4],
        axis: 'x',
        speed: 1,
        phaseOffset: 0,
        amplitude: 1.5,
      };
      const pos0 = calculateObstacleMeshPosition(obsX, 0);
      assert.deepEqual(pos0, [2, 0.36, 4]);

      // Z ekseninde salınım
      const obsZ = {
        center: [1, 3],
        axis: 'z',
        speed: 1,
        phaseOffset: 0,
        amplitude: 2.0,
      };
      const posZ0 = calculateObstacleMeshPosition(obsZ, 0);
      assert.deepEqual(posZ0, [1, 0.36, 3]);
    },
  );

  await t.test(
    'calculateObstacleRotationY yalnız oyun etkileşimliyken döner',
    () => {
      const idle = calculateObstacleRotationY(1.2, false, 0.05, 1.8);
      assert.equal(idle, 1.2);

      const rotating = calculateObstacleRotationY(1.2, true, 0.05, 1.8);
      assert.ok(Math.abs(rotating - (1.2 + 0.05 * 1.8)) < 0.0001);
    },
  );

  await t.test(
    'isWithinInteractionCooldown bekleme süresini doğru tespit eder',
    () => {
      // Henüz hiç tetiklenmemiş (-1)
      assert.equal(isWithinInteractionCooldown(10, -1, 0.5), false);

      // Cooldown içinde (0.2 sn geçti, eşik 0.5 sn)
      assert.equal(isWithinInteractionCooldown(10.2, 10.0, 0.5), true);

      // Cooldown dolmuş (0.6 sn geçti, eşik 0.5 sn)
      assert.equal(isWithinInteractionCooldown(10.6, 10.0, 0.5), false);
    },
  );
});
