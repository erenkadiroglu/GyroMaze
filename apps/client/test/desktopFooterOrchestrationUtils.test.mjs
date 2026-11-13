import test, { describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  resolveDesktopFooterState,
  formatRadarSummary,
  resolveFooterLayoutConfig,
} from '../src/utils/desktopFooterOrchestrationUtils.ts';

describe('desktopFooterOrchestrationUtils — Alt Telemetri ve Radar Orkestrasyonu', () => {
  test('resolveDesktopFooterState: tek oyunculu modda standart klavye ipuçlarını döner', () => {
    const state = resolveDesktopFooterState({
      isControllerPaired: false,
      isSecondControllerPaired: false,
      isMultiplayer: false,
      showMiniMap: true,
    });

    assert.equal(state.isMultiplayer, false);
    assert.equal(state.showMiniMap, true);
    assert.equal(state.p1NeedsKeyboard, false);
    assert.equal(state.p2NeedsKeyboard, false);
    assert.equal(state.hintItems.length, 3);
    assert.equal(state.hintItems[0].key, 'WASD');
    assert.match(state.footerAriaLabel, /alt kontroller paneli/i);
  });

  test('resolveDesktopFooterState: çok oyunculuda bağlı olmayan kontrolcülere göre ipucu listeler', () => {
    // 1. kontrolcü bağlı, 2. bağlı değil -> yalnızca 2. bilye ipucu
    const statePartial = resolveDesktopFooterState({
      isControllerPaired: true,
      isSecondControllerPaired: false,
      isMultiplayer: true,
      showMiniMap: false,
    });

    assert.equal(statePartial.p1NeedsKeyboard, false);
    assert.equal(statePartial.p2NeedsKeyboard, true);
    assert.equal(statePartial.hintItems.length, 1);
    assert.equal(statePartial.hintItems[0].key, 'Oklar');

    // Her ikisi de bağlı -> sıfır klavye ipucu
    const stateAllPaired = resolveDesktopFooterState({
      isControllerPaired: true,
      isSecondControllerPaired: true,
      isMultiplayer: true,
      showMiniMap: true,
    });

    assert.equal(stateAllPaired.p1NeedsKeyboard, false);
    assert.equal(stateAllPaired.p2NeedsKeyboard, false);
    assert.equal(stateAllPaired.hintItems.length, 0);
  });

  test('formatRadarSummary: radar durum metnini doğru formatlar', () => {
    assert.equal(
      formatRadarSummary(0, true),
      'Radar: Hedef portalı açık ve aktif',
    );
    assert.equal(
      formatRadarSummary(2, false),
      'Radar: 2 kristal toplanmayı bekliyor',
    );
  });

  test('resolveFooterLayoutConfig: ekran kompaktlığına göre boşluk sınıfını belirler', () => {
    assert.deepEqual(resolveFooterLayoutConfig(true), {
      isCompact: true,
      gapClass: 'gap-2',
    });
    assert.deepEqual(resolveFooterLayoutConfig(false), {
      isCompact: false,
      gapClass: 'gap-4',
    });
  });
});
