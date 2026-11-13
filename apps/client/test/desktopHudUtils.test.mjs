import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateRemainingCrystals,
  resolveIsPortalUnlocked,
  resolveAnyOverlayOpen,
  resolveLeaderboardInitialLevel,
} from '../src/utils/desktopHudUtils.ts';

test('desktopHudUtils — Masaüstü HUD Katmanı ve Overlay Kuralları', async (t) => {
  await t.test('calculateRemainingCrystals toplanan indeksleri güvenle eler', () => {
    const crystals = [
      { id: 0, pos: [1, 0, 1] },
      { id: 1, pos: [2, 0, 2] },
      { id: 2, pos: [3, 0, 3] },
    ];

    const remaining = calculateRemainingCrystals(crystals, [1]);
    assert.equal(remaining.length, 2);
    assert.deepEqual(remaining, [crystals[0], crystals[2]]);

    const allCollected = calculateRemainingCrystals(crystals, [0, 1, 2]);
    assert.equal(allCollected.length, 0);

    const noneCollected = calculateRemainingCrystals(crystals, []);
    assert.equal(noneCollected.length, 3);
  });

  await t.test('resolveIsPortalUnlocked tüm kristaller toplanınca veya kristal yoksa portalı açar', () => {
    assert.equal(resolveIsPortalUnlocked(3, 3), true);
    assert.equal(resolveIsPortalUnlocked(3, 4), true);
    assert.equal(resolveIsPortalUnlocked(3, 2), false);
    assert.equal(resolveIsPortalUnlocked(0, 0), true);
  });

  await t.test('resolveAnyOverlayOpen en az bir modal açıkken true döner', () => {
    const baseFlags = {
      isPairingModalOpen: false,
      isSettingsOpen: false,
      isEditorOpen: false,
      isLeaderboardOpen: false,
      isHelpOpen: false,
    };

    assert.equal(resolveAnyOverlayOpen(baseFlags), false);
    assert.equal(resolveAnyOverlayOpen({ ...baseFlags, isSettingsOpen: true }), true);
    assert.equal(resolveAnyOverlayOpen({ ...baseFlags, isPairingModalOpen: true }), true);
    assert.equal(resolveAnyOverlayOpen({ ...baseFlags, isHelpOpen: true }), true);
    assert.equal(resolveAnyOverlayOpen({ ...baseFlags, isEditorOpen: true }), true);
    assert.equal(resolveAnyOverlayOpen({ ...baseFlags, isLeaderboardOpen: true }), true);
  });

  await t.test('resolveLeaderboardInitialLevel özel harita (99) için 1, standart bölümler için kendisini döner', () => {
    assert.equal(resolveLeaderboardInitialLevel(99), 1);
    assert.equal(resolveLeaderboardInitialLevel(5), 5);
    assert.equal(resolveLeaderboardInitialLevel(1), 1);
    assert.equal(resolveLeaderboardInitialLevel(0), 1);
  });
});
