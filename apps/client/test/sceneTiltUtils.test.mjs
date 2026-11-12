import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateClampedTiltAngles,
  formatPathPoint,
  canRecordPathPoint,
  calculateBallLinvelStep,
} from '../src/utils/sceneTiltUtils.ts';

test('sceneTiltUtils — 3B Tabla Eğim ve Bilye Hız Hesaplama Motoru', async (t) => {
  await t.test(
    'calculateClampedTiltAngles oyun duraklatıldığında veya etkileşimsizken 0 döner',
    () => {
      const idle = calculateClampedTiltAngles(25, -20, false);
      assert.deepEqual(idle, { pitchRad: 0, rollRad: 0 });
    },
  );

  await t.test(
    'calculateClampedTiltAngles dereceleri doğru radyana çevirir ve roll işaretini tersler',
    () => {
      const angles = calculateClampedTiltAngles(10, 15, true);
      // 10 derece = 0.174533 rad
      // -15 derece = -0.261799 rad
      assert.ok(Math.abs(angles.pitchRad - 0.174533) < 0.0001);
      assert.ok(Math.abs(angles.rollRad - (-0.261799)) < 0.0001);
    },
  );

  await t.test(
    'calculateClampedTiltAngles aşırı eğimlerde MAX_TILT_RADIANS sınırını aşmaz',
    () => {
      const clamped = calculateClampedTiltAngles(90, -90, true, 0.45);
      assert.equal(clamped.pitchRad, 0.45);
      assert.equal(clamped.rollRad, 0.45); // -(-90) = +90 => clamp 0.45

      const negClamped = calculateClampedTiltAngles(-90, 90, true, 0.45);
      assert.equal(negClamped.pitchRad, -0.45);
      assert.equal(negClamped.rollRad, -0.45);
    },
  );

  await t.test(
    'formatPathPoint koordinatları iki ondalık basamağa yuvarlar',
    () => {
      assert.deepEqual(formatPathPoint(1.2345, -3.9876), [1.23, -3.99]);
      assert.deepEqual(formatPathPoint(0, 0), [0, 0]);
    },
  );

  await t.test(
    'canRecordPathPoint yol tamponu sınırını doğru denetler',
    () => {
      assert.equal(canRecordPathPoint(0, 600), true);
      assert.equal(canRecordPathPoint(599, 600), true);
      assert.equal(canRecordPathPoint(600, 600), false);
      assert.equal(canRecordPathPoint(605, 600), false);
    },
  );

  await t.test(
    'calculateBallLinvelStep etkileşimsizken hızı sıfırlar, etkileşimliyken eğim ivmesini uygular',
    () => {
      const curVel = { x: 2, y: 0, z: 1 };
      const still = calculateBallLinvelStep(curVel, { x: 0.2, z: -0.1 }, 1.0, 0.016, false);
      assert.deepEqual(still, { x: 0, y: 0, z: 0 });

      // z < 0 olduğunda accelX > 0 (-sin(-0.1) > 0), x > 0 olduğunda accelZ > 0 (sin(0.2) > 0)
      const moving = calculateBallLinvelStep({ x: 0, y: 0, z: 0 }, { x: 0.2, z: -0.1 }, 1.0, 0.016, true);
      assert.ok(moving.x > 0);
      assert.ok(moving.z > 0);
      assert.equal(moving.y, 0);
    },
  );
});
