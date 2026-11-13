import test from 'node:test';
import assert from 'node:assert/strict';
import {
  resolveVoidHoleRadii,
  resolveBoostPadTransform,
  resolveLaserGatePillars,
  flattenTeleporterPortals,
} from '../src/utils/hazardUtils.ts';

test('hazardUtils — 3B Sahne Tehlikeler ve Kinetik Alan Yardımcıları', async (t) => {
  await t.test('resolveVoidHoleRadii varsayılan ve özel yarıçapları doğru hesaplar', () => {
    const defaultR = resolveVoidHoleRadii({ position: [0, 0] });
    assert.equal(defaultR.r, 0.42);
    assert.ok(Math.abs(defaultR.innerRing - 0.42 * 0.82) < 0.001);
    assert.ok(Math.abs(defaultR.outerRing - 0.42 * 1.08) < 0.001);

    const customR = resolveVoidHoleRadii({ position: [2, 3], radius: 0.6 });
    assert.equal(customR.r, 0.6);
  });

  await t.test('resolveBoostPadTransform yön rotasyonunu ve konumunu döner', () => {
    const pad = { position: [1.5, -2.5], direction: 'right' };
    const res = resolveBoostPadTransform(pad);
    assert.deepEqual(res.position, [1.5, 0.02, -2.5]);
    assert.equal(res.rotation[0], 0);
    assert.equal(res.rotation[2], 0);
    assert.ok(typeof res.rotation[1] === 'number');
  });

  await t.test('resolveLaserGatePillars sütun ve ışın pozisyonlarını eksiksiz üretir', () => {
    const gate = {
      position: [0, 0],
      axis: 'x',
      length: 2,
      interval: 3,
      duration: 1.5,
    };
    const res = resolveLaserGatePillars(gate);
    assert.deepEqual(res.beamPosition, [0, 0.35, 0]);
    assert.equal(res.p1.length, 3);
    assert.equal(res.p2.length, 3);
    assert.equal(res.beamSize.length, 3);
  });

  await t.test('flattenTeleporterPortals tüm giriş ve çıkış portallarını listeler', () => {
    const teleporters = [
      {
        entry: [-2, -2],
        exit: [2, 2],
      },
    ];
    const list = flattenTeleporterPortals(teleporters, 'rev1');
    assert.equal(list.length, 2);
    assert.equal(list[0].key, 'teleporter-rev1-0-0');
    assert.deepEqual(list[0].position, [-2, 0.025, -2]);
    assert.equal(list[1].key, 'teleporter-rev1-0-1');
    assert.deepEqual(list[1].position, [2, 0.025, 2]);

    const empty = flattenTeleporterPortals([], 'rev1');
    assert.equal(empty.length, 0);
  });
});
