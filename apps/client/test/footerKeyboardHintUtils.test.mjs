import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getSoloKeyboardHintItems,
  getMultiplayerP1Hint,
  getMultiplayerP2Hint,
  formatKeyboardHintAriaLabel,
} from '../src/utils/footerKeyboardHintUtils.ts';

test('footerKeyboardHintUtils — Masaüstü HUD Alt Klavye İpuçları Yardımcıları', async (t) => {
  await t.test('getSoloKeyboardHintItems 3 temel solo tuş takımını döner', () => {
    const items = getSoloKeyboardHintItems();
    assert.equal(items.length, 3);
    assert.deepEqual(items[0], { key: 'WASD', label: 'Eğim' });
    assert.deepEqual(items[1], { key: 'R', label: 'Sıfırla' });
    assert.deepEqual(items[2], { key: 'L', label: 'Gece/Gündüz' });
  });

  await t.test('getMultiplayerP1Hint ve getMultiplayerP2Hint doğru tuş ve etiketleri döner', () => {
    assert.deepEqual(getMultiplayerP1Hint(), { key: 'WASD', label: '1. Bilye' });
    assert.deepEqual(getMultiplayerP2Hint(), { key: 'Oklar', label: '2. Bilye' });
  });

  await t.test('formatKeyboardHintAriaLabel solo modda kapsamlı erişilebilirlik açıklaması üretir', () => {
    const aria = formatKeyboardHintAriaLabel(false);
    assert.equal(
      aria,
      'Klavye kontrolleri: WASD ile eğim ver, R ile sıfırla, L ile tema değiştir',
    );
  });

  await t.test('formatKeyboardHintAriaLabel çok oyunculu modda her iki oyuncu için açıklama üretir', () => {
    const aria = formatKeyboardHintAriaLabel(true, true, true);
    assert.equal(
      aria,
      'Çok oyunculu klavye kontrolleri: 1. Bilye için WASD, 2. Bilye için Ok tuşları',
    );
  });

  await t.test('formatKeyboardHintAriaLabel çok oyunculu tekil slot durumlarını doğru işler', () => {
    assert.equal(
      formatKeyboardHintAriaLabel(true, true, false),
      'Klavye kontrolü: 1. Bilye için WASD',
    );
    assert.equal(
      formatKeyboardHintAriaLabel(true, false, true),
      'Klavye kontrolü: 2. Bilye için Ok tuşları',
    );
    assert.equal(
      formatKeyboardHintAriaLabel(true, false, false),
      'Klavye kontrol ipuçları',
    );
  });
});

