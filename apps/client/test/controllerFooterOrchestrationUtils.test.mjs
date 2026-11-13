import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  getControllerFooterClassName,
  getControllerFooterSpacerClassName,
  formatControllerFooterTelemetry,
  resolveControllerFooterContainerProps,
  resolveControllerFooterState,
} from '../src/utils/controllerFooterOrchestrationUtils.ts';

describe('controllerFooterOrchestrationUtils — Mobil Kontrolcü Alt Eylemler Orkestrasyon Motoru', () => {
  it('getControllerFooterClassName ve SpacerClassName standart sınıfları döner', () => {
    assert.equal(getControllerFooterClassName(), 'grid grid-cols-2 gap-2.5');
    assert.equal(getControllerFooterSpacerClassName(), 'h-2');
  });

  it('formatControllerFooterTelemetry gizli ve aktif durumlarda doğru özet üretir', () => {
    const hiddenSummary = formatControllerFooterTelemetry({ showGimbalSurface: false });
    assert.equal(hiddenSummary, 'Alt Çubuk: Gizli (Gimbal Pasif)');

    const activePairedSummary = formatControllerFooterTelemetry({
      showGimbalSurface: true,
      isControllerPaired: true,
      isSocketConnected: true,
    });
    assert.equal(
      activePairedSummary,
      'Alt Çubuk: Aktif | Kalibrasyon Hazır | Top Sıfırlama Aktif',
    );

    const activeUnpairedSummary = formatControllerFooterTelemetry({
      showGimbalSurface: true,
      isControllerPaired: false,
      isSocketConnected: true,
    });
    assert.equal(
      activeUnpairedSummary,
      'Alt Çubuk: Aktif | Kalibrasyon Hazır | Top Sıfırlama Devre Dışı (Eşleşme Bekleniyor)',
    );
  });

  it('resolveControllerFooterContainerProps görünürlük durumuna göre doğru DOM özniteliklerini döner', () => {
    const hiddenProps = resolveControllerFooterContainerProps({ showGimbalSurface: false });
    assert.equal(hiddenProps['aria-hidden'], true);
    assert.equal(hiddenProps['data-visible'], false);
    assert.equal(hiddenProps.className, 'h-2');

    const visibleProps = resolveControllerFooterContainerProps({
      showGimbalSurface: true,
      isControllerPaired: true,
      isSocketConnected: true,
    });
    assert.equal(visibleProps.role, 'contentinfo');
    assert.equal(visibleProps['aria-label'], 'Mobil Kontrolcü Alt Araç Çubuğu');
    assert.equal(visibleProps['data-visible'], true);
    assert.equal(visibleProps['data-paired'], true);
    assert.equal(visibleProps['data-connected'], true);
    assert.equal(visibleProps['data-reset-disabled'], false);
  });

  it('resolveControllerFooterState tüm durumları eksiksiz birleştirir', () => {
    const state = resolveControllerFooterState({
      showGimbalSurface: true,
      isControllerPaired: false,
      isSocketConnected: true,
    });

    assert.equal(state.isVisible, true);
    assert.equal(state.isResetDisabled, true);
    assert.match(state.recalibrateAriaLabel, /Jiroskop merkezini/);
    assert.match(state.resetBallAriaLabel, /Eşleşme bekleniyor/);
    assert.match(state.telemetrySummary, /Alt Çubuk: Aktif/);
    assert.equal(state.containerProps['data-visible'], true);
  });

  it('resolveControllerFooterState boş girdilerde güvenli varsayılanlara döner', () => {
    const state = resolveControllerFooterState();

    assert.equal(state.isVisible, false);
    assert.equal(state.isResetDisabled, true);
    assert.equal(state.containerProps['data-visible'], false);
    assert.equal(state.telemetrySummary, 'Alt Çubuk: Gizli (Gimbal Pasif)');
  });
});

