import test from 'node:test';
import assert from 'node:assert/strict';

import {
  resolveGoalPortalVisuals,
  isCrystalVisible,
  resolveStartRingPosition,
} from '../src/utils/collectiblesUtils.ts';

test('collectiblesUtils — 3B Sahne Toplanabilirler ve Geçit Yardımcıları', async (t) => {
  await t.test('resolveGoalPortalVisuals: acik durumda yesil/zumrut isik ve acik materyaller doner', () => {
    const visuals = resolveGoalPortalVisuals(true);
    assert.equal(visuals.lightColor, '#10b981');
    assert.equal(visuals.lightIntensity, 3.0);
    assert.equal(visuals.lightDistance, 4.2);
    assert.ok(visuals.ringMaterial);
    assert.ok(visuals.coreMaterial);
  });

  await t.test('resolveGoalPortalVisuals: kilitli durumda kehribar/sari isik ve kilitli materyaller doner', () => {
    const visuals = resolveGoalPortalVisuals(false);
    assert.equal(visuals.lightColor, '#f59e0b');
    assert.equal(visuals.lightIntensity, 3.0);
    assert.equal(visuals.lightDistance, 4.2);
    assert.ok(visuals.ringMaterial);
    assert.ok(visuals.coreMaterial);
  });

  await t.test('isCrystalVisible: toplanmis indeksler icin false, toplanmamis icin true doner', () => {
    const collected = [0, 2];
    assert.equal(isCrystalVisible(0, collected), false);
    assert.equal(isCrystalVisible(1, collected), true);
    assert.equal(isCrystalVisible(2, collected), false);
    assert.equal(isCrystalVisible(3, collected), true);
  });

  await t.test('resolveStartRingPosition: y eksenini tahta tabanindan biraz yukariya (0.02) offsetler', () => {
    const pos = resolveStartRingPosition([4.5, 0, -3.2]);
    assert.deepEqual(pos, [4.5, 0.02, -3.2]);
  });
});
