import test from 'node:test';
import assert from 'node:assert/strict';
import {
  resolveBoardBaseConfig,
  resolveGridHelperConfig,
  resolveBallSpawnPosition,
} from '../src/utils/stageUtils.ts';
import { BALL_RADIUS } from '../src/components/scene/sceneMaterials.ts';

test('stageUtils — 3B Sahne Sahne Geometrisi ve Fizik Başlangıç Yardımcıları', async (t) => {
  await t.test('resolveBoardBaseConfig tahta boyutuna göre doğru kutu boyutlarını döner', () => {
    const config12 = resolveBoardBaseConfig(12);
    assert.deepEqual(config12.position, [0, -0.25, 0]);
    assert.deepEqual(config12.boxArgs, [12, 0.5, 12]);

    const fallback = resolveBoardBaseConfig(0);
    assert.deepEqual(fallback.boxArgs, [12, 0.5, 12]);
  });

  await t.test('resolveGridHelperConfig aydınlık ve karanlık mod renklerini çözer', () => {
    const light = resolveGridHelperConfig(12, true);
    assert.equal(light.key, 'grid-light');
    assert.equal(light.colorCenterLine, '#cbd5e1');
    assert.equal(light.colorGrid, '#e2e8f0');
    assert.equal(light.size, 11.6);

    const dark = resolveGridHelperConfig(12, false);
    assert.equal(dark.key, 'grid-dark');
    assert.equal(dark.colorCenterLine, '#27272a');
    assert.equal(dark.colorGrid, '#27272a');
  });

  await t.test('resolveBallSpawnPosition P1 ve P2 ofsetlerini doğru hesaplar', () => {
    const p1 = resolveBallSpawnPosition([-4, 0, -4]);
    assert.deepEqual(p1.position, [-4, BALL_RADIUS, -4]);

    const p2 = resolveBallSpawnPosition([-4, 0, -4], [0.8, 0.4]);
    assert.deepEqual(p2.position, [-3.2, BALL_RADIUS, -3.6]);
  });
});

