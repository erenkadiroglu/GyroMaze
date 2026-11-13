import test from 'node:test';
import assert from 'node:assert/strict';
import {
  isValidRoomCode,
  sanitizePlayerName,
  isValidPlayerSlot,
  isValidLevelNumber,
  clampAngle,
} from '../src/utils/sharedValidationUtils.ts';

test('sharedValidationUtils — Paylaşılan Doğrulama ve Güvenlik Yardımcıları', async (t) => {
  await t.test('isValidRoomCode 6 haneli kodları doğrular, geçersizleri eler', () => {
    assert.equal(isValidRoomCode('ABC234'), true);
    assert.equal(isValidRoomCode('xyz789'), true);
    assert.equal(isValidRoomCode('12345'), false); // 5 hane
    assert.equal(isValidRoomCode('1234567'), false); // 7 hane
    assert.equal(isValidRoomCode(null), false);
    assert.equal(isValidRoomCode(undefined), false);
    assert.equal(isValidRoomCode(''), false);
  });

  await t.test('sanitizePlayerName oyuncu adını güvenle temizler ve sınırlar', () => {
    assert.equal(sanitizePlayerName('  Eren  '), 'Eren');
    assert.equal(sanitizePlayerName(''), 'Misafir');
    assert.equal(sanitizePlayerName(null), 'Misafir');
    assert.equal(sanitizePlayerName('BuÇokUzunBirOyuncuAdıVeSınırıAşıyor'), 'BuÇokUzunBirOyun');
  });

  await t.test('isValidPlayerSlot yalnızca 1 ve 2 değerlerini kabul eder', () => {
    assert.equal(isValidPlayerSlot(1), true);
    assert.equal(isValidPlayerSlot(2), true);
    assert.equal(isValidPlayerSlot(0), false);
    assert.equal(isValidPlayerSlot(3), false);
    assert.equal(isValidPlayerSlot(null), false);
  });

  await t.test('isValidLevelNumber pozitif tamsayıları doğrular', () => {
    assert.equal(isValidLevelNumber(1), true);
    assert.equal(isValidLevelNumber(5), true);
    assert.equal(isValidLevelNumber(0), false);
    assert.equal(isValidLevelNumber(-1), false);
    assert.equal(isValidLevelNumber(1.5), false);
    assert.equal(isValidLevelNumber(NaN), false);
  });

  await t.test('clampAngle açıları sınırlar ve NaN/Infinity durumunu sıfırlar', () => {
    assert.equal(clampAngle(20), 20);
    assert.equal(clampAngle(60), 45);
    assert.equal(clampAngle(-60), -45);
    assert.equal(clampAngle(NaN), 0);
    assert.equal(clampAngle(Infinity), 0);
  });
});

