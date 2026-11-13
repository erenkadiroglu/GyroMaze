import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  DESKTOP_LOADER_MESSAGE_CLASS,
  resolveDesktopLoaderContainerProps,
  getDesktopLoaderSpinnerProps,
  getDesktopLoaderMessageProps,
  formatDesktopSceneLoaderTelemetry,
  resolveDesktopSceneLoaderState,
} from '../src/utils/desktopSceneLoaderOrchestrationUtils.ts';

describe('desktopSceneLoaderOrchestrationUtils — Masaüstü Sahne Yükleme Arayüzü Orkestrasyon Motoru', () => {
  it('DESKTOP_LOADER_MESSAGE_CLASS beklenen metin ve renk kurallarını içerir', () => {
    assert.match(DESKTOP_LOADER_MESSAGE_CLASS, /mt-4 text-sm font-medium/);
  });

  it('resolveDesktopLoaderContainerProps varsayılan mesajla semantik status rolü ve nitelikleri döner', () => {
    const props = resolveDesktopLoaderContainerProps();
    assert.equal(props.role, 'status');
    assert.equal(props['aria-live'], 'polite');
    assert.equal(props['aria-label'], '3B fizik sahnesi hazırlanıyor...');
    assert.equal(props['data-state'], 'loading');
    assert.match(props.className, /fixed inset-0 flex flex-col/);
  });

  it('resolveDesktopLoaderContainerProps özel mesaj verildiğinde aria-label alanını günceller', () => {
    const props = resolveDesktopLoaderContainerProps('Özel harita yükleniyor...');
    assert.equal(props['aria-label'], 'Özel harita yükleniyor...');
  });

  it('getDesktopLoaderSpinnerProps aria-hidden="true" ve dönen spinner sınıflarını döner', () => {
    const props = getDesktopLoaderSpinnerProps();
    assert.equal(props['aria-hidden'], true);
    assert.match(props.className, /animate-spin rounded-full/);
  });

  it('getDesktopLoaderMessageProps beklenen CSS sınıfını döner', () => {
    const props = getDesktopLoaderMessageProps();
    assert.equal(props.className, DESKTOP_LOADER_MESSAGE_CLASS);
  });

  it('formatDesktopSceneLoaderTelemetry tek satırlık doğru telemetri metni üretir', () => {
    const defaultTelemetry = formatDesktopSceneLoaderTelemetry();
    assert.equal(
      defaultTelemetry,
      'Masaüstü Sahne Yükleyici: 3B fizik sahnesi hazırlanıyor... | Durum: Yükleniyor (CSR)',
    );

    const customTelemetry = formatDesktopSceneLoaderTelemetry('Labirent dokuları hazırlanıyor...');
    assert.equal(
      customTelemetry,
      'Masaüstü Sahne Yükleyici: Labirent dokuları hazırlanıyor... | Durum: Yükleniyor (CSR)',
    );
  });

  it('resolveDesktopSceneLoaderState tüm alanları içeren saf durum nesnesini eksiksiz üretir', () => {
    const state = resolveDesktopSceneLoaderState();
    assert.equal(state.message, '3B fizik sahnesi hazırlanıyor...');
    assert.equal(state.containerProps.role, 'status');
    assert.equal(state.spinnerProps['aria-hidden'], true);
    assert.equal(state.messageProps.className, DESKTOP_LOADER_MESSAGE_CLASS);
    assert.match(state.telemetrySummary, /Masaüstü Sahne Yükleyici/);
  });
});

