import test from 'node:test';
import assert from 'node:assert/strict';

import {
  isLightBoardTheme,
  calculateBallVelocitySpeed,
  shouldTriggerWallSound,
} from '../src/utils/stageOrchestrationUtils.ts';

test('stageOrchestrationUtils — 3B Sahne Orkestrasyon ve Çarpışma Yardımcıları', async (t) => {
  await t.test('isLightBoardTheme: light sema veya daylight tema durumlarinda true doner', () => {
    assert.equal(isLightBoardTheme('light', 'classic'), true);
    assert.equal(isLightBoardTheme('dark', 'daylight'), true);
    assert.equal(isLightBoardTheme('dark', 'neon'), false);
    assert.equal(isLightBoardTheme('dark', 'cyberpunk'), false);
  });

  await t.test('calculateBallVelocitySpeed: XZ eksenlerinde vektor buyuklugu (hipotenus) hesaplar', () => {
    const speed = calculateBallVelocitySpeed({ x: 3, z: 4 });
    assert.equal(speed, 5);

    const speedZero = calculateBallVelocitySpeed({ x: 0, z: 0 });
    assert.equal(speedZero, 0);
  });

  await t.test('shouldTriggerWallSound: zaman asimi ve min hiz esiklerini dogrular', () => {
    // 1. Hiz yetersiz (< 0.45)
    assert.equal(shouldTriggerWallSound(1000, 500, 0.2), false);

    // 2. Throttle suresi dolmamis (< 80ms)
    assert.equal(shouldTriggerWallSound(1050, 1000, 2.5), false);

    // 3. Gecerli: hem hiz yeterli hem de 80ms'den fazla gecmis
    assert.equal(shouldTriggerWallSound(1200, 1000, 2.5), true);
  });
});

