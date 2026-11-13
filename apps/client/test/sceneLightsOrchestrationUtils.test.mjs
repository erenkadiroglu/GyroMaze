import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  DEFAULT_SUN_POSITION,
  DEFAULT_FILL_POSITION,
  DEFAULT_SHADOW_MAP_SIZE,
  DEFAULT_FILL_LIGHT_COLOR,
  resolveAmbientLightConfig,
  resolveDirectionalSunLightConfig,
  resolvePointFillLightConfig,
  formatSceneLightsTelemetry,
  resolveSceneLightsBundle,
} from '../src/utils/sceneLightsOrchestrationUtils.ts';

describe('sceneLightsOrchestrationUtils — 3B Sahne Işıkları Orkestrasyon Motoru', () => {
  it('resolveAmbientLightConfig açık ve koyu temaya göre doğru şiddeti döner', () => {
    assert.equal(resolveAmbientLightConfig(true).intensity, 1.25);
    assert.equal(resolveAmbientLightConfig(false).intensity, 0.7);
  });

  it('resolveDirectionalSunLightConfig güneş ışığı konumunu, şiddetini ve gölge sınırlarını hesaplar', () => {
    const lightSun = resolveDirectionalSunLightConfig(true, 12);
    assert.deepEqual(lightSun.position, DEFAULT_SUN_POSITION);
    assert.equal(lightSun.intensity, 2.1);
    assert.equal(lightSun.castShadow, true);
    assert.deepEqual(lightSun.mapSize, DEFAULT_SHADOW_MAP_SIZE);
    assert.deepEqual(lightSun.cameraBounds, {
      left: -12,
      right: 12,
      top: 12,
      bottom: -12,
    });

    const darkSun = resolveDirectionalSunLightConfig(false, 15);
    assert.equal(darkSun.intensity, 1.75);
    assert.deepEqual(darkSun.cameraBounds, {
      left: -15,
      right: 15,
      top: 15,
      bottom: -15,
    });
  });

  it('resolveDirectionalSunLightConfig geçersiz veya sıfır gölge marjlarında varsayılan 10 sınırını uygular', () => {
    const fallbackSun = resolveDirectionalSunLightConfig(true, 0);
    assert.deepEqual(fallbackSun.cameraBounds, {
      left: -10,
      right: 10,
      top: 10,
      bottom: -10,
    });

    const nanSun = resolveDirectionalSunLightConfig(false, Number.NaN);
    assert.deepEqual(nanSun.cameraBounds, {
      left: -10,
      right: 10,
      top: 10,
      bottom: -10,
    });
  });

  it('resolvePointFillLightConfig noktasal dolgu ışığı pozisyonu, rengi ve şiddetini döner', () => {
    const lightFill = resolvePointFillLightConfig(true);
    assert.deepEqual(lightFill.position, DEFAULT_FILL_POSITION);
    assert.equal(lightFill.color, DEFAULT_FILL_LIGHT_COLOR);
    assert.equal(lightFill.intensity, 0.65);

    const darkFill = resolvePointFillLightConfig(false);
    assert.equal(darkFill.intensity, 1.1);
  });

  it('formatSceneLightsTelemetry tek satırlık doğru telemetri metni üretir', () => {
    const lightTelemetry = formatSceneLightsTelemetry(true, 11);
    assert.equal(
      lightTelemetry,
      '3B Işıklar: Aydınlık Sahne | Ortam: 1.25, Güneş: 2.10, Dolgu: 0.65 | Gölge Marjı: 11',
    );

    const darkTelemetry = formatSceneLightsTelemetry(false, 14);
    assert.equal(
      darkTelemetry,
      '3B Işıklar: Karanlık Sahne | Ortam: 0.70, Güneş: 1.75, Dolgu: 1.10 | Gölge Marjı: 14',
    );
  });

  it('resolveSceneLightsBundle üç ışık tipini ve telemetriyi eksiksiz paketler', () => {
    const bundle = resolveSceneLightsBundle(true, 12);
    assert.equal(bundle.ambient.intensity, 1.25);
    assert.equal(bundle.sun.intensity, 2.1);
    assert.equal(bundle.sun.cameraBounds.right, 12);
    assert.equal(bundle.fill.intensity, 0.65);
    assert.match(bundle.telemetrySummary, /Aydınlık Sahne/);
  });
});

