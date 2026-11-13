import test from 'node:test';
import assert from 'node:assert/strict';
import {
  resolveGimbalInstructionText,
  shouldShowPairingStatus,
  shouldShowSensorTimeoutStatus,
  resolveGimbalDotClasses,
  SENSITIVITY_OPTIONS,
  PLAYER_SLOT_OPTIONS,
} from '../src/utils/gimbalPadUtils.ts';

test('gimbalPadUtils — Mobil Gimbal Pad Arayüzü ve Radyo Seçenekleri Kuralları', async (t) => {
  await t.test('resolveGimbalInstructionText dokunmatik modda ve jiroskop modunda doğru yönergeyi döner', () => {
    assert.equal(
      resolveGimbalInstructionText(true),
      'Dairedeki küreyi parmağınla sürükleyerek yönlendir',
    );
    assert.equal(
      resolveGimbalInstructionText(false),
      'Telefonu eğ veya dairedeki küreyi parmağınla sürükle',
    );
  });

  await t.test('shouldShowPairingStatus eşleşme yokken ve hata mesajı yokken true döner', () => {
    assert.equal(shouldShowPairingStatus(false, null), true);
    assert.equal(shouldShowPairingStatus(false, 'Hata'), false);
    assert.equal(shouldShowPairingStatus(true, null), false);
  });

  await t.test('shouldShowSensorTimeoutStatus yalnız donanım sinyali zaman aşımına uğradığında ve dokunmatik açık değilken true döner', () => {
    assert.equal(shouldShowSensorTimeoutStatus(true, false, false), true);
    assert.equal(shouldShowSensorTimeoutStatus(true, true, false), false);
    assert.equal(shouldShowSensorTimeoutStatus(true, false, true), false);
    assert.equal(shouldShowSensorTimeoutStatus(false, false, false), false);
  });

  await t.test('resolveGimbalDotClasses 1. oyuncu için brass, 2. oyuncu için warn renk sınıflarını döner', () => {
    const p1 = resolveGimbalDotClasses(1);
    assert.match(p1.dotOuterClass, /border-brass/);
    assert.match(p1.dotInnerClass, /bg-brass/);

    const p2 = resolveGimbalDotClasses(2);
    assert.match(p2.dotOuterClass, /border-warn/);
    assert.match(p2.dotInnerClass, /bg-warn/);
  });

  await t.test('SENSITIVITY_OPTIONS ve PLAYER_SLOT_OPTIONS standart seçenekleri içerir', () => {
    assert.equal(SENSITIVITY_OPTIONS.length, 3);
    assert.deepEqual(SENSITIVITY_OPTIONS.map((o) => o.mult), [0.75, 1, 1.35]);
    assert.equal(PLAYER_SLOT_OPTIONS.length, 2);
    assert.deepEqual(PLAYER_SLOT_OPTIONS.map((o) => o.slot), [1, 2]);
  });
});

