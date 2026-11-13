import test from 'node:test';
import assert from 'node:assert/strict';
import {
  INTERACTION_COOLDOWNS,
  MOVING_OBSTACLE_WALL_HIT_SPEED,
  createInteractionCooldownMap,
  resetPlayerInteractionCooldowns,
  evaluateBoostPadHit,
  evaluateTeleportHit,
  evaluateLaserGateHit,
  evaluateMovingObstacleHit,
} from '../src/utils/ballInteractionUtils.ts';

test('ballInteractionUtils — bekleme süreleri ve sabitler eksiksiz tanımlıdır', () => {
  assert.equal(INTERACTION_COOLDOWNS.boostPad, 0.45);
  assert.equal(INTERACTION_COOLDOWNS.teleport, 0.9);
  assert.equal(INTERACTION_COOLDOWNS.laserGate, 0.35);
  assert.equal(INTERACTION_COOLDOWNS.movingObstacle, 0.25);
  assert.equal(MOVING_OBSTACLE_WALL_HIT_SPEED, 5.5);
});

test('ballInteractionUtils — bekleme haritası oluşturma ve sıfırlama', () => {
  const boost = createInteractionCooldownMap();
  const teleport = createInteractionCooldownMap();
  const movingHit = createInteractionCooldownMap();
  const hazardReset = createInteractionCooldownMap();

  assert.deepEqual(boost, { 1: -1, 2: -1 });
  assert.deepEqual(teleport, { 1: -1, 2: -1 });

  // Değerleri güncelle
  boost[1] = 5.2;
  teleport[1] = 4.1;
  movingHit[1] = 3.0;
  hazardReset[1] = 2.5;

  boost[2] = 8.0;

  // 1. Oyuncuyu sıfırla, 2. oyuncu etkilenmemeli
  resetPlayerInteractionCooldowns(boost, teleport, movingHit, hazardReset, 1);
  assert.equal(boost[1], -1);
  assert.equal(teleport[1], -1);
  assert.equal(movingHit[1], -1);
  assert.equal(hazardReset[1], -1);
  assert.equal(boost[2], 8.0);
});

test('ballInteractionUtils — evaluateBoostPadHit hızlandırma rampası kontrolü', () => {
  const boostPads = [
    { position: [2, 3], direction: [1, 0] },
  ];

  // 1. Cooldown süresi içinde çarpışma engellenmeli
  const cooldownRes = evaluateBoostPadHit(
    { x: 2, z: 3 },
    { x: 1, y: 0, z: 0 },
    boostPads,
    1.2, // elapsed
    1.0, // lastBoost (fark 0.2 < 0.45)
  );
  assert.equal(cooldownRes.hit, false);

  // 2. Iskalama
  const missRes = evaluateBoostPadHit(
    { x: 10, z: 10 },
    { x: 1, y: 0, z: 0 },
    boostPads,
    2.0,
    1.0,
  );
  assert.equal(missRes.hit, false);

  // 3. İsabet ve hız vektörü artışı
  const hitRes = evaluateBoostPadHit(
    { x: 2, z: 3 },
    { x: 1, y: 0, z: 0 },
    boostPads,
    2.0,
    1.0,
  );
  assert.equal(hitRes.hit, true);
  assert.ok(hitRes.newVelocity);
  assert.ok(hitRes.newVelocity.x > 1);
});

test('ballInteractionUtils — evaluateTeleportHit kuantum portal kontrolü', () => {
  const teleporters = [
    {
      entry: [1, 2],
      exit: [8, 9],
    },
  ];

  // 1. Cooldown içinde çarpışma yok
  const cooldownRes = evaluateTeleportHit(
    { x: 1, z: 2 },
    teleporters,
    1.5,
    1.0, // fark 0.5 < 0.9
  );
  assert.equal(cooldownRes.hit, false);

  // 2. Iskalama
  const missRes = evaluateTeleportHit(
    { x: 5, z: 5 },
    teleporters,
    3.0,
    1.0,
  );
  assert.equal(missRes.hit, false);

  // 3. Giriş kapısına isabet -> çıkışa ışınlanma
  const hitRes = evaluateTeleportHit(
    { x: 1.1, z: 2.1 },
    teleporters,
    3.0,
    1.0,
  );
  assert.equal(hitRes.hit, true);
  assert.deepEqual(hitRes.destination, [8, 9]);

  // 4. Çıkış kapısına isabet -> girişe ışınlanma (çift yönlü)
  const hitExitRes = evaluateTeleportHit(
    { x: 8.1, z: 9.1 },
    teleporters,
    5.0,
    1.0,
  );
  assert.equal(hitExitRes.hit, true);
  assert.deepEqual(hitExitRes.destination, [1, 2]);
});

