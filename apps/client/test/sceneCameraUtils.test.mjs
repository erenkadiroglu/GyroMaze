import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateCameraLerpAlpha,
  calculateDynamicFov,
  calculateCameraTargetTransform,
  calculateBallRollingRotation,
  stepTrailHistory,
  shouldUpdateGhostSample,
} from '../src/utils/sceneCameraUtils.ts';

test('sceneCameraUtils — 3B Dinamik Kamera ve Hareket Takip Motoru', async (t) => {
  await t.test(
    'calculateCameraLerpAlpha kare hızından bağımsız sönümleme katsayısını hesaplar ve [0, 1] aralığına sınırlar',
    () => {
      assert.equal(calculateCameraLerpAlpha(0, 0.016), 0);
      assert.equal(calculateCameraLerpAlpha(10, 0), 0);
      assert.equal(calculateCameraLerpAlpha(-5, 0.016), 0);

      const alpha60fps = calculateCameraLerpAlpha(10, 0.016);
      assert.ok(alpha60fps > 0.14 && alpha60fps < 0.16);

      // Çok büyük delta durumunda 1'i aşmaz
      const maxAlpha = calculateCameraLerpAlpha(100, 10);
      assert.equal(maxAlpha, 1);
    },
  );

  await t.test(
    'calculateDynamicFov hıza bağlı olarak görüş açısını (FOV) pürüzsüzce genişletir',
    () => {
      assert.equal(calculateDynamicFov(0, 42, 6, 10), 42);
      assert.equal(calculateDynamicFov(-2, 42, 6, 10), 42);

      const midFov = calculateDynamicFov(5, 42, 6, 10);
      assert.equal(midFov, 45); // 42 + (5/10) * 6 = 45

      const maxFov = calculateDynamicFov(20, 42, 6, 10);
      assert.equal(maxFov, 48); // 42 + 6 = 48 (tavan sınırı)
    },
  );

  await t.test(
    'calculateCameraTargetTransform farklı kamera modlarında doğru hedef ve odak koordinatları üretir',
    () => {
      const ballPos = { x: 5, z: -3 };
      const roll = 0.1;
      const pitch = 0.05;

      // 1. Top-Down (Kuş Bakışı) Modu
      const topdown = calculateCameraTargetTransform('topdown', ballPos, roll, pitch);
      assert.deepEqual(topdown.lookAt, [0, 0, 0]);
      assert.equal(topdown.targetPos[1], 18.2);
      assert.ok(Math.abs(topdown.targetPos[0] - (-0.12)) < 0.001);

      // 2. Follow (Bilye Takip) Modu
      const follow = calculateCameraTargetTransform('follow', ballPos, roll, pitch);
      assert.ok(Math.abs(follow.lookAt[0] - 5 * 0.52) < 0.001);
      assert.ok(Math.abs(follow.lookAt[2] - -3 * 0.52) < 0.001);
      assert.equal(follow.targetPos[1], 10.8);

      // 3. Isometric (Varsayılan) Modu
      const iso = calculateCameraTargetTransform('isometric', ballPos, roll, pitch);
      assert.deepEqual(iso.lookAt, [0, 0, 0]);
      assert.equal(iso.targetPos[1], 14.5);
    },
  );

  await t.test(
    'calculateBallRollingRotation doğrusal hıza ve bilye yarıçapına göre dönme açılarını fiziksel olarak günceller',
    () => {
      const initialRot = { x: 0, z: 0 };
      const radius = 0.35;
      const delta = 0.016;

      // Sıfır hız
      const still = calculateBallRollingRotation(initialRot, { x: 0, z: 0 }, radius, delta);
      assert.equal(still.x, 0);
      assert.equal(still.z, 0);

      // +Z yönünde hareket (x ekseni etrafında ileri yuvarlanma)
      const forward = calculateBallRollingRotation(initialRot, { x: 0, z: 3.5 }, radius, delta);
      assert.ok(forward.x > 0);
      assert.equal(forward.z, 0);

      // +X yönünde hareket (z ekseni etrafında sağa yuvarlanma -> negatif z rotasyonu)
      const right = calculateBallRollingRotation(initialRot, { x: 3.5, z: 0 }, radius, delta);
      assert.equal(right.x, 0);
      assert.ok(right.z < 0);
    },
  );

  await t.test(
    'stepTrailHistory hareket izi dizisini bellek ayırmadan (Zero GC) geriye doğru enterpolasyonla kaydırır',
    () => {
      const history = [
        { x: 0, z: 0 },
        { x: 0, z: 0 },
        { x: 0, z: 0 },
      ];

      stepTrailHistory(history, { x: 10, z: 5 }, 0.5);

      // İlk eleman yeni pozisyona anında geçer
      assert.equal(history[0].x, 10);
      assert.equal(history[0].z, 5);

      // Boş dizide çökmez
      stepTrailHistory([], { x: 1, z: 1 });
    },
  );

  await t.test(
    'shouldUpdateGhostSample hayalet yarışçı kayıt zamanlamasını hassas ve deterministik yönetir',
    () => {
      // Henüz 0.1 sn dolmadı
      const noSample = shouldUpdateGhostSample(0.05, 0, 0.1);
      assert.equal(noSample.shouldSample, false);
      assert.equal(noSample.nextSampleTime, 0);

      // 0.1 sn doldu
      const sample = shouldUpdateGhostSample(0.12, 0, 0.1);
      assert.equal(sample.shouldSample, true);
      assert.equal(sample.nextSampleTime, 0.1);

      // Büyük atlama (lag / sekme geçişi)
      const catchup = shouldUpdateGhostSample(1.5, 0, 0.1);
      assert.equal(catchup.shouldSample, true);
      assert.equal(catchup.nextSampleTime, 1.5);
    },
  );
});
