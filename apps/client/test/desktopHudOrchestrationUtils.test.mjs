import test, { describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  resolveCrystalProgressText,
  resolveCrystalProgressPercentage,
  resolvePortalStatusMessage,
  resolveDesktopHudState,
} from '../src/utils/desktopHudOrchestrationUtils.ts';

describe('desktopHudOrchestrationUtils — Masaüstü HUD ve İlerleme Orkestrasyonu', () => {
  test('resolveCrystalProgressText: kristal sayısına göre doğru metin formatlar', () => {
    assert.equal(resolveCrystalProgressText(0, 0), 'Gereksinim Yok');
    assert.equal(resolveCrystalProgressText(2, 3), '2 / 3');
    assert.equal(resolveCrystalProgressText(3, 3), '3 / 3 (Tamamlandı)');
    assert.equal(resolveCrystalProgressText(5, 3), '3 / 3 (Tamamlandı)');
    assert.equal(resolveCrystalProgressText(-1, 3), '0 / 3');
  });

  test('resolveCrystalProgressPercentage: ilerleme yüzdesini hesaplar', () => {
    assert.equal(resolveCrystalProgressPercentage(0, 0), 100);
    assert.equal(resolveCrystalProgressPercentage(1, 2), 50);
    assert.equal(resolveCrystalProgressPercentage(2, 3), 66.7);
    assert.equal(resolveCrystalProgressPercentage(3, 3), 100);
    assert.equal(resolveCrystalProgressPercentage(0, 5), 0);
  });

  test('resolvePortalStatusMessage: portal kilit ve kalan kristal durumunu açıklar', () => {
    assert.equal(resolvePortalStatusMessage(true, 0), 'Portal Açık! Hedefe Ulaş');
    assert.equal(resolvePortalStatusMessage(false, 0), 'Portal Açık! Hedefe Ulaş');
    assert.equal(resolvePortalStatusMessage(false, 2), '2 kristal daha topla');
  });

  test('resolveDesktopHudState: Bölüm 1 için HUD durumunu eksiksiz orkestre eder', () => {
    const overlayFlags = {
      isPairingModalOpen: false,
      isSettingsOpen: false,
      isEditorOpen: false,
      isLeaderboardOpen: false,
      isHelpOpen: false,
    };

    const state = resolveDesktopHudState({
      level: 1,
      customLevel: null,
      collectedCrystals: [0],
      overlayFlags,
    });

    assert.equal(state.currentLevelInfo.id, 1);
    assert.equal(state.totalCrystals, 3);
    assert.equal(state.collectedCount, 1);
    assert.equal(state.remainingCrystals.length, 2);
    assert.equal(state.isPortalUnlocked, false);
    assert.equal(state.isAnyOverlayOpen, false);
    assert.equal(state.leaderboardInitialLevel, 1);
    assert.equal(state.isCustomLevel, false);
    assert.match(state.levelBadgeText, /1\. Bölüm/);
    assert.equal(state.crystalProgressText, '1 / 3');
    assert.equal(state.crystalProgressPercentage, 33.3);
  });

  test('resolveDesktopHudState: tüm kristaller toplandığında portalı açar', () => {
    const overlayFlags = {
      isPairingModalOpen: false,
      isSettingsOpen: false,
      isEditorOpen: false,
      isLeaderboardOpen: false,
      isHelpOpen: false,
    };

    const state = resolveDesktopHudState({
      level: 1,
      customLevel: null,
      collectedCrystals: [0, 1, 2],
      overlayFlags,
    });

    assert.equal(state.isPortalUnlocked, true);
    assert.equal(state.remainingCrystals.length, 0);
    assert.equal(state.crystalProgressText, '3 / 3 (Tamamlandı)');
    assert.equal(state.crystalProgressPercentage, 100);
  });

  test('resolveDesktopHudState: modal açıkken isAnyOverlayOpen bayrağını doğrular', () => {
    const overlayFlags = {
      isPairingModalOpen: true,
      isSettingsOpen: false,
      isEditorOpen: false,
      isLeaderboardOpen: false,
      isHelpOpen: false,
    };

    const state = resolveDesktopHudState({
      level: 2,
      customLevel: null,
      collectedCrystals: [],
      overlayFlags,
    });

    assert.equal(state.isAnyOverlayOpen, true);
    assert.equal(state.leaderboardInitialLevel, 2);
  });
});
