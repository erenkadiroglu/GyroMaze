import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getSceneContainerClass,
  getSceneCanvasCameraConfig,
  getSceneGLConfig,
  getSceneDprRange,
  getScenePhysicsGravity,
  formatSceneSummary,
} from '../src/utils/sceneViewportUtils.ts';

test('sceneViewportUtils — 3B Sahne Viewport ve Kamera Yapılandırması', async (t) => {
  await t.test('getSceneContainerClass tam ekran ve arka plan stillerini içerir', () => {
    const cls = getSceneContainerClass();
    assert.match(cls, /fixed/);
    assert.match(cls, /inset-0/);
    assert.match(cls, /bg-base/);
  });

  await t.test('getSceneCanvasCameraConfig standart perspektif kamera parametrelerini döner', () => {
    const cam = getSceneCanvasCameraConfig();
    assert.deepEqual(cam.position, [0, 14.5, 10.2]);
    assert.equal(cam.fov, 42);
    assert.equal(cam.near, 0.1);
    assert.equal(cam.far, 60);
  });

  await t.test('getSceneGLConfig yüksek performans ve antialias ayarlarını içerir', () => {
    const gl = getSceneGLConfig();
    assert.equal(gl.powerPreference, 'high-performance');
    assert.equal(gl.antialias, true);
  });

  await t.test('getSceneDprRange ve getScenePhysicsGravity doğru sayısal değerleri döner', () => {
    assert.deepEqual(getSceneDprRange(), [1, 1.5]);
    assert.deepEqual(getScenePhysicsGravity(), [0, 0, 0]);
  });

  await t.test('formatSceneSummary bölüm, portal durumu ve kalan kristalleri formatlar', () => {
    assert.equal(
      formatSceneSummary(3, true, 0),
      'Bölüm 3, Portal: Açık, Kalan Kristal: 0',
    );
    assert.equal(
      formatSceneSummary(1, false, 5),
      'Bölüm 1, Portal: Kilitli, Kalan Kristal: 5',
    );
    assert.equal(
      formatSceneSummary(Number.NaN, false, -2),
      'Bölüm 1, Portal: Kilitli, Kalan Kristal: 0',
    );
  });
});

