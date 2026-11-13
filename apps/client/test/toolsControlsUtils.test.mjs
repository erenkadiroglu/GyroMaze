import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getEditorButtonConfig,
  getLeaderboardButtonConfig,
  formatToolButtonAriaLabel,
  getToolsGroupAriaLabel,
} from '../src/utils/toolsControlsUtils.ts';

test('toolsControlsUtils — Masaüstü HUD Araç Çubuğu Araçlar Yardımcıları', async (t) => {
  await t.test('getEditorButtonConfig harita editörü için doğru etiket ve E kısayolunu döner', () => {
    const config = getEditorButtonConfig();
    assert.equal(config.label, 'Harita editörü');
    assert.equal(config.shortcut, 'E');
  });

  await t.test('getLeaderboardButtonConfig skor tablosu için doğru etiket ve K kısayolunu döner', () => {
    const config = getLeaderboardButtonConfig();
    assert.equal(config.label, 'Skor tablosu');
    assert.equal(config.shortcut, 'K');
  });

  await t.test('formatToolButtonAriaLabel kısayol varken ve yokken doğru metin üretir', () => {
    assert.equal(formatToolButtonAriaLabel('Harita editörü', 'E'), 'Harita editörü (E)');
    assert.equal(formatToolButtonAriaLabel('Skor tablosu', 'K'), 'Skor tablosu (K)');
    assert.equal(formatToolButtonAriaLabel('Genel Araç'), 'Genel Araç');
    assert.equal(formatToolButtonAriaLabel('Genel Araç', ''), 'Genel Araç');
  });

  await t.test('getToolsGroupAriaLabel grup rol etiketini döner', () => {
    assert.equal(getToolsGroupAriaLabel(), 'Araçlar');
  });
});

