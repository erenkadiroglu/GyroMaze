import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  SCENE_RECOVERY_CONTAINER_CLASS,
  SCENE_RECOVERY_CARD_CLASS,
  SCENE_RECOVERY_TITLE_CLASS,
  SCENE_RECOVERY_MESSAGE_CLASS,
  SCENE_RECOVERY_BUTTON_CLASS,
  getSceneRecoveryConfig,
  resolveSceneRecoveryContainerProps,
  formatSceneRecoveryTelemetry,
  resolveSceneRecoveryState,
} from '../src/utils/sceneRecoveryOrchestrationUtils.ts';

describe('sceneRecoveryOrchestrationUtils — 3B Sahne Kurtarma Orkestrasyon Motoru', () => {
  it('sabit stil sınıfları eksiksiz ve geçerli CSS kuralları içerir', () => {
    assert.match(SCENE_RECOVERY_CONTAINER_CLASS, /flex h-full w-full/);
    assert.match(SCENE_RECOVERY_CARD_CLASS, /max-w-sm rounded-2xl/);
    assert.match(SCENE_RECOVERY_TITLE_CLASS, /text-base font-semibold/);
    assert.match(SCENE_RECOVERY_MESSAGE_CLASS, /mt-2 text-xs/);
    assert.match(SCENE_RECOVERY_BUTTON_CLASS, /bg-brass px-4/);
  });

  it('getSceneRecoveryConfig context_lost varyantı için beklenen konfigürasyonu döner', () => {
    const config = getSceneRecoveryConfig('context_lost');
    assert.equal(config.variant, 'context_lost');
    assert.equal(config.title, '3B grafik bağlamı kesildi');
    assert.equal(
      config.message,
      'Tarayıcı WebGL bağlamını geçici olarak serbest bıraktı.',
    );
    assert.equal(config.buttonText, 'Sahneyi yeniden başlat');
    assert.equal(config.ariaRole, 'alert');
    assert.equal(config.ariaLive, 'assertive');
  });

  it('getSceneRecoveryConfig init_error varyantı için başlatma hata metinlerini döner', () => {
    const config = getSceneRecoveryConfig('init_error');
    assert.equal(config.variant, 'init_error');
    assert.equal(config.title, '3B sahne başlatılamadı');
    assert.equal(
      config.message,
      'Tarayıcı WebGL grafik bağlamı kullanılamıyor veya sıfırlandı.',
    );
    assert.equal(config.buttonText, 'Sahneyi yeniden başlat');
    assert.equal(config.ariaRole, 'alert');
  });

  it('getSceneRecoveryConfig generic_error varyantı için genel hata metinlerini döner', () => {
    const config = getSceneRecoveryConfig('generic_error');
    assert.equal(config.variant, 'generic_error');
    assert.equal(config.title, '3B sahne hatası');
    assert.equal(
      config.message,
      'Beklenmeyen bir görsel oluşturma veya fizik simülasyonu hatası oluştu.',
    );
    assert.equal(config.buttonText, 'Sahneyi yeniden dene');
  });

  it('getSceneRecoveryConfig bilinmeyen veya boş varyantlarda context_lost varsayılanına düşer', () => {
    // @ts-expect-error geçersiz varyant denetimi
    const fallbackConfig = getSceneRecoveryConfig('unknown_variant');
    assert.equal(fallbackConfig.variant, 'context_lost');
    assert.equal(fallbackConfig.title, '3B grafik bağlamı kesildi');
  });

  it('resolveSceneRecoveryContainerProps semantik DOM ve veri denetim özniteliklerini döner', () => {
    const props = resolveSceneRecoveryContainerProps('init_error', 2);
    assert.equal(props.role, 'alert');
    assert.equal(props['aria-live'], 'assertive');
    assert.equal(props['aria-label'], '3B sahne başlatılamadı');
    assert.equal(props.className, SCENE_RECOVERY_CONTAINER_CLASS);
    assert.equal(props['data-recovery-variant'], 'init_error');
    assert.equal(props['data-revision'], 2);
  });

  it('resolveSceneRecoveryContainerProps geçersiz ve negatif revizyonlarda 0 uygular', () => {
    const fallbackProps = resolveSceneRecoveryContainerProps(
      'context_lost',
      -5,
    );
    assert.equal(fallbackProps['data-revision'], 0);

    const nanProps = resolveSceneRecoveryContainerProps(
      'context_lost',
      Number.NaN,
    );
    assert.equal(nanProps['data-revision'], 0);
  });

  it('formatSceneRecoveryTelemetry tek satırlık doğru telemetri metni üretir', () => {
    const telemetry = formatSceneRecoveryTelemetry('init_error', 3);
    assert.equal(
      telemetry,
      '3B Kurtarma: 3B sahne başlatılamadı | Varyant: init_error | Revizyon: 3',
    );
  });

  it('resolveSceneRecoveryState tüm alanları içeren saf durum nesnesini eksiksiz üretir', () => {
    const state = resolveSceneRecoveryState({
      variant: 'context_lost',
      revision: 1,
    });
    assert.equal(state.config.variant, 'context_lost');
    assert.equal(state.containerProps['data-revision'], 1);
    assert.match(state.telemetrySummary, /3B grafik bağlamı kesildi/);
  });
});

