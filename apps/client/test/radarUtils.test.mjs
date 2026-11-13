import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateRadarCoords,
  calculateRadarPercentage,
  calculateAttitudeHorizonTransform,
  formatAttitudeTelemetry,
  resolveAttitudeTransformStyle,
  calculateRadarDotTransform,
  shouldThrottleTelemetryText,
} from '../src/utils/radarUtils.ts';

test('radarUtils — Kokpit Yapay Ufuk ve 2B Radar Motoru', async (t) => {
  await t.test('calculateRadarCoords tahta merkezini ve kenarlarını doğru piksel sınırlarına eşler', () => {
    // 12x12 tahtada tam merkez (0, 0) -> 42px radar kutusunda 21px
    const center = calculateRadarCoords(0, 0, 12, 42, 4);
    assert.equal(center.rx, 21);
    assert.equal(center.rz, 21);

    // Sol-üst köşe (-6, -6) -> padding sınırına (4px) kırpılır
    const topLeft = calculateRadarCoords(-6, -6, 12, 42, 4);
    assert.equal(topLeft.rx, 4);
    assert.equal(topLeft.rz, 4);

    // Sağ-alt köşe (+6, +6) -> padding sınırına (38px) kırpılır
    const bottomRight = calculateRadarCoords(6, 6, 12, 42, 4);
    assert.equal(bottomRight.rx, 38);
    assert.equal(bottomRight.rz, 38);

    // Tahta dışına taşan değerler de min/max sınırına oturmalıdır
    const clamped = calculateRadarCoords(100, -100, 12, 42, 4);
    assert.equal(clamped.rx, 38);
    assert.equal(clamped.rz, 4);

    // Geçersiz boardSize koruması
    const fallback = calculateRadarCoords(0, 0, 0, 42, 4);
    assert.equal(fallback.rx, 4);
    assert.equal(fallback.rz, 4);
  });

  await t.test('calculateRadarPercentage koordinatı CSS %0 ile %100 arasına dönüştürür', () => {
    // Tam merkez: %50
    assert.equal(calculateRadarPercentage(0, 12), 50);

    // Sol kenar (-6): %0
    assert.equal(calculateRadarPercentage(-6, 12), 0);

    // Sağ kenar (+6): %100
    assert.equal(calculateRadarPercentage(6, 12), 100);

    // Çeyrek nokta (+3): %75
    assert.equal(calculateRadarPercentage(3, 12), 75);

    // Aşırı değerler
    assert.equal(calculateRadarPercentage(50, 12), 100);
    assert.equal(calculateRadarPercentage(-50, 12), 0);
  });

  await t.test('calculateAttitudeHorizonTransform açıları diskin dikey öteleme ve rotasyonuna çevirir', () => {
    // Düz duruş (0, 0)
    const flat = calculateAttitudeHorizonTransform(0, 0, 24, 18);
    assert.equal(flat.shiftY, 0);
    assert.equal(flat.rotDeg, '0.0');

    // 24 derece ileri eğim -> shiftY = +18
    const maxPitch = calculateAttitudeHorizonTransform(24, 0, 24, 18);
    assert.equal(maxPitch.shiftY, 18);

    // -24 derece geri eğim -> shiftY = -18
    const minPitch = calculateAttitudeHorizonTransform(-24, 0, 24, 18);
    assert.equal(minPitch.shiftY, -18);

    // 10 derece sağa yatış -> rotDeg = -11.0 (-gamma * 1.1)
    const rollRight = calculateAttitudeHorizonTransform(0, 10, 24, 18);
    assert.equal(rollRight.rotDeg, '-11.0');

    // Aşırı açılar sınırlandırılır
    const clamped = calculateAttitudeHorizonTransform(45, -45, 24, 18);
    assert.equal(clamped.shiftY, 18);
    assert.equal(clamped.rotDeg, '26.4');
  });

  await t.test('formatAttitudeTelemetry açı ve hız telemetrilerini standart formata dönüştürür', () => {
    const formatted = formatAttitudeTelemetry(12.34, -4.56, 3.8);
    assert.equal(formatted.pitchStr, '+12.3°');
    assert.equal(formatted.rollStr, '-4.6°');
    assert.equal(formatted.speedStr, '3.8 m/s');

    const zeros = formatAttitudeTelemetry(0, 0, 0);
    assert.equal(zeros.pitchStr, '+0.0°');
    assert.equal(zeros.rollStr, '+0.0°');
    assert.equal(zeros.speedStr, '0.0 m/s');

    const invalid = formatAttitudeTelemetry(NaN, NaN, -5);
    assert.equal(invalid.pitchStr, '+0.0°');
    assert.equal(invalid.rollStr, '+0.0°');
    assert.equal(invalid.speedStr, '0.0 m/s');
  });

  await t.test('resolveAttitudeTransformStyle, calculateRadarDotTransform ve shouldThrottleTelemetryText kurallarını uygular', () => {
    // resolveAttitudeTransformStyle
    assert.equal(
      resolveAttitudeTransformStyle(5.2, '12.0'),
      'translate3d(0, 5.2px, 0) rotate(12.0deg)',
    );
    assert.equal(
      resolveAttitudeTransformStyle(0, 0),
      'translate3d(0, 0.0px, 0) rotate(0.0deg)',
    );

    // calculateRadarDotTransform (0, 0) merkez -> rx=21, rz=21 -> ofset = 21-4 = 17px
    assert.equal(
      calculateRadarDotTransform(0, 0, 12, 42, 4),
      'translate3d(17.0px, 17.0px, 0)',
    );

    // shouldThrottleTelemetryText
    assert.equal(shouldThrottleTelemetryText(250, 100, 100), true);
    assert.equal(shouldThrottleTelemetryText(150, 100, 100), false);
    assert.equal(shouldThrottleTelemetryText(200, 100, 100), true);
  });
});
