import test from 'node:test';
import assert from 'node:assert/strict';
import {
  resolveCenterStageMode,
  handleSlotSelection,
} from '../src/utils/controllerOrchestrationUtils.ts';

test('controllerOrchestrationUtils — Mobil Kontrolcü Sahne Modu ve Yuva Seçim Kuralları', async (t) => {
  await t.test('resolveCenterStageMode oda kodu yokken veya düzenleme açıkken room modunu seçer', () => {
    assert.equal(resolveCenterStageMode('', false, false), 'room');
    assert.equal(resolveCenterStageMode('', false, true), 'room');
    assert.equal(resolveCenterStageMode('ROOM12', true, false), 'room');
    assert.equal(resolveCenterStageMode('ROOM12', true, true), 'room');
  });

  await t.test('resolveCenterStageMode oda kodu varken ve gimbal yüzeyi kapalıyken sensor modunu seçer', () => {
    assert.equal(resolveCenterStageMode('ROOM12', false, false), 'sensor');
  });

  await t.test('resolveCenterStageMode oda kodu varken ve gimbal yüzeyi açıkken gimbal modunu seçer', () => {
    assert.equal(resolveCenterStageMode('ROOM12', false, true), 'gimbal');
  });

  await t.test('handleSlotSelection farklı yuvaya geçişte changed: true, aynı yuvada changed: false döner', () => {
    assert.deepEqual(handleSlotSelection(1, 2), { changed: true, nextSlot: 2 });
    assert.deepEqual(handleSlotSelection(2, 1), { changed: true, nextSlot: 1 });
    assert.deepEqual(handleSlotSelection(1, 1), { changed: false, nextSlot: 1 });
    assert.deepEqual(handleSlotSelection(2, 2), { changed: false, nextSlot: 2 });
  });
});
