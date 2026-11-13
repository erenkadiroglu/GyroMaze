import test from 'node:test';
import assert from 'node:assert/strict';
import {
  resolveAttitudeBoardSize,
  getAttitudeContainerAriaLabel,
  getAttitudeHorizonDialTitle,
  getMiniMapRadarTitle,
  isAttitudeMultiplayerActive,
  formatAttitudeGaugeSummary,
} from '../src/utils/attitudeGaugeUtils.ts';

test('attitudeGaugeUtils — Kokpit Uçuş ve Hız Göstergesi Yardımcıları', async (t) => {
  await t.test('resolveAttitudeBoardSize pozitif boyutları tabanlar, geçersizlerde varsayılan 12 döner', () => {
    assert.equal(resolveAttitudeBoardSize(16), 16);
    assert.equal(resolveAttitudeBoardSize(8.7), 8);
    assert.equal(resolveAttitudeBoardSize(undefined), 12);
    assert.equal(resolveAttitudeBoardSize(null), 12);
    assert.equal(resolveAttitudeBoardSize(0), 12);
    assert.equal(resolveAttitudeBoardSize(-5), 12);
    assert.equal(resolveAttitudeBoardSize(Number.NaN), 12);
  });

  await t.test('getAttitudeContainerAriaLabel ve başlık fonksiyonları standart metinleri döner', () => {
    assert.equal(getAttitudeContainerAriaLabel(), 'Canlı uçuş ve hız göstergesi');
    assert.equal(getAttitudeHorizonDialTitle(), 'Yapay Ufuk — Tabla eğim açısı');
    assert.equal(getMiniMapRadarTitle(), 'Canlı 2B Labirent Radarı');
  });

  await t.test('isAttitudeMultiplayerActive mod durumunu boolean olarak doğrular', () => {
    assert.equal(isAttitudeMultiplayerActive(true), true);
    assert.equal(isAttitudeMultiplayerActive(false), false);
    assert.equal(isAttitudeMultiplayerActive(null), false);
    assert.equal(isAttitudeMultiplayerActive(undefined), false);
  });

  await t.test('formatAttitudeGaugeSummary eğim ve hız telemetrisini formatlar', () => {
    assert.equal(
      formatAttitudeGaugeSummary(2.54, -1.21, 3.48),
      'Eğim: 2.5° / -1.2°, Hız: 3.5 m/s',
    );
    assert.equal(
      formatAttitudeGaugeSummary(0, 0, 0),
      'Eğim: 0.0° / 0.0°, Hız: 0.0 m/s',
    );
    assert.equal(
      formatAttitudeGaugeSummary(Number.NaN, Number.NaN, -4),
      'Eğim: 0.0° / 0.0°, Hız: 0.0 m/s',
    );
  });
});