test('ballInteractionUtils — evaluateLaserGateHit x ve z eksenlerinde periyodik lazer kontrolü', () => {
  const laserGatesX = [
    {
      position: [0, 2],
      axis: 'x',
      length: 4,
      periodSeconds: 2.0,
      phaseOffset: 0,
    },
  ];

  const laserGatesZ = [
    {
      position: [3, 0],
      axis: 'z',
      length: 4,
      periodSeconds: 2.0,
      phaseOffset: 0,
    },
  ];

  // 1. Boş lazer listesinde false
  assert.equal(
    evaluateLaserGateHit({ x: 0, z: 2 }, [], 0.5, -1, 0.34).hit,
    false,
  );

  // 2. Cooldown içinde false
  assert.equal(
    evaluateLaserGateHit({ x: 0, z: 2 }, laserGatesX, 1.2, 1.0, 0.34).hit,
    false,
  );

  // 3. Lazer pasif döngüde
  const inactiveHit = evaluateLaserGateHit(
    { x: 0, z: 2 },
    laserGatesX,
    1.8,
    -1,
    0.34,
  );
  assert.equal(inactiveHit.hit, false);

  // 4. X ekseni lazer aktif döngüde ve bilye koridorda -> çarpışma
  const activeHitX = evaluateLaserGateHit(
    { x: 0.1, z: 2 },
    laserGatesX,
    0.5,
    -1,
    0.34,
  );
  assert.equal(activeHitX.hit, true);

  // 5. Z ekseni lazer aktif döngüde ve bilye koridorda -> çarpışma
  const activeHitZ = evaluateLaserGateHit(
    { x: 3, z: 0.1 },
    laserGatesZ,
    0.5,
    -1,
    0.34,
  );
  assert.equal(activeHitZ.hit, true);
});

test('ballInteractionUtils — evaluateMovingObstacleHit x ve z ekseni devriye engelleri kontrolü', () => {
  const movingObstacles = [
    {
      id: 'obs-x',
      center: [0, 0],
      axis: 'x',
      amplitude: 2,
      speed: 2,
      phaseOffset: 0,
    },
    {
      id: 'obs-z',
      center: [10, 10],
      axis: 'z',
      amplitude: 2,
      speed: 2,
      phaseOffset: 0,
    },
  ];

  // 1. Boş liste durumunda false
  assert.equal(
    evaluateMovingObstacleHit({ x: 0, z: 0 }, undefined, 1.0, -1, 0.34).hit,
    false,
  );

  // 2. Cooldown içinde false
  assert.equal(
    evaluateMovingObstacleHit({ x: 0, z: 0 }, movingObstacles, 1.1, 1.0, 0.34).hit,
    false,
  );

  // 3. Uzakta -> Iskalama
  assert.equal(
    evaluateMovingObstacleHit({ x: 50, z: 50 }, movingObstacles, 2.0, -1, 0.34).hit,
    false,
  );

  // 4. X ekseni engel çarpışması (t = 0 anında engel [0, 0]'dadır)
  const hitResX = evaluateMovingObstacleHit(
    { x: 0.2, z: 0.2 },
    movingObstacles,
    0,
    -1,
    0.34,
  );
  assert.equal(hitResX.hit, true);
  assert.ok(hitResX.reboundVel);
  assert.equal(hitResX.hitSpeed, MOVING_OBSTACLE_WALL_HIT_SPEED);

  // 5. Z ekseni engel çarpışması (t = 0 anında engel [10, 10]'dadır)
  const hitResZ = evaluateMovingObstacleHit(
    { x: 10.2, z: 10.2 },
    movingObstacles,
    0,
    -1,
    0.34,
  );
  assert.equal(hitResZ.hit, true);
  assert.ok(hitResZ.reboundVel);
});
