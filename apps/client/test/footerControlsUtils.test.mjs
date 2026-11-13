import test from 'node:test';
import assert from 'node:assert/strict';
import {
  shouldShowKeyboardHints,
  resolveMultiplayerSlotHints,
} from '../src/utils/footerControlsUtils.ts';

test('footerControlsUtils — Alt Panel Klavye İpuçları ve Kontrolcü Görünürlük Kuralları', async (t) => {
  await t.test('shouldShowKeyboardHints tek oyunculu modda yalnızca kontrolcü bağlı değilse gösterir', () => {
    assert.equal(shouldShowKeyboardHints(false, false, false), true);
    assert.equal(shouldShowKeyboardHints(true, false, false), false);
    assert.equal(shouldShowKeyboardHints(true, false, true), false);
  });

  await t.test('shouldShowKeyboardHints çok oyunculu modda herhangi bir kontrolcü eksikse gösterir', () => {
    // 1P yok, 2P yok -> göster
    assert.equal(shouldShowKeyboardHints(false, true, false), true);
    // 1P var, 2P yok -> göster
    assert.equal(shouldShowKeyboardHints(true, true, false), true);
    // 1P yok, 2P var -> göster
    assert.equal(shouldShowKeyboardHints(false, true, true), true);
    // İkisi de bağlı -> gizle
    assert.equal(shouldShowKeyboardHints(true, true, true), false);
  });

  await t.test('resolveMultiplayerSlotHints yuva eşleşme durumuna göre doğru ipuçlarını ve ayırıcıyı üretir', () => {
    // İki kontrolcü de bağlı değil -> ikisi de gösterilir ve ayırıcı vardır
    const bothMissing = resolveMultiplayerSlotHints(false, false);
    assert.deepEqual(bothMissing, { showP1: true, showP2: true, showSeparator: true });

    // 1P bağlı, 2P bağlı değil -> yalnız 2P gösterilir, ayırıcı yoktur
    const p1Connected = resolveMultiplayerSlotHints(true, false);
    assert.deepEqual(p1Connected, { showP1: false, showP2: true, showSeparator: false });

    // 1P bağlı değil, 2P bağlı -> yalnız 1P gösterilir, ayırıcı yoktur
    const p2Connected = resolveMultiplayerSlotHints(false, true);
    assert.deepEqual(p2Connected, { showP1: true, showP2: false, showSeparator: false });

    // İkisi de bağlı
    const bothConnected = resolveMultiplayerSlotHints(true, true);
    assert.deepEqual(bothConnected, { showP1: false, showP2: false, showSeparator: false });
  });
});
