import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getHelpModalTitle,
  getHelpModalDescription,
  getHelpModalDismissLabel,
  getHelpModalFooterTip,
  formatShortcutBadgeAria,
} from '../src/utils/helpModalUtils.ts';

test('helpModalUtils — Masaüstü Klavye ve Yardım Modalı Yardımcıları', async (t) => {
  await t.test('getHelpModalTitle, getHelpModalDescription ve buton etiketlerini döner', () => {
    assert.equal(getHelpModalTitle(), 'Klavye Kısayolları ve Kontrol Rehberi');
    assert.equal(
      getHelpModalDescription(),
      'GyroMaze masaüstü kontrolleri, kamera modları ve mobil eşleştirme rehberi.',
    );
    assert.equal(getHelpModalDismissLabel(), 'Anladım');
  });

  await t.test('getHelpModalFooterTip beklenen H ve ? ipucu metnini içerir', () => {
    const tip = getHelpModalFooterTip();
    assert.match(tip, /H veya \?/);
    assert.match(tip, /İpucu/);
  });

  await t.test('formatShortcutBadgeAria tuş kombinasyonunu ve açıklamayı doğru bağlar', () => {
    assert.equal(
      formatShortcutBadgeAria(['W', 'A', 'S', 'D'], 'Bilyeyi yönlendir'),
      'W veya A veya S veya D kısayolu: Bilyeyi yönlendir',
    );
    assert.equal(
      formatShortcutBadgeAria(['H', '?'], 'Yardımı aç'),
      'H veya ? kısayolu: Yardımı aç',
    );
  });

  await t.test('formatShortcutBadgeAria boş listelerde varsayılan metinleri kullanır', () => {
    assert.equal(
      formatShortcutBadgeAria([], 'Bir eylem'),
      'Belirtilmemiş tuş kısayolu: Bir eylem',
    );
    assert.equal(
      formatShortcutBadgeAria(['Space'], ''),
      'Space kısayolu: Açıklama yok',
    );
  });
});

