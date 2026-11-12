import test from 'node:test';
import assert from 'node:assert/strict';

import {
  calculateLaserGateGeometry,
  calculateBoostYaw,
  calculateOuterWallConfigs,
  summarizeLevelHazards,
  resolveGoalPortalConfig,
} from '../src/utils/sceneGeometry.ts';

test('calculateLaserGateGeometry: yatay ve dikey lazer eksenlerinde sutun ve isin geometrisi', () => {
  // Yatay ('x') eksen lazer kapisi: merkez [2, 3], uzunluk 2.4
  const gateX = {
    position: [2, 3],
    length: 2.4,
    axis: 'x',
  };
  const geomX = calculateLaserGateGeometry(gateX);
  // Sutun 1 ve 2: x ekseninde yarim boy (1.2) sola ve saga kaymali
  assert.deepEqual(geomX.p1, [2 - 1.2, 0.35, 3]);
  assert.deepEqual(geomX.p2, [2 + 1.2, 0.35, 3]);
  // Isin boyutu: [2.4, 0.14, 0.08]
  assert.deepEqual(geomX.beamSize, [2.4, 0.14, 0.08]);

  // Dikey ('z') eksen lazer kapisi: merkez [-1, 4], uzunluk 3.0
  const gateZ = {
    position: [-1, 4],
    length: 3.0,
    axis: 'z',
  };
  const geomZ = calculateLaserGateGeometry(gateZ);
  // Sutun 1 ve 2: z ekseninde yarim boy (1.5) yukari ve asagi kaymali
  assert.deepEqual(geomZ.p1, [-1, 0.35, 4 - 1.5]);
  assert.deepEqual(geomZ.p2, [-1, 0.35, 4 + 1.5]);
  // Isin boyutu: [0.08, 0.14, 3.0]
  assert.deepEqual(geomZ.beamSize, [0.08, 0.14, 3.0]);
});

test('calculateBoostYaw: yon vektorune gore radyan acisini dogru hesaplar', () => {
  // Z pozitif yon (asagi) -> 0 radyan
  assert.equal(calculateBoostYaw([0, 1]), 0);

  // X pozitif yon (saga) -> Math.PI / 2
  assert.ok(Math.abs(calculateBoostYaw([1, 0]) - Math.PI / 2) < 1e-6);

  // X negatif yon (sola) -> -Math.PI / 2
  assert.ok(Math.abs(calculateBoostYaw([-1, 0]) - (-Math.PI / 2)) < 1e-6);

  // Z negatif yon (yukari) -> Math.PI veya -Math.PI
  assert.ok(Math.abs(Math.abs(calculateBoostYaw([0, -1])) - Math.PI) < 1e-6);
});

test('calculateOuterWallConfigs: tahta boyutuna gore 4 cevreleyen dis duvari uretir', () => {
  const walls12 = calculateOuterWallConfigs(12);
  assert.equal(walls12.length, 4);

  // 1. Duvar: Ust dis duvar (Z = -6)
  assert.deepEqual(walls12[0].position, [0, 0.425, -6]);
  assert.deepEqual(walls12[0].size, [12.4, 0.85, 0.4]);

  // 2. Duvar: Alt dis duvar (Z = +6)
  assert.deepEqual(walls12[1].position, [0, 0.425, 6]);
  assert.deepEqual(walls12[1].size, [12.4, 0.85, 0.4]);

  // 3. Duvar: Sol dis duvar (X = -6)
  assert.deepEqual(walls12[2].position, [-6, 0.425, 0]);
  assert.deepEqual(walls12[2].size, [0.4, 0.85, 12]);

  // 4. Duvar: Sag dis duvar (X = +6)
  assert.deepEqual(walls12[3].position, [6, 0.425, 0]);
  assert.deepEqual(walls12[3].size, [0.4, 0.85, 12]);
});

test('summarizeLevelHazards: haritadaki tum tehlikeleri guvenle ozetler', () => {
  const mockLevel = {
    voidHoles: [{ position: [0, 0] }, { position: [1, 1] }],
    laserGates: [{ position: [2, 2], length: 2, axis: 'x' }],
    boostPads: [{ position: [3, 3], direction: [1, 0] }],
    teleporters: [{ entry: [4, 4], exit: [-4, -4] }],
    movingObstacles: [{ center: [5, 5], axis: 'x', amplitude: 1, speed: 2, phaseOffset: 0 }],
  };

  const summary = summarizeLevelHazards(mockLevel);
  assert.equal(summary.voidHolesCount, 2);
  assert.equal(summary.laserGatesCount, 1);
  assert.equal(summary.boostPadsCount, 1);
  assert.equal(summary.teleportersCount, 2, '1 cift teleporter 2 portal kapisi eder');
  assert.equal(summary.movingObstaclesCount, 1);
});

test('resolveGoalPortalConfig: kilitli ve acik portallarda dogru renk ve isik konfigrasyonu doner', () => {
  const locked = resolveGoalPortalConfig(false);
  assert.equal(locked.ringEmissive, '#f59e0b', 'Kilitli portal kehribar rengi olmali');
  assert.equal(locked.pointLightColor, '#f59e0b');
  assert.equal(locked.pointLightIntensity, 3.0);

  const unlocked = resolveGoalPortalConfig(true);
  assert.equal(unlocked.ringEmissive, '#10b981', 'Acilmis portal zumrut rengi olmali');
  assert.equal(unlocked.pointLightColor, '#10b981');
  assert.equal(unlocked.pointLightIntensity, 3.0);
});

