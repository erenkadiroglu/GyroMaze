import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  resolveMobileControllerContainerProps,
  formatMobileControllerTelemetry,
  resolveMobileControllerViewState,
} from '../src/utils/mobileControllerViewOrchestrationUtils.ts';

describe('mobileControllerViewOrchestrationUtils — Mobil Kontrolcü Ana Görünüm Orkestrasyon Motoru', () => {
  it('resolveMobileControllerContainerProps semantik application rolünü ve veri denetim özniteliklerini döner', () => {
    const props = resolveMobileControllerContainerProps({
      activeRoomCode: 'WM3ACZ',
      playerSlot: 2,
      isControllerPaired: true,
      isSocketConnected: true,
      stageMode: 'gimbal',
    });

    assert.equal(props.role, 'application');
    assert.equal(props['aria-label'], 'GyroMaze Mobil Kontrolcü Paneli');
    assert.match(props.className, /flex min-h-dvh flex-col justify-between/);
    assert.equal(props['data-room'], 'WM3ACZ');
    assert.equal(props['data-slot'], 2);
    assert.equal(props['data-paired'], true);
    assert.equal(props['data-connected'], true);
    assert.equal(props['data-stage'], 'gimbal');
  });

  it('resolveMobileControllerContainerProps boş girdilerde varsayılan değerleri üretir', () => {
    const props = resolveMobileControllerContainerProps();

    assert.equal(props['data-room'], 'none');
    assert.equal(props['data-slot'], 1);
    assert.equal(props['data-paired'], false);
    assert.equal(props['data-connected'], false);
    assert.equal(props['data-stage'], 'unknown');
  });

  it('formatMobileControllerTelemetry bağlı ve eşleşmiş durumda tek satırlık özet üretir', () => {
    const summary = formatMobileControllerTelemetry({
      activeRoomCode: 'KYKGL5',
      playerSlot: 1,
      isControllerPaired: true,
      isSocketConnected: true,
      latencyMs: 11,
      stageMode: 'gimbal',
      level: 3,
    });

    assert.equal(
      summary,
      'GyroMaze P1 | KYKGL5 | Bağlı (11ms) | Aşama: gimbal | Seviye 3',
    );
  });

  it('formatMobileControllerTelemetry oda ve bağlantı yokken varsayılanları yansıtır', () => {
    const summary = formatMobileControllerTelemetry({
      playerSlot: 2,
      stageMode: 'room',
    });

    assert.equal(
      summary,
      'GyroMaze P2 | Oda Yok | Kopuk | Aşama: room | Seviye 1',
    );
  });

  it('formatMobileControllerTelemetry soket bağlı ancak eşleşmemişken Hazır durumunu belirtir', () => {
    const summary = formatMobileControllerTelemetry({
      isControllerPaired: false,
      isSocketConnected: true,
      stageMode: 'sensor',
    });

    assert.match(summary, /Hazır/);
    assert.match(summary, /Aşama: sensor/);
  });

  it('resolveMobileControllerViewState tüm orkestrasyon durumunu eksiksiz birleştirir', () => {
    const state = resolveMobileControllerViewState({
      activeRoomCode: 'AB12CD',
      playerSlot: 1,
      isControllerPaired: true,
      isSocketConnected: true,
      latencyMs: 8,
      stageMode: 'gimbal',
      level: 2,
    });

    assert.equal(state.documentTitle, 'GyroMaze Kontrolcü [AB12CD - P1]');
    assert.equal(state.isReady, true);
    assert.match(state.telemetrySummary, /GyroMaze P1 | AB12CD | Bağlı \(8ms\)/);
    assert.equal(state.containerProps['data-room'], 'AB12CD');
    assert.equal(state.containerProps['data-slot'], 1);
  });

  it('resolveMobileControllerViewState boş girdilerde güvenli varsayılanlara döner', () => {
    const state = resolveMobileControllerViewState();

    assert.equal(state.documentTitle, 'GyroMaze Kontrolcü');
    assert.equal(state.isReady, false);
    assert.match(state.telemetrySummary, /Oda Yok | Kopuk/);
    assert.equal(state.containerProps['data-room'], 'none');
  });
});
