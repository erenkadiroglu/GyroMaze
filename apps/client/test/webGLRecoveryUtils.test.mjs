import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import {
  createContextLostHandler,
  createContextRestoredHandler,
  resolveCanvasKey,
  resolveNextCanvasRevision,
  shouldShowRecoveryBanner,
  getRecoveryBannerConfig,
} from '../src/utils/webGLRecoveryUtils.ts';

describe('webGLRecoveryUtils — WebGL Grafik Bağlam Kurtarma Motoru', () => {
  describe('Olay Dinleyici Sarmalayicilari', () => {
    test('createContextLostHandler preventDefault cagirmali ve onLost tetiklemeli', () => {
      let lostTriggered = false;
      let defaultPrevented = false;

      const handler = createContextLostHandler(() => {
        lostTriggered = true;
      });

      handler({
        preventDefault: () => {
          defaultPrevented = true;
        },
      });

      assert.equal(lostTriggered, true);
      assert.equal(defaultPrevented, true);
    });

    test('createContextRestoredHandler onRestored tetiklemeli', () => {
      let restoredTriggered = false;
      const handler = createContextRestoredHandler(() => {
        restoredTriggered = true;
      });

      handler();
      assert.equal(restoredTriggered, true);
    });
  });

  describe('Canvas Anahtari ve Revizyon Yonetimi', () => {
    test('resolveCanvasKey revizyona gore tutarli anahtar uretmeli', () => {
      assert.equal(resolveCanvasKey(0), 'gyromaze_stage_canvas_rev_0');
      assert.equal(resolveCanvasKey(3), 'gyromaze_stage_canvas_rev_3');
      assert.equal(resolveCanvasKey(-1), 'gyromaze_stage_canvas_rev_0');
      assert.equal(resolveCanvasKey(null), 'gyromaze_stage_canvas_rev_0');
    });

    test('resolveNextCanvasRevision sayaci artirmali ve gecersizlerde 1 donmeli', () => {
      assert.equal(resolveNextCanvasRevision(0), 1);
      assert.equal(resolveNextCanvasRevision(4), 5);
      assert.equal(resolveNextCanvasRevision(-2), 1);
      assert.equal(resolveNextCanvasRevision(Number.NaN), 1);
    });
  });

  describe('Kurtarma Uyarisi Yapilandirmasi', () => {
    test('shouldShowRecoveryBanner yalnizca context kaybinda true donmeli', () => {
      assert.equal(shouldShowRecoveryBanner(true), true);
      assert.equal(shouldShowRecoveryBanner(false), false);
    });

    test('getRecoveryBannerConfig baslik, mesaj ve buton metni icermeli', () => {
      const config = getRecoveryBannerConfig();
      assert.ok(config.title.includes('WebGL') || config.title.includes('Grafik'));
      assert.ok(config.message.length > 10);
      assert.ok(config.retryButtonText.length > 0);
    });
  });
});
