import test from 'node:test';
import assert from 'node:assert/strict';
import {
  HOOK_CATEGORIES,
  resolveHookCategory,
  isSceneHook,
  isControllerHook,
  formatHookDebugLabel,
} from '../src/utils/hookCategoryUtils.ts';

test('hookCategoryUtils — Kanca Sınıflandırma ve Telemetri Yardımcıları', async (t) => {
  await t.test('sabit kategori listesi 5 ana grubu içerir', () => {
    assert.deepEqual(HOOK_CATEGORIES, [
      'desktop',
      'controller',
      'scene',
      'settings',
      'lifecycle',
    ]);
  });

  await t.test('resolveHookCategory kontrolcü kancalarını doğru tespit eder', () => {
    assert.equal(resolveHookCategory('useControllerRoom'), 'controller');
    assert.equal(resolveHookCategory('useControllerSensors'), 'controller');
    assert.equal(resolveHookCategory('useGimbalInteraction'), 'controller');
    assert.equal(resolveHookCategory('useDeviceOrientation'), 'controller');
    assert.equal(isControllerHook('useControllerRoom'), true);
    assert.equal(isControllerHook('useDesktopHUD'), false);
  });

  await t.test('resolveHookCategory 3B sahne kancalarını doğru tespit eder', () => {
    assert.equal(resolveHookCategory('useMazeStageFrameLoop'), 'scene');
    assert.equal(resolveHookCategory('useBallInteractions'), 'scene');
    assert.equal(resolveHookCategory('useMotionTrail'), 'scene');
    assert.equal(resolveHookCategory('useGhostReplay'), 'scene');
    assert.equal(resolveHookCategory('useWebGLContextRecovery'), 'scene');
    assert.equal(isSceneHook('useMazeStageFrameLoop'), true);
    assert.equal(isSceneHook('useSettingsDrawer'), false);
  });

  await t.test('resolveHookCategory masaüstü ve ayarlar kancalarını ayrıştırır', () => {
    assert.equal(resolveHookCategory('useDesktopHUD'), 'desktop');
    assert.equal(resolveHookCategory('useDesktopHeader'), 'desktop');
    assert.equal(resolveHookCategory('useAttitudeTelemetryLoop'), 'desktop');
    assert.equal(resolveHookCategory('useSettingsDrawer'), 'settings');
    assert.equal(resolveHookCategory('useAppPreferences'), 'settings');
  });

  await t.test('resolveHookCategory bilinmeyen veya genel kancaları lifecycle olarak belirler', () => {
    assert.equal(resolveHookCategory('useSocket'), 'lifecycle');
    assert.equal(resolveHookCategory('useWakeLock'), 'lifecycle');
    assert.equal(resolveHookCategory(''), 'lifecycle');
  });

  await t.test('formatHookDebugLabel telemetri metnini doğru formatlar', () => {
    assert.equal(
      formatHookDebugLabel('useControllerSensors'),
      '[CONTROLLER] useControllerSensors',
    );
    assert.equal(
      formatHookDebugLabel('useMazeStageFrameLoop'),
      '[SCENE] useMazeStageFrameLoop',
    );
    assert.equal(
      formatHookDebugLabel(''),
      '[LIFECYCLE] useAnonymousHook',
    );
  });
});

