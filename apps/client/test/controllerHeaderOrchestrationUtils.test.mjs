import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  getControllerHeaderClassName,
  formatControllerHeaderTelemetry,
  resolveHeaderContainerProps,
  resolveControllerHeaderState,
} from '../src/utils/controllerHeaderOrchestrationUtils.ts';

describe('controllerHeaderOrchestrationUtils — Mobil Kontrolcü Başlık Orkestrasyon Motoru', () => {
  it('getControllerHeaderClassName standart flex ve stil sınıflarını döner', () => {
    const cls = getControllerHeaderClassName();
    assert.match(cls, /flex items-center justify-between/);
    assert.match(cls, /rounded-2xl border border-line bg-surface/);
  });

  it('formatControllerHeaderTelemetry bağlı ve oda kodlu durumda doğru özet üretir', () => {
    const summary = formatControllerHeaderTelemetry({
      activeRoomCode: 'WM3ACZ',
      playerSlot: 1,
      isControllerPaired: true,
      isSocketConnected: true,
      latencyMs: 14,
      isHapticEnabled: true,
      colorScheme: 'dark',
    });

    assert.equal(
      summary,
      'GyroMaze P1 | WM3ACZ | Bağlı (14ms) | Titreşim Açık | Gece',
    );
  });

  it('formatControllerHeaderTelemetry oda ve bağlantı yokken güvenli varsayılanlar kullanır', () => {
    const summary = formatControllerHeaderTelemetry({
      playerSlot: 2,
      isHapticEnabled: false,
      colorScheme: 'light',
    });

    assert.equal(
      summary,
      'GyroMaze P2 | Oda Yok | Kopuk | Titreşim Kapalı | Gündüz',
    );
  });

  it('formatControllerHeaderTelemetry soket bağlı ancak eşleşmemişken Hazır döner', () => {
    const summary = formatControllerHeaderTelemetry({
      activeRoomCode: 'XYZ999',
      isControllerPaired: false,
      isSocketConnected: true,
    });

    assert.match(summary, /Hazır/);
  });

  it('resolveHeaderContainerProps semantik banner rolünü ve veri denetim özniteliklerini döner', () => {
    const props = resolveHeaderContainerProps({
      activeRoomCode: 'ABC123',
      playerSlot: 2,
      isControllerPaired: true,
      isSocketConnected: true,
      latencyMs: 9,
    });

    assert.equal(props.role, 'banner');
    assert.equal(props['aria-label'], 'Mobil Kontrolcü Başlık Çubuğu');
    assert.equal(props['data-room'], 'ABC123');
    assert.equal(props['data-player-slot'], 2);
    assert.equal(props['data-paired'], true);
    assert.equal(props['data-connected'], true);
    assert.equal(props['data-latency'], 9);
  });

  it('resolveControllerHeaderState tüm alt durumları ve öznitelikleri eksiksiz birleştirir', () => {
    const state = resolveControllerHeaderState({
      activeRoomCode: 'TEST01',
      playerSlot: 1,
      isHapticEnabled: true,
      colorScheme: 'dark',
      isRoomEditorOpen: false,
      isControllerPaired: true,
      isSocketConnected: true,
      latencyMs: 12,
    });

    assert.equal(state.haptic.isEnabled, true);
    assert.equal(state.haptic.ariaLabel, 'Titreşimi kapat');
    assert.equal(state.theme.colorScheme, 'dark');
    assert.equal(state.theme.ariaLabel, 'Gündüz moduna geç');
    assert.equal(state.room.buttonLabel, 'Kod');
    assert.equal(state.room.isOpen, false);
    assert.equal(state.connection.isPaired, true);
    assert.equal(state.connection.latencyMs, 12);
    assert.match(state.connection.ariaLabel, /Bağlı \(12ms\)/);
    assert.equal(state.player.slot, 1);
    assert.match(state.player.badgeClass, /text-brass/);
    assert.equal(state.containerProps['data-room'], 'TEST01');
  });

  it('resolveControllerHeaderState boş girdilerde güvenli varsayılanlara döner', () => {
    const state = resolveControllerHeaderState();

    assert.equal(state.haptic.isEnabled, false);
    assert.equal(state.theme.colorScheme, 'dark');
    assert.equal(state.room.buttonLabel, 'Kod gir');
    assert.equal(state.connection.isPaired, false);
    assert.equal(state.connection.isConnected, false);
    assert.equal(state.player.slot, 1);
    assert.equal(state.containerProps['data-room'], 'none');
  });
});
