import test from 'node:test';
import assert from 'node:assert/strict';

import {
  FOCUSABLE_ELEMENTS_SELECTOR,
  isEscapeKey,
  isTabKey,
  resolveNextFocusElement,
} from '../src/utils/dialogBehaviorUtils.ts';

test('dialogBehaviorUtils — Dialog Odak Tuzağı ve Klavye Yardımcıları', async (t) => {
  await t.test('FOCUSABLE_ELEMENTS_SELECTOR standart odaklanabilir etiketleri içerir', () => {
    assert.ok(FOCUSABLE_ELEMENTS_SELECTOR.includes('button:not([disabled])'));
    assert.ok(FOCUSABLE_ELEMENTS_SELECTOR.includes('[href]'));
    assert.ok(FOCUSABLE_ELEMENTS_SELECTOR.includes('input:not([disabled])'));
  });

  await t.test('isEscapeKey ve isTabKey tuş eşleşmesini doğrular', () => {
    assert.equal(isEscapeKey('Escape'), true);
    assert.equal(isEscapeKey('Enter'), false);
    assert.equal(isTabKey('Tab'), true);
    assert.equal(isTabKey('Space'), false);
  });

  await t.test('resolveNextFocusElement: boş listede null döner', () => {
    assert.equal(resolveNextFocusElement([], null, false, null), null);
  });

  await t.test('resolveNextFocusElement: Tab tuşuyla döngüsel ilk öğeye yönlendirir', () => {
    const el1 = { id: 'el1' };
    const el2 = { id: 'el2' };
    const container = {
      contains: (el) => el === el1 || el === el2,
    };
    const focusables = [el1, el2];

    // Son öğedeyken Tab basılırsa ilk öğeye dönmeli
    // @ts-expect-error mock html element
    const next = resolveNextFocusElement(focusables, el2, false, container);
    assert.equal(next, el1);

    // Kapsayıcı dışındayken Tab basılırsa ilk öğeye odaklanmalı
    // @ts-expect-error mock html element
    const outsideNext = resolveNextFocusElement(focusables, null, false, container);
    assert.equal(outsideNext, el1);
  });

  await t.test('resolveNextFocusElement: Shift+Tab tuşuyla döngüsel son öğeye yönlendirir', () => {
    const el1 = { id: 'el1' };
    const el2 = { id: 'el2' };
    const container = {
      contains: (el) => el === el1 || el === el2,
    };
    const focusables = [el1, el2];

    // İlk öğedeyken Shift+Tab basılırsa son öğeye dönmeli
    // @ts-expect-error mock html element
    const prev = resolveNextFocusElement(focusables, el1, true, container);
    assert.equal(prev, el2);
  });
});
