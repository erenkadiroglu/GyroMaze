import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getNotFoundTitle,
  getNotFoundMessage,
  getNotFoundBackActionText,
  getNotFoundContainerClass,
  getNotFoundButtonClass,
  NOT_FOUND_TITLE,
  NOT_FOUND_MESSAGE,
  NOT_FOUND_BACK_ACTION_TEXT,
  NOT_FOUND_CONTAINER_CLASSES,
  NOT_FOUND_BUTTON_CLASSES,
} from '../src/utils/notFoundViewUtils.ts';

test('notFoundViewUtils — 404 Bulunamadı Sayfası Yardımcıları', async (t) => {
  await t.test('getNotFoundTitle ve mesaj yardımcıları standart 404 içeriğini döner', () => {
    assert.equal(getNotFoundTitle(), NOT_FOUND_TITLE);
    assert.equal(getNotFoundMessage(), NOT_FOUND_MESSAGE);
    assert.equal(getNotFoundBackActionText(), NOT_FOUND_BACK_ACTION_TEXT);
  });

  await t.test('stil yardımcıları beklenen Tailwind sınıflarını döner', () => {
    assert.equal(getNotFoundContainerClass(), NOT_FOUND_CONTAINER_CLASSES);
    assert.equal(getNotFoundButtonClass(), NOT_FOUND_BUTTON_CLASSES);
    assert.ok(getNotFoundContainerClass().includes('min-h-screen'));
    assert.ok(getNotFoundButtonClass().includes('bg-brass'));
  });
});
