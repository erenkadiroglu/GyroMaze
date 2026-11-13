import test from 'node:test';
import assert from 'node:assert/strict';
import {
  wrapAngleDelta,
  applyDeadzone,
  applyExponentialSmoothing,
  clampAndRoundAngle,
  calculateFilteredOrientation,
  resolveSensorInitialPermission,
} from '../src/utils/orientationFilterUtils.ts';

test('orientationFilterUtils — wrapAngleDelta açısal sarma', () => {
  assert.equal(wrapAngleDelta(0), 0);
  assert.equal(wrapAngleDelta(90), 90);
  assert.equal(wrapAngleDelta(180), -180);
  assert.equal(wrapAngleDelta(-180), -180);
  assert.equal(wrapAngleDelta(270), -90);
  assert.equal(wrapAngleDelta(360), 0);
  assert.equal(wrapAngleDelta(450), 90);
  assert.equal(wrapAngleDelta(-270), 90);
  assert.equal(wrapAngleDelta(NaN), 0);
  assert.equal(wrapAngleDelta(Infinity), 0);
});

test('orientationFilterUtils — applyDeadzone ölü bölge filtresi', () => {
  // Varsayılan eşik: 0.2°
  assert.equal(applyDeadzone(0), 0);
  assert.equal(applyDeadzone(0.1), 0);
  assert.equal(applyDeadzone(-0.19), 0);
  assert.equal(applyDeadzone(0.2), 0.2);
  assert.equal(applyDeadzone(-0.25), -0.25);
  assert.equal(applyDeadzone(5.5), 5.5);
  assert.equal(applyDeadzone(-12.4), -12.4);

  // Özel eşik
  assert.equal(applyDeadzone(0.4, 0.5), 0);
  assert.equal(applyDeadzone(0.6, 0.5), 0.6);

  // Bozuk veri güvenliği
  assert.equal(applyDeadzone(NaN), 0);
  assert.equal(applyDeadzone(Infinity), 0);
});

test('orientationFilterUtils — applyExponentialSmoothing üstel hareketli ortalama', () => {
  // current = 0, target = 10, alpha = 0.5 -> 0 + (10 - 0) * 0.5 = 5
  assert.equal(applyExponentialSmoothing(0, 10, 0.5), 5);

  // current = 10, target = 10 -> 10
  assert.equal(applyExponentialSmoothing(10, 10, 0.72), 10);

  // current = 0, target = 100, alpha = 0.72 -> 72
  assert.equal(applyExponentialSmoothing(0, 100, 0.72), 72);

  // Sınır durumları: alpha = 0 (değişim yok), alpha = 1 (anında hedef)
  assert.equal(applyExponentialSmoothing(5, 20, 0), 5);
  assert.equal(applyExponentialSmoothing(5, 20, 1), 20);

  // Bozuk girdiler
  assert.equal(applyExponentialSmoothing(NaN, 10, 0.5), 5);
  assert.equal(applyExponentialSmoothing(10, NaN, 0.5), 5);
});

test('orientationFilterUtils — clampAndRoundAngle sınırlandırma ve yuvarlama', () => {
  // Sınır içi değerler 0.1° hassasiyetle yuvarlanır
  assert.equal(clampAndRoundAngle(12.34), 12.3);
  assert.equal(clampAndRoundAngle(12.36), 12.4);
  assert.equal(clampAndRoundAngle(-8.71), -8.7);

  // ±35 derece sınırlandırma
  assert.equal(clampAndRoundAngle(42.5), 35);
  assert.equal(clampAndRoundAngle(-50.2), -35);
  assert.equal(clampAndRoundAngle(35.0), 35);
  assert.equal(clampAndRoundAngle(-35.0), -35);

  // Özel sınır ve basamak
  assert.equal(clampAndRoundAngle(15.6789, 20, 2), 15.68);
  assert.equal(clampAndRoundAngle(25.123, 20, 2), 20);

  // Güvenlik
  assert.equal(clampAndRoundAngle(NaN), 0);
  assert.equal(clampAndRoundAngle(Infinity), 0);
});

test('orientationFilterUtils — calculateFilteredOrientation tam filtre akışı', () => {
  const result = calculateFilteredOrientation({
    rawAlpha: 180.45,
    rawBeta: 15.2,
    rawGamma: -8.7,
    calibration: { betaOffset: 5.0, gammaOffset: -3.0 },
    currentSmoothed: { beta: 0, gamma: 0 },
    deadzoneDeg: 0.2,
    smoothingAlpha: 0.72,
    maxTiltDeg: 35,
  }, 1000);

  // Delta: beta = 15.2 - 5.0 = 10.2, gamma = -8.7 - (-3.0) = -5.7
  // Smoothed: beta = 0 + 10.2 * 0.72 = 7.344, gamma = 0 + (-5.7) * 0.72 = -4.104
  // Clamped & Rounded: beta = 7.3, gamma = -4.1, alpha = 180.5
  assert.equal(result.gyroData.alpha, 180.5);
  assert.equal(result.gyroData.beta, 7.3);
  assert.equal(result.gyroData.gamma, -4.1);
  assert.equal(result.gyroData.timestamp, 1000);

  assert.equal(Math.round(result.nextSmoothed.beta * 1000), 7344);
  assert.equal(Math.round(result.nextSmoothed.gamma * 1000), -4104);
});

test('orientationFilterUtils — calculateFilteredOrientation ölü bölge durumunda sıfırlama', () => {
  const result = calculateFilteredOrientation({
    rawAlpha: 0,
    rawBeta: 10.05,
    rawGamma: 20.08,
    calibration: { betaOffset: 10.0, gammaOffset: 20.0 },
    currentSmoothed: { beta: 0, gamma: 0 },
    deadzoneDeg: 0.2,
    smoothingAlpha: 0.72,
    maxTiltDeg: 35,
  });

  // Delta beta = 0.05 (< 0.2 ölü bölge) -> 0
  // Delta gamma = 0.08 (< 0.2 ölü bölge) -> 0
  assert.equal(result.gyroData.beta, 0);
  assert.equal(result.gyroData.gamma, 0);
  assert.equal(result.nextSmoothed.beta, 0);
  assert.equal(result.nextSmoothed.gamma, 0);
});

test('orientationFilterUtils — resolveSensorInitialPermission izin durumu çözümleme', () => {
  assert.equal(resolveSensorInitialPermission(false, false), 'unsupported');
  assert.equal(resolveSensorInitialPermission(true, false), 'unsupported');
  assert.equal(resolveSensorInitialPermission(false, true), 'unsupported');
  assert.equal(resolveSensorInitialPermission(true, true), 'prompt');
});

