import test from 'node:test';
import assert from 'node:assert/strict';

import {
  resolveWallKey,
  formatWallGeometryArgs,
  calculateWallVolume,
} from '../src/utils/wallUtils.ts';

test('wallUtils — 3B Duvar Geometri ve Anahtar Yardımcıları', async (t) => {
  await t.test('resolveWallKey: ic ve dis duvarlar icin tutarli anahtar formatlar', () => {
    assert.equal(resolveWallKey('outer', 'rev-1', 0), 'vis-outer-rev-1-0');
    assert.equal(resolveWallKey('inner', 'rev-2', 4), 'vis-inner-rev-2-4');
  });

  await t.test('formatWallGeometryArgs: boyutlari dogrular ve minimum sinirlari uygular', () => {
    assert.deepEqual(formatWallGeometryArgs([12.4, 0.85, 0.4]), [12.4, 0.85, 0.4]);
    assert.deepEqual(formatWallGeometryArgs([0, -1, 0.5]), [0.01, 0.01, 0.5]);
  });

  await t.test('calculateWallVolume: duvarin uc boyutlu hacmini hesaplar', () => {
    const vol = calculateWallVolume([2, 3, 4]);
    assert.equal(vol, 24);

    const fractional = calculateWallVolume([1.2, 0.5, 2.0]);
    assert.equal(fractional, 1.2);
  });
});
