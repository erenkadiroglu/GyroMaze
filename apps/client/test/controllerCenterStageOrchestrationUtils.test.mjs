import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  resolveSensitivityLabel,
  resolveCenterStageDescriptor,
  resolveCenterStageContainerProps,
  formatCenterStageDetailedSummary,
  resolveControllerCenterStageState,
} from '../src/utils/controllerCenterStageOrchestrationUtils.ts';

describe('controllerCenterStageOrchestrationUtils — Mobil Kontrolcü Merkez Sahne Orkestrasyon Motoru', () => {
  it('resolveSensitivityLabel bilinen katsayıları ve varsayılanı doğru etiketler', () => {
    assert.equal(resolveSensitivityLabel(0.75), '0.75x (Düşük)');
    assert.equal(resolveSensitivityLabel(1), '1.0x (Normal)');
    assert.equal(resolveSensitivityLabel(1.35), '1.35x (Yüksek)');
    assert.equal(resolveSensitivityLabel(undefined), '1.0x (Normal)');
  });

  it('resolveCenterStageDescriptor sahne moduna göre bayrakları doğru üretir', () => {
    const roomDesc = resolveCenterStageDescriptor('room');
    assert.equal(roomDesc.mode, 'room');
    assert.equal(roomDesc.isRoom, true);
    assert.equal(roomDesc.isSensor, false);
    assert.equal(roomDesc.isGimbal, false);

    const sensorDesc = resolveCenterStageDescriptor('sensor');
    assert.equal(sensorDesc.mode, 'sensor');
    assert.equal(sensorDesc.isRoom, false);
    assert.equal(sensorDesc.isSensor, true);
    assert.equal(sensorDesc.isGimbal, false);

    const gimbalDesc = resolveCenterStageDescriptor('gimbal');
    assert.equal(gimbalDesc.mode, 'gimbal');
    assert.equal(gimbalDesc.isRoom, false);
    assert.equal(gimbalDesc.isSensor, false);
    assert.equal(gimbalDesc.isGimbal, true);

    const defaultDesc = resolveCenterStageDescriptor();
    assert.equal(defaultDesc.mode, 'room');
  });

  it('resolveCenterStageContainerProps semantik region rolünü ve veri denetim özniteliklerini döner', () => {
    const props = resolveCenterStageContainerProps('gimbal', true, true);

    assert.equal(props.role, 'region');
    assert.equal(props['aria-label'], 'Sanal gimbal ve açı gösterge alanı');
    assert.match(props.className, /my-auto flex flex-col items-center/);
    assert.equal(props['data-stage-mode'], 'gimbal');
    assert.equal(props['data-paired'], true);
    assert.equal(props['data-touch-override'], true);
  });

  it('formatCenterStageDetailedSummary oda kartı durumunda doğru özet üretir', () => {
    const summary = formatCenterStageDetailedSummary({
      stageMode: 'room',
      activeRoomCode: 'KYKGL5',
      recentRoomsCount: 2,
      isControllerPaired: false,
    });

    assert.equal(
      summary,
      'Merkez Sahne: Oda Kartı | Oda: KYKGL5 | Son Odalar: 2 | Bağlantı Yok',
    );
  });

  it('formatCenterStageDetailedSummary sensör izni durumunda doğru özet üretir', () => {
    const summary = formatCenterStageDetailedSummary({
      stageMode: 'sensor',
      isInsecureContext: true,
      isControllerPaired: true,
    });

    assert.equal(
      summary,
      'Merkez Sahne: Sensör İzni | Güvensiz Bağlam: Evet | Eşleşti',
    );
  });

  it('formatCenterStageDetailedSummary gimbal modunda aktif sinyal ve hassasiyet özetini üretir', () => {
    const summary = formatCenterStageDetailedSummary({
      stageMode: 'gimbal',
      controllerTouchOverride: false,
      controllerSensitivity: 1.35,
      playerSlot: 2,
      hasSensorSignal: true,
      sensorSignalTimedOut: false,
      isControllerPaired: true,
    });

    assert.equal(
      summary,
      'Merkez Sahne: Gimbal | Jiroskop (1.35x (Yüksek), P2) | Sinyal: Aktif | Eşleşti',
    );
  });

  it('resolveControllerCenterStageState tüm alt durumları tek nesnede eksiksiz birleştirir', () => {
    const state = resolveControllerCenterStageState({
      stageMode: 'gimbal',
      controllerSensitivity: 0.75,
      isControllerPaired: true,
      controllerTouchOverride: true,
    });

    assert.equal(state.descriptor.isGimbal, true);
    assert.equal(state.sensitivityLabel, '0.75x (Düşük)');
    assert.equal(state.containerProps['data-stage-mode'], 'gimbal');
    assert.equal(state.containerProps['data-touch-override'], true);
    assert.match(state.telemetrySummary, /Merkez Sahne: Gimbal/);
  });
});
