import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  MODAL_PRIORITY_HIERARCHY,
  resolveActiveModals,
  resolveTopmostModal,
  shouldPreventBackdropClose,
  resolveModalZIndex,
  resolveModalGroupRenderFlags,
  resolveModalsContainerAria,
  resolveDesktopModalsLayerState,
} from '../src/utils/desktopModalsOrchestrationUtils.ts';

describe('desktopModalsOrchestrationUtils — Masaüstü Modallar ve Çekmeceler Orkestrasyon Motoru', () => {
  it('MODAL_PRIORITY_HIERARCHY beklenen öncelik sırasını ve tüm 6 modal türünü içerir', () => {
    assert.deepEqual(MODAL_PRIORITY_HIERARCHY, [
      'outcome',
      'pairing',
      'editor',
      'leaderboard',
      'settings',
      'help',
    ]);
  });

  it('resolveActiveModals boş ve geçersiz girdilerde boş dizi döner', () => {
    assert.deepEqual(resolveActiveModals(), []);
    assert.deepEqual(resolveActiveModals({}), []);
    assert.deepEqual(
      resolveActiveModals({ gameStatus: 'playing', isEditorOpen: false }),
      [],
    );
  });

  it('resolveActiveModals gameStatus won veya lost olduğunda outcome anahtarını ekler', () => {
    assert.deepEqual(resolveActiveModals({ gameStatus: 'won' }), ['outcome']);
    assert.deepEqual(resolveActiveModals({ gameStatus: 'lost' }), ['outcome']);
    assert.deepEqual(resolveActiveModals({ gameStatus: 'idle' }), []);
  });

  it('resolveActiveModals birden fazla açık modal olduğunda öncelik sırasına göre dizer', () => {
    const active = resolveActiveModals({
      isHelpOpen: true,
      isEditorOpen: true,
      isLeaderboardOpen: true,
      isPairingModalOpen: false,
      gameStatus: 'won',
    });

    // Beklenen sıra: outcome (zafer), editor, leaderboard, help
    assert.deepEqual(active, ['outcome', 'editor', 'leaderboard', 'help']);
  });

  it('resolveTopmostModal en yüksek öncelikli modalı seçer, boşken null döner', () => {
    assert.equal(resolveTopmostModal([]), null);
    assert.equal(resolveTopmostModal(['pairing', 'help']), 'pairing');
    assert.equal(resolveTopmostModal(['settings']), 'settings');
  });

  it('shouldPreventBackdropClose yalnızca oyun sonu (outcome) ekranlarında true döner', () => {
    assert.equal(shouldPreventBackdropClose('outcome'), true);
    assert.equal(shouldPreventBackdropClose('editor'), false);
    assert.equal(shouldPreventBackdropClose('settings'), false);
    assert.equal(shouldPreventBackdropClose('pairing'), false);
    assert.equal(shouldPreventBackdropClose('leaderboard'), false);
    assert.equal(shouldPreventBackdropClose('help'), false);
    assert.equal(shouldPreventBackdropClose(null), false);
  });

  it('resolveModalZIndex her modal için deterministik z-index seviyelerini belirler', () => {
    assert.equal(resolveModalZIndex('outcome'), 70);
    assert.equal(resolveModalZIndex('pairing'), 65);
    assert.equal(resolveModalZIndex('editor'), 60);
    assert.equal(resolveModalZIndex('leaderboard'), 55);
    assert.equal(resolveModalZIndex('settings'), 50);
    assert.equal(resolveModalZIndex('help'), 50);
    assert.equal(resolveModalZIndex(null), 40);
  });

  it('resolveModalGroupRenderFlags yardımcı, sosyal ve oyun sonu gruplarını doğru çözer', () => {
    const utilityOnly = resolveModalGroupRenderFlags(['settings', 'help']);
    assert.equal(utilityOnly.hasUtilityModal, true);
    assert.equal(utilityOnly.hasSocialModal, false);
    assert.equal(utilityOnly.hasOutcomeModal, false);
    assert.equal(utilityOnly.totalActiveModals, 2);
    assert.equal(utilityOnly.topmostModal, 'settings');
    assert.equal(utilityOnly.preventBackdropClose, false);

    const socialOutcome = resolveModalGroupRenderFlags(['outcome', 'leaderboard']);
    assert.equal(socialOutcome.hasUtilityModal, false);
    assert.equal(socialOutcome.hasSocialModal, true);
    assert.equal(socialOutcome.hasOutcomeModal, true);
    assert.equal(socialOutcome.totalActiveModals, 2);
    assert.equal(socialOutcome.topmostModal, 'outcome');
    assert.equal(socialOutcome.preventBackdropClose, true);
  });

  it('resolveModalsContainerAria erişilebilirlik ve test denetim özniteliklerini döner', () => {
    const emptyAria = resolveModalsContainerAria([]);
    assert.equal(emptyAria.id, 'desktop-modals-layer');
    assert.equal(emptyAria['aria-live'], 'polite');
    assert.equal(emptyAria['data-active-modals'], 'none');
    assert.equal(emptyAria['data-topmost'], 'none');
    assert.equal(emptyAria['data-has-modal'], false);

    const activeAria = resolveModalsContainerAria(['editor', 'settings']);
    assert.equal(activeAria['data-active-modals'], 'editor,settings');
    assert.equal(activeAria['data-topmost'], 'editor');
    assert.equal(activeAria['data-has-modal'], true);
  });

  it('resolveDesktopModalsLayerState entegre orkestrasyon durumunu eksiksiz birleştirir', () => {
    const state = resolveDesktopModalsLayerState({
      isSettingsOpen: true,
      isPairingModalOpen: true,
      gameStatus: 'playing',
    });

    assert.deepEqual(state.activeModals, ['pairing', 'settings']);
    assert.equal(state.topmostModal, 'pairing');
    assert.equal(state.hasActiveModal, true);
    assert.equal(state.preventBackdropClose, false);
    assert.equal(state.groupFlags.hasSocialModal, true);
    assert.equal(state.groupFlags.hasUtilityModal, true);
    assert.equal(state.groupFlags.hasOutcomeModal, false);
    assert.equal(state.containerAria['data-topmost'], 'pairing');
    assert.equal(state.containerAria['data-has-modal'], true);
  });
});
