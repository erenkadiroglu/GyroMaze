import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateRemainingCrystals,
  resolveIsPortalUnlocked,
  resolveAnyOverlayOpen,
  resolveLeaderboardInitialLevel,
  getDesktopHudContainerClass,
  getDesktopHudAriaProps,
  isCustomLevel,
  formatHudLevelBadge,
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

  await t.test('getDesktopHudContainerClass ve getDesktopHudAriaProps geçerli erişilebilirlik değerleri döner', () => {
    const containerClass = getDesktopHudContainerClass();
    assert.match(containerClass, /pointer-events-none/);
    assert.match(containerClass, /fixed inset-0/);

    const ariaProps = getDesktopHudAriaProps();
    assert.equal(ariaProps.role, 'region');
    assert.equal(ariaProps['aria-label'], 'Oyun arayüzü ve kontrolleri');
  });

  await t.test('isCustomLevel 99 numaralı seviyeyi doğru doğrular', () => {
    assert.equal(isCustomLevel(99), true);
    assert.equal(isCustomLevel(1), false);
    assert.equal(isCustomLevel(2), false);
  });

  await t.test('formatHudLevelBadge standart ve özel bölümleri doğru etiketler', () => {
    assert.equal(formatHudLevelBadge(1, 'Başlangıç'), '1. Bölüm — Başlangıç');
    assert.equal(formatHudLevelBadge(2, ''), '2. Bölüm');
    assert.equal(formatHudLevelBadge(99, 'Özel Harita'), 'Özel Harita');
  });
});
