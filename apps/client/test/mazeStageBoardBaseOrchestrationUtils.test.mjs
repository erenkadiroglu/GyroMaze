import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  resolveBoardBaseMeshProps,
  formatMazeStageBoardBaseTelemetry,
  resolveMazeStageBoardBaseState,
} from '../src/utils/mazeStageBoardBaseOrchestrationUtils.ts';

describe('mazeStageBoardBaseOrchestrationUtils — 3B Sahne Tabanı Orkestrasyon Motoru', () => {
  it('resolveBoardBaseMeshProps tahta boyutuna göre pozisyon, kutu argümanları ve receiveShadow döner', () => {
    const props = resolveBoardBaseMeshProps(14);
    assert.deepEqual(props.position, [0, -0.25, 0]);
    assert.deepEqual(props.boxArgs, [14, 0.5, 14]);
    assert.equal(props.receiveShadow, true);
  });

  it('resolveBoardBaseMeshProps geçersiz veya negatif boyutlarda 12 varsayılanını uygular', () => {
    const fallbackProps = resolveBoardBaseMeshProps(0);
    assert.deepEqual(fallbackProps.boxArgs, [12, 0.5, 12]);

    const nanProps = resolveBoardBaseMeshProps(Number.NaN);
    assert.deepEqual(nanProps.boxArgs, [12, 0.5, 12]);
  });

  it('formatMazeStageBoardBaseTelemetry aydınlık zemin için doğru telemetri metni üretir', () => {
    const telemetry = formatMazeStageBoardBaseTelemetry(12, true);
    assert.equal(
      telemetry,
      '3B Tahta Tabanı: 12x12 (Aydınlık Zemin) | Izgara: 11.6 birim, 12 bölme | Taban: [12.0, 0.5, 12.0]',
    );
  });

  it('formatMazeStageBoardBaseTelemetry karanlık zemin için doğru telemetri metni üretir', () => {
    const telemetry = formatMazeStageBoardBaseTelemetry(16, false);
    assert.equal(
      telemetry,
      '3B Tahta Tabanı: 16x16 (Karanlık Zemin) | Izgara: 15.6 birim, 12 bölme | Taban: [16.0, 0.5, 16.0]',
    );
  });

  it('resolveMazeStageBoardBaseState aydınlık zemin için tüm durum nesnesini eksiksiz üretir', () => {
    const state = resolveMazeStageBoardBaseState({
      boardSize: 12,
      isLightBoard: true,
    });

    assert.equal(state.boardSize, 12);
    assert.equal(state.isLightBoard, true);
    assert.equal(state.gridConfig.key, 'grid-light');
    assert.equal(state.gridConfig.colorCenterLine, '#cbd5e1');
    assert.deepEqual(state.meshProps.boxArgs, [12, 0.5, 12]);
    assert.match(state.telemetrySummary, /Aydınlık Zemin/);
  });

  it('resolveMazeStageBoardBaseState karanlık zemin ve 16x16 boyut ile tam durumu üretir', () => {
    const state = resolveMazeStageBoardBaseState({
      boardSize: 16,
      isLightBoard: false,
    });

    assert.equal(state.boardSize, 16);
    assert.equal(state.isLightBoard, false);
    assert.equal(state.gridConfig.key, 'grid-dark');
    assert.equal(state.gridConfig.colorCenterLine, '#27272a');
    assert.deepEqual(state.meshProps.boxArgs, [16, 0.5, 16]);
    assert.match(state.telemetrySummary, /Karanlık Zemin/);
  });
});

