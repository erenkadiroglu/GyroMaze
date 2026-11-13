import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getViewportResetConfig,
  getViewportCameraShortcut,
  getViewportThemeShortcut,
  getViewportSoundShortcut,
  isLightTheme,
  getViewportThemeIconName,
  getViewportSoundIconConfig,
} from '../src/utils/viewportAudioUtils.ts';

test('viewportAudioUtils — Masaüstü HUD Araç Çubuğu Görünüm ve Ses Yardımcıları', async (t) => {
  await t.test('getViewportResetConfig varsayılan etiket ve kısayol bilgisini döner', () => {
    const config = getViewportResetConfig();
    assert.equal(config.label, 'Topu başa al');
    assert.equal(config.shortcut, 'R');
  });

  await t.test('kısayol yardımcıları beklenen klavye harflerini döner', () => {
    assert.equal(getViewportCameraShortcut(), 'C');
    assert.equal(getViewportThemeShortcut(), 'L');
    assert.equal(getViewportSoundShortcut(), 'M');
  });

  await t.test('isLightTheme ve getViewportThemeIconName açık/koyu mod mantığını doğru işler', () => {
    assert.equal(isLightTheme('light'), true);
    assert.equal(isLightTheme('dark'), false);

    assert.equal(getViewportThemeIconName('light'), 'sun');
    assert.equal(getViewportThemeIconName('dark'), 'moon');
  });

  await t.test('getViewportSoundIconConfig sessiz modda tehlike stili ve doğru durumu döner', () => {
    const mutedConfig = getViewportSoundIconConfig(true);
    assert.equal(mutedConfig.isMuted, true);
    assert.match(mutedConfig.iconClassName, /text-danger/);

    const activeConfig = getViewportSoundIconConfig(false);
    assert.equal(activeConfig.isMuted, false);
    assert.doesNotMatch(activeConfig.iconClassName, /text-danger/);
  });
});

