import test from 'node:test';
import assert from 'node:assert/strict';
import {
  resolveThemeToggleLabel,
  resolveSoundToggleLabel,
  formatCameraControlAriaLabel,
  resolveNextCameraMode,
} from '../src/utils/quickControlsUtils.ts';

test('quickControlsUtils — Hızlı Sahne Kontrolleri ve Araç Çubuğu Yardımcıları', async (t) => {
  await t.test('resolveThemeToggleLabel renk moduna göre doğru kullanıcı eylem metnini döner', () => {
    assert.equal(resolveThemeToggleLabel('light'), 'Gece moduna geç');
    assert.equal(resolveThemeToggleLabel('dark'), 'Gündüz moduna geç');
  });

  await t.test('resolveSoundToggleLabel ses durumuna göre doğru eylem metnini döner', () => {
    assert.equal(resolveSoundToggleLabel(true), 'Sesi aç');
    assert.equal(resolveSoundToggleLabel(false), 'Sesi kapat');
  });

  await t.test('formatCameraControlAriaLabel kamera modunu erişilebilir Türkçe formatta sunar', () => {
    assert.equal(formatCameraControlAriaLabel('isometric'), 'Kamera açısı: İzometrik');
    assert.equal(formatCameraControlAriaLabel('topdown'), 'Kamera açısı: Üstten');
    assert.equal(formatCameraControlAriaLabel('follow'), 'Kamera açısı: Takip');
  });

  await t.test('resolveNextCameraMode döngüsel mod geçiş sırasını korur', () => {
    assert.equal(resolveNextCameraMode('isometric'), 'topdown');
    assert.equal(resolveNextCameraMode('topdown'), 'follow');
    assert.equal(resolveNextCameraMode('follow'), 'isometric');
    // @ts-expect-error geçersiz mod koruması
    assert.equal(resolveNextCameraMode('unknown'), 'isometric');
  });
});
