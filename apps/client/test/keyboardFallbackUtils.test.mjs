import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DEFAULT_KEYBOARD_TILT_DEGREES,
  MOVEMENT_KEY_CODES,
  isKeyboardFallbackBlocked,
  shouldIgnoreKeyboardEvent,
  isMovementKey,
  shouldPreventDefaultMovementKey,
  calculateSinglePlayerKeyboardTilt,
  calculateMultiplayerKeyboardTilt,
} from '../src/utils/keyboardFallbackUtils.ts';

test('keyboardFallbackUtils — sabitler ve hareket tuş listesi', () => {
  assert.equal(DEFAULT_KEYBOARD_TILT_DEGREES, 20);
  assert.equal(MOVEMENT_KEY_CODES.length, 8);
  assert.ok(MOVEMENT_KEY_CODES.includes('KeyW'));
  assert.ok(MOVEMENT_KEY_CODES.includes('ArrowDown'));
});

test('keyboardFallbackUtils — isKeyboardFallbackBlocked kontrolü', () => {
  // Oyun 'playing' ve hiçbir modal açık değilken engellenmez
  assert.equal(
    isKeyboardFallbackBlocked(false, false, false, false, 'playing'),
    false,
  );

  // Oyun 'paused', 'won' veya 'lost' durumunda engellenir
  assert.equal(
    isKeyboardFallbackBlocked(false, false, false, false, 'paused'),
    true,
  );
  assert.equal(
    isKeyboardFallbackBlocked(false, false, false, false, 'won'),
    true,
  );

  // Herhangi bir modal açıkken engellenir
  assert.equal(
    isKeyboardFallbackBlocked(true, false, false, false, 'playing'),
    true,
  );
  assert.equal(
    isKeyboardFallbackBlocked(false, true, false, false, 'playing'),
    true,
  );
  assert.equal(
    isKeyboardFallbackBlocked(false, false, true, false, 'playing'),
    true,
  );
  assert.equal(
    isKeyboardFallbackBlocked(false, false, false, true, 'playing'),
    true,
  );
});

test('keyboardFallbackUtils — shouldIgnoreKeyboardEvent değiştirici ve form alanlarını yoksayar', () => {
  // Normal tuş
  assert.equal(shouldIgnoreKeyboardEvent({}), false);

  // Değiştirici tuşlar basılıyken
  assert.equal(shouldIgnoreKeyboardEvent({ ctrlKey: true }), true);
  assert.equal(shouldIgnoreKeyboardEvent({ metaKey: true }), true);
  assert.equal(shouldIgnoreKeyboardEvent({ altKey: true }), true);

  // Form alanları odaklıyken
  assert.equal(
    shouldIgnoreKeyboardEvent({ target: { tagName: 'INPUT' } }),
    true,
  );
  assert.equal(
    shouldIgnoreKeyboardEvent({ target: { tagName: 'TEXTAREA' } }),
    true,
  );
  assert.equal(
    shouldIgnoreKeyboardEvent({ target: { tagName: 'SELECT' } }),
    true,
  );
  assert.equal(
    shouldIgnoreKeyboardEvent({ target: { isContentEditable: true } }),
    true,
  );

  // Normal div veya button
  assert.equal(
    shouldIgnoreKeyboardEvent({ target: { tagName: 'BUTTON' } }),
    false,
  );
});

test('keyboardFallbackUtils — isMovementKey ve shouldPreventDefaultMovementKey', () => {
  assert.equal(isMovementKey('KeyW'), true);
  assert.equal(isMovementKey('KeyS'), true);
  assert.equal(isMovementKey('ArrowLeft'), true);
  assert.equal(isMovementKey('KeyR'), false);
  assert.equal(isMovementKey('Space'), false);
  assert.equal(isMovementKey(undefined), false);

  assert.equal(shouldPreventDefaultMovementKey('ArrowUp'), true);
  assert.equal(shouldPreventDefaultMovementKey('ArrowDown'), true);
  assert.equal(shouldPreventDefaultMovementKey('KeyW'), false);
});

test('keyboardFallbackUtils — calculateSinglePlayerKeyboardTilt tek oyunculu eğim hesaplama', () => {
  // Tuşa basılmadı -> { beta: 0, gamma: 0 }
  assert.deepEqual(
    calculateSinglePlayerKeyboardTilt(new Set()),
    { beta: 0, gamma: 0 },
  );

  // W / ArrowUp -> beta -20
  assert.deepEqual(
    calculateSinglePlayerKeyboardTilt(new Set(['KeyW'])),
    { beta: -20, gamma: 0 },
  );
  assert.deepEqual(
    calculateSinglePlayerKeyboardTilt(new Set(['ArrowUp'])),
    { beta: -20, gamma: 0 },
  );

  // S / ArrowDown -> beta +20
  assert.deepEqual(
    calculateSinglePlayerKeyboardTilt(new Set(['KeyS'])),
    { beta: 20, gamma: 0 },
  );

  // A / ArrowLeft -> gamma -20
  assert.deepEqual(
    calculateSinglePlayerKeyboardTilt(new Set(['KeyA'])),
    { beta: 0, gamma: -20 },
  );

  // D / ArrowRight -> gamma +20
  assert.deepEqual(
    calculateSinglePlayerKeyboardTilt(new Set(['KeyD'])),
    { beta: 0, gamma: 20 },
  );

  // Çapraz (W + D)
  assert.deepEqual(
    calculateSinglePlayerKeyboardTilt(new Set(['KeyW', 'KeyD'])),
    { beta: -20, gamma: 20 },
  );

  // Karşıt tuşlar (W + S birbirini nötrler)
  assert.deepEqual(
    calculateSinglePlayerKeyboardTilt(new Set(['KeyW', 'KeyS'])),
    { beta: 0, gamma: 0 },
  );

  // Özel eğim derecesi
  assert.deepEqual(
    calculateSinglePlayerKeyboardTilt(new Set(['KeyW']), 30),
    { beta: -30, gamma: 0 },
  );
});

test('keyboardFallbackUtils — calculateMultiplayerKeyboardTilt çok oyunculu eğim hesaplama', () => {
  const keys = new Set(['KeyW', 'KeyD', 'ArrowDown', 'ArrowLeft']);

  // İki oyuncunun da telefonu bağlı DEĞİL -> P1: WASD, P2: Ok tuşları
  const res1 = calculateMultiplayerKeyboardTilt(keys, false, false);
  assert.deepEqual(res1.p1, { beta: -20, gamma: 20 });
  assert.deepEqual(res1.p2, { beta: 20, gamma: -20 });

  // 1. Oyuncunun telefonu bağlı -> P1 klavyesi yoksayılır (0,0), P2 çalışır
  const res2 = calculateMultiplayerKeyboardTilt(keys, true, false);
  assert.deepEqual(res2.p1, { beta: 0, gamma: 0 });
  assert.deepEqual(res2.p2, { beta: 20, gamma: -20 });

  // 2. Oyuncunun telefonu bağlı -> P2 klavyesi yoksayılır (0,0), P1 çalışır
  const res3 = calculateMultiplayerKeyboardTilt(keys, false, true);
  assert.deepEqual(res3.p1, { beta: -20, gamma: 20 });
  assert.deepEqual(res3.p2, { beta: 0, gamma: 0 });

  // İkisinin de telefonu bağlı -> ikisi de (0,0)
  const res4 = calculateMultiplayerKeyboardTilt(keys, true, true);
  assert.deepEqual(res4.p1, { beta: 0, gamma: 0 });
  assert.deepEqual(res4.p2, { beta: 0, gamma: 0 });
});

