import test from 'node:test';
import assert from 'node:assert/strict';
import {
  matchesOptionalRoomId,
  isValidHapticType,
  isValidGameStatus,
  sanitizeGyroSyncData,
  sanitizeChangeLevelPayload,
} from '../src/gateway/gatewayValidationUtils.ts';

test('gatewayValidationUtils — WebSocket Ağ Geçidi Doğrulama Yardımcıları', async (t) => {
  await t.test('matchesOptionalRoomId oda eşleşmesini doğrular', () => {
    assert.equal(matchesOptionalRoomId(undefined, 'ROOM12'), true);
    assert.equal(matchesOptionalRoomId('', 'ROOM12'), true);
    assert.equal(matchesOptionalRoomId('ROOM12', 'ROOM12'), true);
    assert.equal(matchesOptionalRoomId('  ROOM12  ', 'ROOM12'), true);
    assert.equal(matchesOptionalRoomId('OTHER', 'ROOM12'), false);
    assert.equal(matchesOptionalRoomId(12345, 'ROOM12'), false);
  });

  await t.test('isValidHapticType bilinen titreşim türlerini doğrular', () => {
    assert.equal(isValidHapticType('wall'), true);
    assert.equal(isValidHapticType('hole'), true);
    assert.equal(isValidHapticType('goal'), true);
    assert.equal(isValidHapticType('unknown_type'), false);
    assert.equal(isValidHapticType(null), false);
  });

  await t.test('isValidGameStatus standart oyun durumlarını doğrular', () => {
    assert.equal(isValidGameStatus('playing'), true);
    assert.equal(isValidGameStatus('paused'), true);
    assert.equal(isValidGameStatus('won'), true);
    assert.equal(isValidGameStatus('lost'), true);
    assert.equal(isValidGameStatus('invalid'), false);
  });

  await t.test('sanitizeGyroSyncData geçerli paketleri sınırlar ve temizler', () => {
    const cleaned = sanitizeGyroSyncData(
      {
        alpha: 180,
        beta: 60,   // 45'e sınırlandırılmalı
        gamma: -60, // -45'e sınırlandırılmalı
        timestamp: 1000,
      },
      1,
    );
    assert.ok(cleaned);
    assert.equal(cleaned.beta, 45);
    assert.equal(cleaned.gamma, -45);
    assert.equal(cleaned.alpha, 180);
    assert.equal(cleaned.playerSlot, 1);
  });

  await t.test('sanitizeGyroSyncData bozuk NaN ve Infinity paketlerini reddeder', () => {
    assert.equal(
      sanitizeGyroSyncData({ beta: NaN, gamma: 10, alpha: 0, timestamp: 0 }, 1),
      null,
    );
    assert.equal(
      sanitizeGyroSyncData({ beta: 10, gamma: Infinity, alpha: 0, timestamp: 0 }, 2),
      null,
    );
    assert.equal(sanitizeGyroSyncData(undefined, 1), null);
  });

  await t.test('sanitizeChangeLevelPayload yön ve bölüm numaralarını doğrular', () => {
    const validDir = sanitizeChangeLevelPayload(
      { roomId: 'ROOM01', direction: 'next' },
      'ROOM01',
    );
    assert.ok(validDir);
    assert.equal(validDir.direction, 'next');

    const validLevel = sanitizeChangeLevelPayload(
      { roomId: 'ROOM01', level: 3 },
      'ROOM01',
    );
    assert.ok(validLevel);
    assert.equal(validLevel.level, 3);

    const invalid = sanitizeChangeLevelPayload(
      { roomId: 'ROOM01', level: -1 },
      'ROOM01',
    );
    assert.equal(invalid, null);

    const wrongRoom = sanitizeChangeLevelPayload(
      { roomId: 'OTHER', direction: 'next' },
      'ROOM01',
    );
    assert.equal(wrongRoom, null);
  });
});
