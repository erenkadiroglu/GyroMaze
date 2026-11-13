import test from 'node:test';
import assert from 'node:assert/strict';

import {
  findCollidingCrystalIndex,
  findCollidingBoostPad,
  calculateBoostVelocity,
  findTeleportDestination,
  isBallCollidingLaserGate,
  calculateMovingObstacleCollision,
  isBallInsideGoal,
  canTriggerGoalReach,
  stepBallVelocity,
} from '../src/utils/sceneCollisions.ts';

test('findCollidingCrystalIndex: toplanmamis kristalleri tespit eder ve toplanmis olanlari yoksayar', () => {
  const crystals = [
    [0, 0],
    [3, 3],
    [-2, 1],
  ];

  // 1. Kristal (0, 0) yakininda bilye (0.1, 0.1)
  const idx1 = findCollidingCrystalIndex({ x: 0.1, z: 0.1 }, crystals, []);
  assert.equal(idx1, 0);

  // 1. Kristal toplanmissa, onu atlamali ve baska carpan yoksa -1 donmeli
  const idxCollected = findCollidingCrystalIndex({ x: 0.1, z: 0.1 }, crystals, [0]);
  assert.equal(idxCollected, -1);

  // 2. Kristal yakininda bilye (3.1, 2.9)
  const idx2 = findCollidingCrystalIndex({ x: 3.1, z: 2.9 }, crystals, [0]);
  assert.equal(idx2, 1);
});

test('findCollidingBoostPad ve calculateBoostVelocity: kinetik rampa carpmalari', () => {
  const pads = [
    { position: [2, 2], direction: [1, 0] },
    { position: [-3, 1], direction: [0, -1] },
  ];

  // (2, 2) rampasina dokunma
  const hitPad = findCollidingBoostPad({ x: 2.1, z: 2.05 }, pads);
  assert.ok(hitPad);
  assert.deepEqual(hitPad.direction, [1, 0]);

  // Uzaktayken null
  const noHit = findCollidingBoostPad({ x: 0, z: 0 }, pads);
  assert.equal(noHit, null);

  // Hiz vektoru guncellemesi (mevcut: [1, 2], yon: [1, 0], impulse: 7.2)
  const newVel = calculateBoostVelocity({ x: 1, z: 2 }, [1, 0], 7.2);
  assert.equal(newVel.x, 8.2);
  assert.equal(newVel.z, 2);
});

test('findTeleportDestination: giris ve cikis portallari arasinda iki yonlu esleme', () => {
  const teleporters = [
    { entry: [-4, -4], exit: [4, 4] },
  ];

  // Giris noktasina temas (entry -> exit)
  const toExit = findTeleportDestination({ x: -3.95, z: -4.05 }, teleporters);
  assert.deepEqual(toExit, [4, 4]);

  // Cikis noktasina temas (exit -> entry)
  const toEntry = findTeleportDestination({ x: 4.05, z: 3.95 }, teleporters);
  assert.deepEqual(toEntry, [-4, -4]);

  // Portal disinda temas yok
  const noPortal = findTeleportDestination({ x: 0, z: 0 }, teleporters);
  assert.equal(noPortal, null);
});

test('isBallCollidingLaserGate: yatay ve dikey lazer isini carpismalari', () => {
  // Yatay lazer: merkez [0, 2], boy 3.0 (-1.5 ile +1.5 arasi x), z = 2
  const gateX = { position: [0, 2], length: 3.0, axis: 'x' };

  // Isinin tam uzerinde
  assert.equal(isBallCollidingLaserGate({ x: 0.5, z: 2.1 }, gateX), true);

  // Isin ekseninde ama uzunlugun disinda (x = 2.5 > 1.5)
  assert.equal(isBallCollidingLaserGate({ x: 2.5, z: 2.0 }, gateX), false);

  // Dikey lazer: merkez [3, 0], boy 2.0 (-1.0 ile +1.0 arasi z), x = 3
  const gateZ = { position: [3, 0], length: 2.0, axis: 'z' };
  assert.equal(isBallCollidingLaserGate({ x: 3.1, z: 0.4 }, gateZ), true);
  assert.equal(isBallCollidingLaserGate({ x: 3.1, z: 2.5 }, gateZ), false);
});

test('calculateMovingObstacleCollision: hareketli engelle carpisma ve geri tepme', () => {
  const obstacle = {
    center: [0, 0],
    axis: 'x',
    amplitude: 2,
    speed: 1,
    phaseOffset: 0,
  };

  // Zaman t=0 aninda engel tam merkezde (0, 0)
  // Bilye (0.5, 0) noktasinda (minDist = 0.34 + 0.38 = 0.72) -> CARPISMA
  const hit = calculateMovingObstacleCollision({ x: 0.5, z: 0 }, obstacle, 0);
  assert.equal(hit.isHit, true);
  assert.ok(hit.reboundVel);
  assert.ok(hit.reboundVel.x > 0, 'Engelin sagindaki bilye saga dogru itilmeli');

  // Bilye uzaktayken (4, 4) -> CARPISMA YOK
  const miss = calculateMovingObstacleCollision({ x: 4, z: 4 }, obstacle, 0);
  assert.equal(miss.isHit, false);
});

test('isBallInsideGoal: hedef portalina ulasilip ulasilmadigini denetler', () => {
  const goal = [5, 0.35, 5];

  // Hedefin icinde
  assert.equal(isBallInsideGoal({ x: 5.2, z: 4.9 }, goal), true);

  // Hedefin disinda
  assert.equal(isBallInsideGoal({ x: 2, z: 2 }, goal), false);
});

test('canTriggerGoalReach: etkilesimli durum, acik kilit ve bilye konumu kurallarini uygular', () => {
  const goal = [5, 0.35, 5];

  // Hedefin icinde, aktif oyun, kilit acik -> true
  assert.equal(canTriggerGoalReach(true, true, { x: 5.1, z: 5.1 }, goal, 0.2116), true);

  // Hedefin icinde ama kilit kapali -> false
  assert.equal(canTriggerGoalReach(true, false, { x: 5.1, z: 5.1 }, goal, 0.2116), false);

  // Hedefin icinde ama etkilesimsiz (modal acik / arka planda) -> false
  assert.equal(canTriggerGoalReach(false, true, { x: 5.1, z: 5.1 }, goal, 0.2116), false);

  // Hedefin disinda -> false
  assert.equal(canTriggerGoalReach(true, true, { x: 2, z: 2 }, goal, 0.2116), false);
});

test('stepBallVelocity: tabla egimine gore ivmelenme ve sonumleme', () => {
  const currentVel = { x: 0, z: 0 };
  const tiltEuler = { x: 0.2, z: -0.2 }; // Eğim açısı radyan
  const gravityScale = 1.0;
  const delta = 0.016; // 60 FPS (16ms)

  const nextVel = stepBallVelocity(currentVel, tiltEuler, gravityScale, delta);

  // Euler z negatif oldugunda: accelX = -gravityScale * sin(z) > 0 (pozitif x ivmesi)
  assert.ok(nextVel.x > 0);
  // Euler x pozitif oldugunda: accelZ = gravityScale * sin(x) > 0 (pozitif z ivmesi)
  assert.ok(nextVel.z > 0);
});

