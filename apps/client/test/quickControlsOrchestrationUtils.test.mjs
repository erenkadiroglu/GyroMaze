import test, { describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  QUICK_CONTROLS_TOOLBAR_ARIA_LABEL,
  QUICK_CONTROLS_TOOLBAR_CLASS,
  QUICK_CONTROLS_SEPARATOR_CLASS,
  resolveQuickControlsToolbarState,
  getQuickControlsAriaProps,
  getQuickControlsSeparatorProps,
  formatToolbarButtonTooltip,
} from '../src/utils/quickControlsOrchestrationUtils.ts';

describe('quickControlsOrchestrationUtils — Hızlı Sahne Kontrolleri Orkestrasyonu', () => {
  test('sabitler eksiksiz ve geçerlidir', () => {
    assert.equal(QUICK_CONTROLS_TOOLBAR_ARIA_LABEL, 'Hızlı sahne kontrolleri');
    assert.match(QUICK_CONTROLS_TOOLBAR_CLASS, /gm-panel/);
    assert.match(QUICK_CONTROLS_SEPARATOR_CLASS, /bg-line/);
  });

  test('resolveQuickControlsToolbarState: izometrik ve karanlık mod durumunu çözer', () => {
    const state = resolveQuickControlsToolbarState({
      cameraMode: 'isometric',
      colorScheme: 'dark',
      isSoundMuted: false,
    });

    assert.equal(state.cameraLabel, 'Kamera açısı: İzometrik');
    assert.equal(state.themeLabel, 'Gündüz moduna geç');
    assert.equal(state.soundLabel, 'Sesi kapat');
    assert.equal(state.nextCameraMode, 'topdown');
    assert.equal(state.nextColorScheme, 'light');
    assert.equal(state.nextSoundMuted, true);
    assert.equal(state.toolbarAriaLabel, QUICK_CONTROLS_TOOLBAR_ARIA_LABEL);
  });

  test('resolveQuickControlsToolbarState: kuşbakışı ve aydınlık mod durumunu çözer', () => {
    const state = resolveQuickControlsToolbarState({
      cameraMode: 'topdown',
      colorScheme: 'light',
      isSoundMuted: true,
    });

    assert.equal(state.cameraLabel, 'Kamera açısı: Üstten');
    assert.equal(state.themeLabel, 'Gece moduna geç');
    assert.equal(state.soundLabel, 'Sesi aç');
    assert.equal(state.nextCameraMode, 'follow');
    assert.equal(state.nextColorScheme, 'dark');
    assert.equal(state.nextSoundMuted, false);
  });

  test('getQuickControlsAriaProps ve getQuickControlsSeparatorProps semantik nitelikleri döner', () => {
    const ariaProps = getQuickControlsAriaProps();
    assert.equal(ariaProps.role, 'toolbar');
    assert.equal(ariaProps['aria-label'], QUICK_CONTROLS_TOOLBAR_ARIA_LABEL);

    const sepProps = getQuickControlsSeparatorProps();
    assert.equal(sepProps.role, 'separator');
    assert.equal(sepProps['aria-orientation'], 'vertical');
    assert.equal(sepProps.className, QUICK_CONTROLS_SEPARATOR_CLASS);
  });

  test('formatToolbarButtonTooltip: tüm eylemler için kısayollu ipucu formatlar', () => {
    assert.equal(
      formatToolbarButtonTooltip('reset'),
      'Topu Başlangıca Sıfırla (R)',
    );
    assert.equal(
      formatToolbarButtonTooltip('camera'),
      'Kamera Bakış Açısını Değiştir (C)',
    );
    assert.equal(
      formatToolbarButtonTooltip('theme'),
      'Aydınlık / Karanlık Mod (L)',
    );
    assert.equal(
      formatToolbarButtonTooltip('sound'),
      'Ses Efektlerini Aç / Kapat (M)',
    );
    assert.equal(
      formatToolbarButtonTooltip('editor'),
      'Harita Editörünü Aç (E)',
    );
    assert.equal(
      formatToolbarButtonTooltip('leaderboard'),
      'Küresel Skor Tablosu (K)',
    );
  });
});
