import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  cleanRoomCode,
  validateRoomCode,
  calculateGimbalTouchAngles,
  calculateGimbalDotOffset,
  formatGimbalAngle,
  scaleGyroAngles,
} from '../src/utils/controllerUtils.ts';

describe('controllerUtils — Mobil Kontrolcü ve Sanal Gimbal Motoru', () => {
  it('cleanRoomCode girdileri güvenle temizler, büyütür ve 6 karakterle sınırlar', () => {
    assert.equal(cleanRoomCode('84-k9 x2!'), '84K9X2');
    assert.equal(cleanRoomCode('abc123xyz'), 'ABC123');
    assert.equal(cleanRoomCode(''), '');
    assert.equal(cleanRoomCode(null), '');
    assert.equal(cleanRoomCode(undefined), '');
  });

  it('validateRoomCode oda kodunun geçerliliğini ve uzunluğunu doğrular', () => {
    const valid = validateRoomCode('  84-k9x2  ');
    assert.equal(valid.valid, true);
    assert.equal(valid.cleanCode, '84K9X2');
    assert.equal(valid.error, null);

    const empty = validateRoomCode('   ');
    assert.equal(empty.valid, false);
    assert.equal(empty.cleanCode, '');
    assert.ok(empty.error?.includes('6 haneli'));

    const short = validateRoomCode('ABC');
    assert.equal(short.valid, false);
    assert.equal(short.cleanCode, 'ABC');
    assert.ok(short.error?.includes('tam 6 karakter'));
  });

  it('calculateGimbalTouchAngles dokunmatik koordinatları gimbal dairesi içine sınırlar ve açıları hesaplar', () => {
    const bounds = { centerX: 100, centerY: 100, maxRadius: 80 };

    // Tam merkez
    const center = calculateGimbalTouchAngles(100, 100, bounds, 28);
    assert.equal(center.beta, 0);
    assert.equal(center.gamma, 0);

    // Tam sağ kenar (dx = 80, dy = 0)
    const right = calculateGimbalTouchAngles(180, 100, bounds, 28);
    assert.equal(right.beta, 0);
    assert.equal(right.gamma, 28);

    // Dışa taşan dokunma (dx = 160, dy = 0) -> daire sınırına kırpılmalı
    const overRight = calculateGimbalTouchAngles(260, 100, bounds, 28);
    assert.equal(overRight.beta, 0);
    assert.equal(overRight.gamma, 28);

    // Tam alt kenar (dx = 0, dy = 80) -> beta = 28
    const bottom = calculateGimbalTouchAngles(100, 180, bounds, 28);
    assert.equal(bottom.beta, 28);
    assert.equal(bottom.gamma, 0);

    // Geçersiz bounds
    const invalid = calculateGimbalTouchAngles(100, 100, { centerX: 0, centerY: 0, maxRadius: 0 });
    assert.equal(invalid.beta, 0);
    assert.equal(invalid.gamma, 0);
  });

  it('calculateGimbalDotOffset açıları 2B ufuk küresinin piksel ofsetlerine sınırlar', () => {
    assert.deepEqual(calculateGimbalDotOffset(0, 0, 68, 35), { offsetX: 0, offsetY: 0 });

    const maxPositive = calculateGimbalDotOffset(35, 35, 68, 35);
    assert.deepEqual(maxPositive, { offsetX: 68, offsetY: 68 });

    const halfNegative = calculateGimbalDotOffset(-17.5, 17.5, 68, 35);
    assert.deepEqual(halfNegative, { offsetX: 34, offsetY: -34 });

    // Sınır aşımı
    const clamped = calculateGimbalDotOffset(90, -90, 68, 35);
    assert.deepEqual(clamped, { offsetX: -68, offsetY: 68 });
  });

  it('formatGimbalAngle açıları standart +0.0° formatına dönüştürür', () => {
    assert.equal(formatGimbalAngle(12.34), '+12.3°');
    assert.equal(formatGimbalAngle(-5.67), '-5.7°');
    assert.equal(formatGimbalAngle(0), '+0.0°');
    assert.equal(formatGimbalAngle(Number.NaN), '+0.0°');
  });

  it('scaleGyroAngles hassasiyeti uygular ve ±35 dereceye sınırlar', () => {
    const normal = scaleGyroAngles(10, -15, 1, 35);
    assert.deepEqual(normal, { beta: 10, gamma: -15 });

    const turbo = scaleGyroAngles(10, 20, 1.35, 35);
    assert.deepEqual(turbo, { beta: 13.5, gamma: 27 });

    const clamped = scaleGyroAngles(30, -30, 1.35, 35);
    assert.deepEqual(clamped, { beta: 35, gamma: -35 });
  });
});

