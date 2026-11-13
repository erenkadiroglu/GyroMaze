import test from 'node:test';
import assert from 'node:assert/strict';

import {
  TOOLS,
  TOOL_BY_ID,
  getToolDefinition,
  isToolActive,
  resolveToolButtonClass,
} from '../src/utils/editorToolbarUtils.ts';

test('editorToolbarUtils — Harita Editörü Araç Paleti Tanımları ve Yardımcıları', async (t) => {
  await t.test('TOOLS listesi tam 10 aracı eksiksiz içerir', () => {
    assert.equal(TOOLS.length, 10);
    const expectedIds = [
      'wall',
      'hole',
      'crystal',
      'laser',
      'boost',
      'moving',
      'portal',
      'start',
      'goal',
      'erase',
    ];
    assert.deepEqual(TOOLS.map((t) => t.id), expectedIds);
  });

  await t.test('TOOL_BY_ID tum araclari id uzerinden erisilebilir kilar', () => {
    assert.equal(TOOL_BY_ID.wall.label, 'Duvar');
    assert.equal(TOOL_BY_ID.hole.label, 'Delik');
    assert.equal(TOOL_BY_ID.crystal.label, 'Kristal');
    assert.equal(TOOL_BY_ID.laser.label, 'Lazer');
    assert.equal(TOOL_BY_ID.boost.label, 'Hız rampası');
    assert.equal(TOOL_BY_ID.moving.label, 'Devriye engel');
    assert.equal(TOOL_BY_ID.portal.label, 'Portal (çift)');
    assert.equal(TOOL_BY_ID.start.label, 'Başlangıç');
    assert.equal(TOOL_BY_ID.goal.label, 'Hedef');
    assert.equal(TOOL_BY_ID.erase.label, 'Silgi');
  });

  await t.test('getToolDefinition: gecerli id icin araci, gecersiz icin duvar tanimini doner', () => {
    assert.equal(getToolDefinition('crystal').id, 'crystal');
    // @ts-expect-error test gecersiz id fallback
    assert.equal(getToolDefinition('non-existent').id, 'wall');
  });

  await t.test('isToolActive: aktif arac eslesmesini dogrular', () => {
    assert.equal(isToolActive('wall', 'wall'), true);
    assert.equal(isToolActive('wall', 'hole'), false);
    assert.equal(isToolActive('portal', 'portal'), true);
  });

  await t.test('resolveToolButtonClass: aktifken activeClass, pasifken muted siniflarini ekler', () => {
    const wallTool = TOOL_BY_ID.wall;
    const activeClass = resolveToolButtonClass(wallTool, true);
    assert.ok(activeClass.includes(wallTool.activeClass));

    const inactiveClass = resolveToolButtonClass(wallTool, false);
    assert.ok(inactiveClass.includes('text-muted'));
  });
});
