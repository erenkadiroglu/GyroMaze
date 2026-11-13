import test from 'node:test';
import assert from 'node:assert/strict';
import {
  UTIL_CATEGORIES,
  categorizeUtilFileName,
  getUtilStatsByCategory,
  filterUtilsByCategory,
} from '../src/utils/utilRegistryUtils.ts';

test('utilRegistryUtils — İstemci Yardımcı Motorları Katalog ve Kategori Yönetimi', async (t) => {
  await t.test('UTIL_CATEGORIES 5 standart kategoriyi içerir', () => {
    assert.equal(UTIL_CATEGORIES.length, 5);
    assert.deepEqual([...UTIL_CATEGORIES], [
      'controller',
      'desktop',
      'editor',
      'gameplay',
      'scene',
    ]);
  });

  await t.test('categorizeUtilFileName kontrolcü yardımcılarını doğru sınıflandırır', () => {
    assert.equal(categorizeUtilFileName('controllerUtils.ts'), 'controller');
    assert.equal(categorizeUtilFileName('gimbalPadUtils.ts'), 'controller');
    assert.equal(categorizeUtilFileName('roomCardUtils.ts'), 'controller');
    assert.equal(categorizeUtilFileName('sensorCardUtils.ts'), 'controller');
  });

  await t.test('categorizeUtilFileName editör yardımcılarını doğru sınıflandırır', () => {
    assert.equal(categorizeUtilFileName('editorCompiler.ts'), 'editor');
    assert.equal(categorizeUtilFileName('customMapCodec.ts'), 'editor');
    assert.equal(categorizeUtilFileName('editorToolbarUtils.ts'), 'editor');
  });

  await t.test('categorizeUtilFileName sahne ve ses yardımcılarını doğru sınıflandırır', () => {
    assert.equal(categorizeUtilFileName('sceneActorUtils.ts'), 'scene');
    assert.equal(categorizeUtilFileName('stageLoopUtils.ts'), 'scene');
    assert.equal(categorizeUtilFileName('soundEngine.ts'), 'scene');
    assert.equal(categorizeUtilFileName('wallUtils.ts'), 'scene');
  });

  await t.test('categorizeUtilFileName oyun ve liderlik yardımcılarını doğru sınıflandırır', () => {
    assert.equal(categorizeUtilFileName('leaderboardUtils.ts'), 'gameplay');
    assert.equal(categorizeUtilFileName('levelProgressUtils.ts'), 'gameplay');
    assert.equal(categorizeUtilFileName('victoryModalUtils.ts'), 'gameplay');
    assert.equal(categorizeUtilFileName('collectiblesUtils.ts'), 'gameplay');
  });

  await t.test('categorizeUtilFileName masaüstü HUD ve ayar yardımcılarını doğru sınıflandırır', () => {
    assert.equal(categorizeUtilFileName('desktopHudUtils.ts'), 'desktop');
    assert.equal(categorizeUtilFileName('hudUtils.ts'), 'desktop');
    assert.equal(categorizeUtilFileName('settingsUtils.ts'), 'desktop');
    assert.equal(categorizeUtilFileName('radarUtils.ts'), 'desktop');
  });

  await t.test('getUtilStatsByCategory ve filterUtilsByCategory listeyi gruplar ve filtreler', () => {
    const sampleFiles = [
      'controllerUtils.ts',
      'gimbalPadUtils.ts',
      'editorCompiler.ts',
      'sceneActorUtils.ts',
      'leaderboardUtils.ts',
      'hudUtils.ts',
    ];

    const stats = getUtilStatsByCategory(sampleFiles);
    assert.equal(stats.controller, 2);
    assert.equal(stats.editor, 1);
    assert.equal(stats.scene, 1);
    assert.equal(stats.gameplay, 1);
    assert.equal(stats.desktop, 1);

    const controllerOnly = filterUtilsByCategory(sampleFiles, 'controller');
    assert.deepEqual(controllerOnly, ['controllerUtils.ts', 'gimbalPadUtils.ts']);
  });
});

