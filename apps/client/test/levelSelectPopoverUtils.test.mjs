import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getLevelSelectContainerAriaLabel,
  isLevelSelectOpen,
  isPrevLevelDisabled,
  formatLevelSelectTriggerTooltip,
  resolveLevelPopoverAriaExpanded,
} from '../src/utils/levelSelectPopoverUtils.ts';

test('levelSelectPopoverUtils — Bölüm Seçici Popover Yardımcıları', async (t) => {
  await t.test('standart konteyner etiketini döner', () => {
    assert.equal(getLevelSelectContainerAriaLabel(), 'Bölüm Seçici ve İlerleme Menüsü');
  });

  await t.test('isLevelSelectOpen ve resolveLevelPopoverAriaExpanded boolean doğrulaması yapar', () => {
    assert.equal(isLevelSelectOpen(true), true);
    assert.equal(isLevelSelectOpen(false), false);
    assert.equal(isLevelSelectOpen(null), false);
    assert.equal(resolveLevelPopoverAriaExpanded(true), true);
    assert.equal(resolveLevelPopoverAriaExpanded(false), false);
  });

  await t.test('isPrevLevelDisabled seviye 1 için true, seviye 2+ için false döner', () => {
    assert.equal(isPrevLevelDisabled(1, 1), true);
    assert.equal(isPrevLevelDisabled(0, 0), true);
    assert.equal(isPrevLevelDisabled(2, 2), false);
    assert.equal(isPrevLevelDisabled(5, 5), false);
  });

  await t.test('isPrevLevelDisabled özel harita (99) için her zaman false döner', () => {
    assert.equal(isPrevLevelDisabled(1, 99), false);
    assert.equal(isPrevLevelDisabled(0, 99), false);
  });

  await t.test('formatLevelSelectTriggerTooltip yıldızlı ve yıldızsız metinleri doğru formatlar', () => {
    assert.equal(
      formatLevelSelectTriggerTooltip('Neon Başlangıç', 3),
      'Neon Başlangıç — 3 Yıldız',
    );
    assert.equal(
      formatLevelSelectTriggerTooltip('Zorlu Rampa', 0),
      'Zorlu Rampa',
    );
    assert.equal(
      formatLevelSelectTriggerTooltip('', 2),
      'Bölüm — 2 Yıldız',
    );
  });
});

