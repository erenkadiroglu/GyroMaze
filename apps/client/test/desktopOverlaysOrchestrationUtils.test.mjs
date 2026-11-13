import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  getOverlaysContainerClassName,
  formatOverlaysTelemetry,
  resolveOverlaysContainerProps,
  resolveDesktopOverlaysState,
} from '../src/utils/desktopOverlaysOrchestrationUtils.ts';

describe('desktopOverlaysOrchestrationUtils — Sahne Üstü Bildirim ve Duraklatma Katmanı Orkestrasyon Motoru', () => {
  it('getOverlaysContainerClassName standart pointer-events-none ve z-20 sınıflarını döner', () => {
    const cls = getOverlaysContainerClassName();
    assert.match(cls, /pointer-events-none/);
    assert.match(cls, /fixed inset-0/);
    assert.match(cls, /z-20/);
  });

  it('formatOverlaysTelemetry bildirim ve kurtarma çubuğu durumlarına göre doğru özet üretir', () => {
    assert.equal(formatOverlaysTelemetry(false, null), 'Sahne Bildirimi Yok');
    assert.equal(formatOverlaysTelemetry(true, null), 'Kurtarma Çubuğu Aktif');
    assert.equal(
      formatOverlaysTelemetry(false, { id: 1, message: 'Harita yüklendi', tone: 'info' }),
      'Bildirim: Harita yüklendi',
    );
    assert.equal(
      formatOverlaysTelemetry(true, { id: 2, message: 'Bağlantı koptu', tone: 'warn' }),
      'Kurtarma Çubuğu Aktif | Bildirim: Bağlantı koptu',
    );
  });

  it('resolveOverlaysContainerProps kapsayıcı DOM özniteliklerini doğru üretir', () => {
    const propsInactive = resolveOverlaysContainerProps(false, null);
    assert.equal(propsInactive.id, 'desktop-hud-overlays');
    assert.equal(propsInactive['data-recovery-open'], false);
    assert.equal(propsInactive['data-toast-visible'], false);
    assert.equal(propsInactive['data-tone'], 'none');
    assert.equal(propsInactive['data-has-overlay'], false);

    const propsActive = resolveOverlaysContainerProps(true, {
      id: 5,
      message: 'Hızlı süre!',
      tone: 'success',
    });
    assert.equal(propsActive['data-recovery-open'], true);
    assert.equal(propsActive['data-toast-visible'], true);
    assert.equal(propsActive['data-tone'], 'success');
    assert.equal(propsActive['data-has-overlay'], true);
  });

  it('resolveDesktopOverlaysState duraklatma ve bildirim durumlarını eksiksiz çözer', () => {
    const pausedState = resolveDesktopOverlaysState({
      gameStatus: 'paused',
      isAnyOverlayOpen: false,
      hudNotification: null,
    });
    assert.equal(pausedState.showRecoveryBar, true);
    assert.equal(pausedState.isNotificationVisible, false);
    assert.equal(pausedState.hasActiveOverlay, true);
    assert.equal(pausedState.telemetrySummary, 'Kurtarma Çubuğu Aktif');

    const modalBlocksRecovery = resolveDesktopOverlaysState({
      gameStatus: 'paused',
      isAnyOverlayOpen: true,
      hudNotification: null,
    });
    assert.equal(modalBlocksRecovery.showRecoveryBar, false);
    assert.equal(modalBlocksRecovery.hasActiveOverlay, false);

    const warningNotification = resolveDesktopOverlaysState({
      gameStatus: 'playing',
      isAnyOverlayOpen: false,
      hudNotification: {
        id: 10,
        message: 'Lazer kapısı yaklaşıyor!',
        tone: 'warn',
      },
    });
    assert.equal(warningNotification.showRecoveryBar, false);
    assert.equal(warningNotification.isNotificationVisible, true);
    assert.equal(warningNotification.notificationAriaLive, 'assertive');
    assert.equal(warningNotification.hasActiveOverlay, true);
    assert.equal(
      warningNotification.telemetrySummary,
      'Bildirim: Lazer kapısı yaklaşıyor!',
    );
  });

  it('resolveDesktopOverlaysState boş veya geçersiz girdilerde varsayılanlara döner', () => {
    const state = resolveDesktopOverlaysState();
    assert.equal(state.showRecoveryBar, false);
    assert.equal(state.isNotificationVisible, false);
    assert.equal(state.notificationAriaLive, 'polite');
    assert.equal(state.hasActiveOverlay, false);
    assert.equal(state.telemetrySummary, 'Sahne Bildirimi Yok');
  });
});
