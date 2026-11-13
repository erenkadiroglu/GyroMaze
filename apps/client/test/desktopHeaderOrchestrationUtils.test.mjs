import test, { describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  resolveDesktopHeaderTelemetry,
  resolveLevelSelectState,
  formatProceduralNotification,
  shouldClosePopoverOnKeyDown,
  shouldClosePopoverOnMouseDown,
} from '../src/utils/desktopHeaderOrchestrationUtils.ts';

describe('desktopHeaderOrchestrationUtils — Masaüstü Başlık ve Bölüm Seçim Orkestrasyonu', () => {
  test('resolveDesktopHeaderTelemetry: Bölüm 1 standart telemetrisini doğrular', () => {
    const telemetry = resolveDesktopHeaderTelemetry({
      level: 1,
      customLevel: null,
      collectedCrystalsCount: 1,
      gameMode: 'standard',
      elapsedSeconds: 8.5,
      bestTimes: { 1: 10.2 },
      isSocketConnected: true,
      isControllerPaired: true,
      isSecondControllerPaired: false,
      latencyMs: 14,
    });

    assert.equal(telemetry.currentLevelInfo.id, 1);
    assert.equal(telemetry.totalCrystals, 3);
    assert.equal(telemetry.isPortalUnlocked, false);
    assert.equal(telemetry.ratioText, '1/3');
    assert.equal(telemetry.isTimeAttack, false);
    assert.equal(telemetry.currentBestTime, 10.2);
    assert.equal(telemetry.isAnyPaired, true);
    assert.equal(telemetry.dotColor, 'bg-ok');
    assert.match(telemetry.visibleTimerText, /08\.5|8\.5/);
  });

  test('resolveDesktopHeaderTelemetry: time_attack modunda kalan süreyi hesaplar', () => {
    const telemetry = resolveDesktopHeaderTelemetry({
      level: 1,
      customLevel: null,
      collectedCrystalsCount: 3,
      gameMode: 'time_attack',
      elapsedSeconds: 5.0,
      bestTimes: {},
      isSocketConnected: true,
      isControllerPaired: false,
      isSecondControllerPaired: false,
      latencyMs: 0,
    });

    assert.equal(telemetry.isTimeAttack, true);
    assert.equal(telemetry.isPortalUnlocked, true);
    assert.equal(telemetry.ratioText, '3/3');
    assert.equal(typeof telemetry.timeRemaining, 'number');
    assert.equal(telemetry.timeRemaining > 0, true);
  });

  test('resolveLevelSelectState: standart bölüm ve kampanya ilerlemesini çözer', () => {
    const state = resolveLevelSelectState({
      level: 2,
      customLevel: null,
      bestTimes: { 1: 12.0 },
    });

    assert.equal(state.currentLevelInfo.id, 2);
    assert.equal(state.activeNumericLevel, 2);
    assert.equal(state.shortLevelTag, 'Bölüm 02');
    assert.match(state.cleanTitle, /Sismik Sarmal/);
    assert.equal(state.nextProceduralLevel, 6);
    assert.equal(
      state.proceduralNotificationText,
      'Prosedürel Bölüm 06 oluşturuldu',
    );
  });

  test('resolveLevelSelectState: özel harita 99 durumunu doğrular', () => {
    const state = resolveLevelSelectState({
      level: 99,
      customLevel: null,
      bestTimes: {},
    });

    assert.equal(state.activeNumericLevel, 1);
    assert.equal(state.shortLevelTag, 'Özel');
  });

  test('formatProceduralNotification: seviye numarasını sıfır dolgulu biçimlendirir', () => {
    assert.equal(
      formatProceduralNotification(7),
      'Prosedürel Bölüm 07 oluşturuldu',
    );
    assert.equal(
      formatProceduralNotification(14),
      'Prosedürel Bölüm 14 oluşturuldu',
    );
  });

  test('shouldClosePopoverOnKeyDown: Escape tuşunu doğrular', () => {
    assert.equal(shouldClosePopoverOnKeyDown('Escape'), true);
    assert.equal(shouldClosePopoverOnKeyDown('Enter'), false);
    assert.equal(shouldClosePopoverOnKeyDown('Tab'), false);
  });

  test('shouldClosePopoverOnMouseDown: popover dışı tıklamaları tespit eder', () => {
    const targetInside = { id: 'inside' };
    const targetOutside = { id: 'outside' };
    const mockPopover = {
      contains: (node) => node === targetInside,
    };

    assert.equal(
      shouldClosePopoverOnMouseDown(mockPopover, targetInside),
      false,
    );
    assert.equal(
      shouldClosePopoverOnMouseDown(mockPopover, targetOutside),
      true,
    );
    assert.equal(shouldClosePopoverOnMouseDown(null, targetOutside), false);
  });
});
