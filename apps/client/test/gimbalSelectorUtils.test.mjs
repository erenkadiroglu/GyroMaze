import test from 'node:test';
import assert from 'node:assert/strict';

import {
  resolveGimbalModeButtonClass,
  resolveSensitivityButtonClass,
  resolveSlotButtonClass,
} from '../src/utils/gimbalSelectorUtils.ts';

test('gimbalSelectorUtils — Gimbal Seçici Buton Yardımcıları', async (t) => {
  await t.test('resolveGimbalModeButtonClass: aktifken bg-brass, pasifken text-muted döner', () => {
    const active = resolveGimbalModeButtonClass(true);
    assert.ok(active.includes('bg-brass text-brass-fg'));

    const inactive = resolveGimbalModeButtonClass(false);
    assert.ok(inactive.includes('text-muted hover:text-fg'));
  });

  await t.test('resolveSensitivityButtonClass: aktifken pirinç stilini uygular', () => {
    const active = resolveSensitivityButtonClass(true);
    assert.ok(active.includes('bg-brass text-brass-fg'));

    const inactive = resolveSensitivityButtonClass(false);
    assert.ok(inactive.includes('text-muted hover:text-fg'));
  });

  await t.test('resolveSlotButtonClass: 1P için pirinç, 2P için warn rengini uygular', () => {
    const p1Active = resolveSlotButtonClass(true, 1);
    assert.ok(p1Active.includes('text-brass ring-1 ring-brass/60'));

    const p2Active = resolveSlotButtonClass(true, 2);
    assert.ok(p2Active.includes('text-warn ring-1 ring-warn/60'));

    const inactive = resolveSlotButtonClass(false, 1);
    assert.ok(inactive.includes('text-muted hover:text-fg'));
  });
});
