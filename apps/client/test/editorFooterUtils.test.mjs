import test from 'node:test';
import assert from 'node:assert/strict';

import {
  resolveCopyButtonState,
  shouldShowImportError,
  formatImportErrorMessage,
} from '../src/utils/editorFooterUtils.ts';

test('editorFooterUtils — Harita Editörü Alt Çubuğu Yardımcıları', async (t) => {
  await t.test('resolveCopyButtonState: json kopyalandı durumunu çözer', () => {
    const idleState = resolveCopyButtonState(null, 'json');
    assert.equal(idleState.isCopied, false);
    assert.equal(idleState.label, 'JSON kopyala');

    const copiedState = resolveCopyButtonState('json', 'json');
    assert.equal(copiedState.isCopied, true);
    assert.equal(copiedState.label, 'JSON kopyalandı');

    const mismatchState = resolveCopyButtonState('link', 'json');
    assert.equal(mismatchState.isCopied, false);
    assert.equal(mismatchState.label, 'JSON kopyala');
  });

  await t.test('resolveCopyButtonState: link kopyalandı durumunu çözer', () => {
    const idleState = resolveCopyButtonState(null, 'link');
    assert.equal(idleState.isCopied, false);
    assert.equal(idleState.label, 'Bağlantı kopyala');

    const copiedState = resolveCopyButtonState('link', 'link');
    assert.equal(copiedState.isCopied, true);
    assert.equal(copiedState.label, 'Bağlantı kopyalandı');

    const mismatchState = resolveCopyButtonState('json', 'link');
    assert.equal(mismatchState.isCopied, false);
    assert.equal(mismatchState.label, 'Bağlantı kopyala');
  });

  await t.test('shouldShowImportError: boş/geçersiz veya geçerli hata metinlerini doğrular', () => {
    assert.equal(shouldShowImportError(null), false);
    assert.equal(shouldShowImportError(undefined), false);
    assert.equal(shouldShowImportError(''), false);
    assert.equal(shouldShowImportError('   '), false);
    assert.equal(shouldShowImportError('Geçersiz harita formatı'), true);
  });

  await t.test('formatImportErrorMessage: hata metnini güvenle kırpar', () => {
    assert.equal(formatImportErrorMessage(null), '');
    assert.equal(formatImportErrorMessage('  Bozuk JSON  '), 'Bozuk JSON');
  });
});
