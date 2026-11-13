import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  resolveControllerBannersVisibility,
  formatControllerBannersTelemetry,
  resolveControllerBannersContainerProps,
  resolveControllerBannersState,
} from '../src/utils/controllerBannersOrchestrationUtils.ts';

describe('controllerBannersOrchestrationUtils — Mobil Kontrolcü Durum Bildirimleri Orkestrasyon Motoru', () => {
  it('resolveControllerBannersVisibility hata mesajı varlığında showError ve primaryBannerType error döner', () => {
    const vis = resolveControllerBannersVisibility({
      errorMessage: 'Oda bulunamadı',
      isControllerPaired: true,
      isRoomEditorOpen: false,
    });

    assert.equal(vis.showError, true);
    assert.equal(vis.primaryBannerType, 'error');
  });

  it('resolveControllerBannersVisibility zafer durumunda showVictory ve primaryBannerType victory döner', () => {
    const vis = resolveControllerBannersVisibility({
      errorMessage: null,
      isControllerPaired: true,
      gameStatus: 'won',
      isRoomEditorOpen: false,
    });

    assert.equal(vis.showError, false);
    assert.equal(vis.showVictory, true);
    assert.equal(vis.showNav, true);
    assert.equal(vis.primaryBannerType, 'victory');
  });

  it('resolveControllerBannersVisibility yenilgi durumunda showDefeat ve primaryBannerType defeat döner', () => {
    const vis = resolveControllerBannersVisibility({
      errorMessage: null,
      isControllerPaired: true,
      gameStatus: 'lost',
      isRoomEditorOpen: false,
    });

    assert.equal(vis.showDefeat, true);
    assert.equal(vis.showVictory, false);
    assert.equal(vis.primaryBannerType, 'defeat');
  });

  it('resolveControllerBannersVisibility oda editörü açıkken nav, zafer ve yenilgi şeritlerini gizler', () => {
    const vis = resolveControllerBannersVisibility({
      isControllerPaired: true,
      isRoomEditorOpen: true,
      gameStatus: 'won',
    });

    assert.equal(vis.showNav, false);
    assert.equal(vis.showVictory, false);
    assert.equal(vis.showDefeat, false);
  });

  it('resolveControllerBannersVisibility seviye 1 için isPrevDisabled true, seviye 2 için false döner', () => {
    const level1 = resolveControllerBannersVisibility({ level: 1 });
    assert.equal(level1.isPrevDisabled, true);

    const level2 = resolveControllerBannersVisibility({ level: 2 });
    assert.equal(level2.isPrevDisabled, false);
  });

  it('formatControllerBannersTelemetry durum önceliklerine göre doğru özet formatlar', () => {
    const errVis = resolveControllerBannersVisibility({ errorMessage: 'Bağlantı koptu' });
    assert.equal(
      formatControllerBannersTelemetry(errVis, { errorMessage: 'Bağlantı koptu' }),
      'Hata Bildirimi: Bağlantı koptu',
    );

    const winVis = resolveControllerBannersVisibility({
      isControllerPaired: true,
      gameStatus: 'won',
      level: 3,
    });
    assert.match(formatControllerBannersTelemetry(winVis, { level: 3 }), /Zafer Şeridi Aktif/);

    const defeatVis = resolveControllerBannersVisibility({
      isControllerPaired: true,
      gameStatus: 'lost',
    });
    assert.equal(
      formatControllerBannersTelemetry(defeatVis),
      'Yenilgi Şeridi Aktif (Süre Doldu)',
    );

    const navVis = resolveControllerBannersVisibility({
      isControllerPaired: true,
      level: 2,
    });
    assert.match(
      formatControllerBannersTelemetry(navVis, {
        level: 2,
        remoteCrystalsCollected: 3,
        remoteCrystalsTotal: 5,
      }),
      /Gezinme Şeridi Aktif/,
    );

    const emptyVis = resolveControllerBannersVisibility({});
    assert.equal(formatControllerBannersTelemetry(emptyVis), 'Aktif Banner Yok');
  });

  it('resolveControllerBannersContainerProps erişilebilirlik ve veri denetim özniteliklerini döner', () => {
    const vis = resolveControllerBannersVisibility({
      errorMessage: 'Hata',
      isControllerPaired: true,
      level: 1,
    });
    const props = resolveControllerBannersContainerProps(vis);

    assert.equal(props.id, 'controller-status-banners');
    assert.equal(props.role, 'region');
    assert.equal(props['aria-label'], 'Mobil Kontrolcü Durum Bildirimleri');
    assert.match(props['data-active-banners'], /error,nav/);
    assert.equal(props['data-primary-banner'], 'error');
    assert.equal(props['data-banner-count'], 2);
  });

  it('resolveControllerBannersState tüm orkestrasyon durumunu eksiksiz birleştirir', () => {
    const state = resolveControllerBannersState({
      isControllerPaired: true,
      level: 2,
      remoteCrystalsCollected: 4,
      remoteCrystalsTotal: 4,
      gameStatus: 'won',
    });

    assert.equal(state.visibility.showVictory, true);
    assert.equal(state.visibility.showNav, true);
    assert.equal(state.visibility.primaryBannerType, 'victory');
    assert.equal(state.crystalRatio, '4/4');
    assert.match(state.levelLabel, /2/);
    assert.equal(state.containerProps['data-primary-banner'], 'victory');
  });
});
