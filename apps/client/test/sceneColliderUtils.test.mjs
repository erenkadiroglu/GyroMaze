import test from 'node:test';
import assert from 'node:assert/strict';

import {
  calculateCuboidHalfExtents,
  calculateHoleSensorRadius,
  resolveSensorSlot,
  shouldTriggerHoleFall,
  calculateSlerpAlpha,
  isAnyOverlayModalOpen,
  resolveTargetBallBody,
  resolveGoalRunPath,
} from '../src/utils/sceneColliderUtils.ts';

test('calculateCuboidHalfExtents: tam boyutlari yari-boyut formatina cevirir', () => {
  const half1 = calculateCuboidHalfExtents([12.4, 0.85, 0.4]);
  assert.deepEqual(half1, [6.2, 0.425, 0.2]);

  const half2 = calculateCuboidHalfExtents([0.36, 0.85, 3.2]);
  assert.deepEqual(half2, [0.18, 0.425, 1.6]);
});

test('calculateHoleSensorRadius: gorsel delik yaricapini fiziksel sensor yaricapina (%68) donusturur', () => {
  // Varsayilan yaricap (0.42)
  const defaultRadius = calculateHoleSensorRadius();
  assert.ok(Math.abs(defaultRadius - 0.42 * 0.68) < 1e-6);

  // Ozel yaricap (0.50)
  const customRadius = calculateHoleSensorRadius(0.50);
  assert.ok(Math.abs(customRadius - 0.50 * 0.68) < 1e-6);
});

test('resolveSensorSlot: bilye rigidBody adina gore 1 veya 2 yuvasini doner', () => {
  assert.equal(resolveSensorSlot('ball-p2'), 2);
  assert.equal(resolveSensorSlot('ball-p1'), 1);
  assert.equal(resolveSensorSlot(undefined), 1);
  assert.equal(resolveSensorSlot('unknown'), 1);
});

test('shouldTriggerHoleFall: oyun durumu, sekme gorunurlugu, modal ve cooldown kontrolleri', () => {
  // 1. Oyun oynanmiyor (paused/won)
  assert.equal(
    shouldTriggerHoleFall('paused', false, false, 1000, 0),
    false,
  );

  // 2. Sekme arka planda (gizli)
  assert.equal(
    shouldTriggerHoleFall('playing', true, false, 1000, 0),
    false,
  );

  // 3. Herhangi bir modal acik
  assert.equal(
    shouldTriggerHoleFall('playing', false, true, 1000, 0),
    false,
  );

  // 4. Cooldown suresi (350ms) henuz dolmamis (orn: son temas 100ms once)
  assert.equal(
    shouldTriggerHoleFall('playing', false, false, 1000, 900),
    false,
  );

  // 5. Gecerli temas: oynanıyor, sekme acik, modal yok, cooldown dolmus
  assert.equal(
    shouldTriggerHoleFall('playing', false, false, 1000, 500),
    true,
  );
});

test('calculateSlerpAlpha: tepkisellik ve kare suresine gore slerp katsayisi uretir', () => {
  // Delta 0 iken alpha 0 olmali
  const alphaZero = calculateSlerpAlpha(1.0, 0);
  assert.equal(alphaZero, 0);

  // Normal 60 FPS (16ms)
  const alpha60Fps = calculateSlerpAlpha(1.0, 0.016);
  assert.ok(alpha60Fps > 0 && alpha60Fps < 1.0);

  // Arka plandan donuste yuksek delta (1.5 saniye) geldiginde 0.05 sınırına (clamp) takilmali
  const alphaLargeDelta = calculateSlerpAlpha(1.0, 1.5);
  const alphaMaxExpected = 1 - Math.exp(-1.0 * 0.05);
  assert.ok(Math.abs(alphaLargeDelta - alphaMaxExpected) < 1e-6);
});

test('isAnyOverlayModalOpen: herhangi bir modal acikken true, hepsi kapaliyken false doner', () => {
  assert.equal(isAnyOverlayModalOpen({}), false);
  assert.equal(
    isAnyOverlayModalOpen({
      isPairingModalOpen: false,
      isSettingsOpen: false,
      isEditorOpen: false,
      isLeaderboardOpen: false,
    }),
    false,
  );
  assert.equal(isAnyOverlayModalOpen({ isPairingModalOpen: true }), true);
  assert.equal(isAnyOverlayModalOpen({ isSettingsOpen: true }), true);
  assert.equal(isAnyOverlayModalOpen({ isEditorOpen: true }), true);
  assert.equal(isAnyOverlayModalOpen({ isLeaderboardOpen: true }), true);
});

test('resolveTargetBallBody: yuvaya gore 1P veya 2P bilye govdesini cozumler', () => {
  const b1 = { id: 'p1' };
  const b2 = { id: 'p2' };
  assert.equal(resolveTargetBallBody(1, b1, b2), b1);
  assert.equal(resolveTargetBallBody(2, b1, b2), b2);
});

test('resolveGoalRunPath: yuvaya gore ilgili bilyenin rota gecmisini secer', () => {
  const path1 = [[0, 0], [1, 1]];
  const path2 = [[2, 2], [3, 3]];
  assert.equal(resolveGoalRunPath(1, path1, path2), path1);
  assert.equal(resolveGoalRunPath(2, path1, path2), path2);
});


