import test from 'node:test';
import assert from 'node:assert/strict';
import {
  resolveHapticButtonLabel,
  resolveRoomCodeButtonLabel,
  resolveConnectionAriaLabel,
  resolvePlayerSlotBadgeClasses,
} from '../src/utils/controllerHeaderUtils.ts';

test('controllerHeaderUtils — Mobil Kontrolcü Üst Çubuğu Yardımcıları', async (t) => {
  await t.test('resolveHapticButtonLabel titreşim durumuna göre doğru aria ve title etiketlerini döner', () => {
    assert.deepEqual(resolveHapticButtonLabel(true), {
      ariaLabel: 'Titreşimi kapat',
      title: 'Titreşim açık',
    });
    assert.deepEqual(resolveHapticButtonLabel(false), {
      ariaLabel: 'Titreşimi aç',
      title: 'Titreşim kapalı',
    });
  });

  await t.test('resolveRoomCodeButtonLabel aktif oda koduna göre buton metnini belirler', () => {
    assert.equal(resolveRoomCodeButtonLabel('7R4NET'), 'Kod');
    assert.equal(resolveRoomCodeButtonLabel(''), 'Kod gir');
  });

  await t.test('resolveConnectionAriaLabel bağlantı ve soket durumunu erişilebilir formatlar', () => {
    assert.equal(resolveConnectionAriaLabel(true, true, 8), 'Bağlantı durumu: Bağlı (8ms)');
    assert.equal(resolveConnectionAriaLabel(false, true, 0), 'Bağlantı durumu: Hazır');
    assert.equal(resolveConnectionAriaLabel(false, false, 0), 'Bağlantı durumu: Kopuk');
  });

  await t.test('resolvePlayerSlotBadgeClasses P1 ve P2 yuvalarına göre doğru renk sınıflarını döner', () => {
    assert.match(resolvePlayerSlotBadgeClasses(1), /text-brass/);
    assert.match(resolvePlayerSlotBadgeClasses(2), /text-warn/);
  });
});
