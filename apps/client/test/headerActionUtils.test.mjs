import test from 'node:test';
import assert from 'node:assert/strict';
import {
  resolvePairingButtonVariant,
  formatPairingButtonRoomCode,
  resolvePairingBadgeClass,
  formatPairingButtonAriaLabel,
} from '../src/utils/headerActionUtils.ts';

test('headerActionUtils — Masaüstü HUD Üst Eylem Butonları Yardımcıları', async (t) => {
  await t.test('resolvePairingButtonVariant eşleşme durumuna göre secondary veya primary döner', () => {
    assert.equal(resolvePairingButtonVariant(true), 'secondary');
    assert.equal(resolvePairingButtonVariant(false), 'primary');
  });

  await t.test('formatPairingButtonRoomCode boş veya geçersiz değerlerde yer tutucu döner', () => {
    assert.equal(formatPairingButtonRoomCode('6K8NET'), '6K8NET');
    assert.equal(formatPairingButtonRoomCode(''), '......');
    assert.equal(formatPairingButtonRoomCode(null), '......');
    assert.equal(formatPairingButtonRoomCode(undefined), '......');
  });

  await t.test('resolvePairingBadgeClass gecikme durumunda yeşil text-ok sınıfı içerir', () => {
    assert.match(resolvePairingBadgeClass(true), /text-ok/);
    assert.doesNotMatch(resolvePairingBadgeClass(false), /text-ok/);
  });

  await t.test('formatPairingButtonAriaLabel oda kodunu ve durum metnini doğru formatlar', () => {
    assert.equal(
      formatPairingButtonAriaLabel('7R4NET', '12ms'),
      'Oda kodu 7R4NET, durum: 12ms',
    );
    assert.equal(
      formatPairingButtonAriaLabel(null, 'Bağlan'),
      'Oda kodu ......, durum: Bağlan',
    );
  });
});
