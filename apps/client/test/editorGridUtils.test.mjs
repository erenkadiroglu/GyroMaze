import test from 'node:test';
import assert from 'node:assert/strict';

import {
  calculateNextGridCoords,
  formatCellAriaLabel,
  resolveGridCellClass,
} from '../src/utils/editorGridUtils.ts';
import { TOOL_BY_ID } from '../src/utils/editorToolbarUtils.ts';

test('editorGridUtils — Harita Editörü 8x8 Izgara Gezinim ve Hücre Yardımcıları', async (t) => {
  await t.test('calculateNextGridCoords: ok tuşlarıyla sınır aşımı yapmadan ilerler', () => {
    // Sağ ok
    const right = calculateNextGridCoords('ArrowRight', 0, 0, 8);
    assert.deepEqual(right, { nextR: 0, nextC: 1, handled: true });

    // Sağ sınırda sağ ok
    const rightMax = calculateNextGridCoords('ArrowRight', 0, 7, 8);
    assert.deepEqual(rightMax, { nextR: 0, nextC: 7, handled: true });

    // Sol ok
    const left = calculateNextGridCoords('ArrowLeft', 0, 3, 8);
    assert.deepEqual(left, { nextR: 0, nextC: 2, handled: true });

    // Aşağı ok
    const down = calculateNextGridCoords('ArrowDown', 2, 2, 8);
    assert.deepEqual(down, { nextR: 3, nextC: 2, handled: true });

    // Yukarı ok
    const up = calculateNextGridCoords('ArrowUp', 2, 2, 8);
    assert.deepEqual(up, { nextR: 1, nextC: 2, handled: true });

    // Home ve End
    const home = calculateNextGridCoords('Home', 3, 5, 8);
    assert.deepEqual(home, { nextR: 3, nextC: 0, handled: true });

    const end = calculateNextGridCoords('End', 3, 5, 8);
    assert.deepEqual(end, { nextR: 3, nextC: 7, handled: true });

    // Bilinmeyen tuş
    const unhandled = calculateNextGridCoords('Space', 3, 5, 8);
    assert.deepEqual(unhandled, { nextR: 3, nextC: 5, handled: false });
  });

  await t.test('formatCellAriaLabel: 1 tabanlı satır/sütun ve araç etiketi üretir', () => {
    const label = formatCellAriaLabel(0, 0, 'Duvar');
    assert.equal(label, 'Hücre Satır 1, Sütun 1: Duvar');

    const label2 = formatCellAriaLabel(7, 7, 'Hedef');
    assert.equal(label2, 'Hücre Satır 8, Sütun 8: Hedef');
  });

  await t.test('resolveGridCellClass: silgi için nötr zemin, diğer araçlar için cellClass döner', () => {
    const eraseClass = resolveGridCellClass(TOOL_BY_ID.erase, true);
    assert.ok(eraseClass.includes('border-line/60 bg-surface'));

    const wallClass = resolveGridCellClass(TOOL_BY_ID.wall, false);
    assert.ok(wallClass.includes(TOOL_BY_ID.wall.cellClass));
  });
});
