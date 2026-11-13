import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateGoalRingRotation,
  calculateCrystalFloatTransform,
  calculateObstacleMeshPosition,
  calculateObstacleRotationY,
  isWithinInteractionCooldown,
  updateTransientTelemetry,
  updateBallActorTransform,
  calculateBallSpawnPosition,
  updateCrystalsAnimation,
  updateLaserBeamsVisibility,
  updateMovingObstaclesTransform,
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

  await t.test(
    'updateTransientTelemetry telemetri nesnesini bellek ayırmadan günceller',
    () => {
      const target = { ballX: 0, ballZ: 0, ballSpeed: 0 };
      updateTransientTelemetry(target, { x: 3, z: 4 }, { x: 6, z: 8 });
      assert.equal(target.ballX, 3);
      assert.equal(target.ballZ, 4);
      assert.equal(target.ballSpeed, 10); // Math.hypot(6, 8) = 10
    },
  );

  await t.test(
    'updateBallActorTransform bilye görsel konumunu, görünürlüğünü ve yuvarlanma açısını uygular',
    () => {
      let setPos = [0, 0, 0];
      const mockMesh = {
        position: {
          set: (x, y, z) => {
            setPos = [x, y, z];
          },
        },
        rotation: { x: 0, z: 0 },
        visible: false,
      };

      updateBallActorTransform(
        mockMesh,
        { x: 5, z: -2 },
        { x: 3.5, z: 0 },
        0.35,
        0.016,
        true,
      );

      assert.equal(mockMesh.visible, true);
      assert.deepEqual(setPos, [5, 0.35, -2]);
      assert.ok(mockMesh.rotation.z < 0); // +X hızı -> negatif Z rotasyonu
    },
  );

  await t.test(
    'calculateBallSpawnPosition 1. ve 2. oyuncu için doğru bilye doğuş koordinatlarını üretir',
    () => {
      const p1Spawn = calculateBallSpawnPosition([-4, 0, -4], 1, 0.8, -0.6, 0.3);
      assert.deepEqual(p1Spawn, [-4, 0.3, -4]);

      const p2Spawn = calculateBallSpawnPosition([-4, 0, -4], 2, 0.8, -0.6, 0.3);
      assert.deepEqual(p2Spawn, [-3.2, 0.3, -4.6]);
    },
  );

  await t.test(
    'updateCrystalsAnimation kristal mesh dizisinin y-pozisyonunu ve y-rotasyonunu günceller',
    () => {
      const mockCrystals = [
        { position: { y: 0 }, rotation: { y: 1 }, visible: true },
        { position: { y: 0 }, rotation: { y: 2 }, visible: false },
      ];
      updateCrystalsAnimation(mockCrystals, 2, 0.5, 0.02);

      // 1. kristal görünür, güncellendi
      assert.ok(mockCrystals[0].position.y > 0.3);
      assert.ok(mockCrystals[0].rotation.y > 1);

      // 2. kristal görünmez, dokunulmadı
      assert.equal(mockCrystals[1].position.y, 0);
      assert.equal(mockCrystals[1].rotation.y, 2);
    },
  );

  await t.test(
    'updateLaserBeamsVisibility lazer kapısı görünürlüğünü periyot saatine göre günceller',
    () => {
      const mockBeams = [{ visible: false }, { visible: true }];
      const gates = [
        { periodSeconds: 3, phaseOffset: 0 },
        { periodSeconds: 4, phaseOffset: 2 },
      ];
      // hazardElapsed = 0.5s -> 1. kapı 0-1.8s aktif, 2. kapı offsetli
      updateLaserBeamsVisibility(mockBeams, gates, 0.5);
      assert.equal(mockBeams[0].visible, true);
    },
  );

  await t.test(
    'updateMovingObstaclesTransform hareketli engellerin 3B konumunu ve dönüşünü ayarlar',
    () => {
      let setPos = null;
      const mockObstacles = [
        {
          position: {
            set: (x, y, z) => {
              setPos = [x, y, z];
            },
          },
          rotation: { y: 0 },
        },
      ];
      const specs = [
        {
          center: [0, 0],
          axis: 'x',
          speed: 2,
          phaseOffset: 0,
          amplitude: 1.5,
        },
      ];
      updateMovingObstaclesTransform(mockObstacles, specs, 0.5, true, 0.016);
      assert.ok(setPos !== null);
      assert.equal(setPos[1], 0.36);
      assert.ok(mockObstacles[0].rotation.y > 0);
    },
  );
});

