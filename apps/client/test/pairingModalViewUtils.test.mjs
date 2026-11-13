import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getPairingModalTitle,
  getPairingModalDescription,
  getPairingProceedLabel,
  resolveCopyIconState,
  formatPairingModalAriaLabel,
} from '../src/utils/pairingModalViewUtils.ts';

test('pairingModalViewUtils — Masaüstü Eşleştirme Modalı Yardımcıları', async (t) => {
  await t.test('getPairingModalTitle, getPairingModalDescription ve getPairingProceedLabel metinleri döner', () => {
    assert.equal(getPairingModalTitle(), 'Telefonunu bağla');
    assert.equal(
      getPairingModalDescription(),
      'QR kodu okut veya 6 haneli oda kodunu kontrolcüye gir.',
    );
    assert.equal(getPairingProceedLabel(), 'Sahneye geç');
  });

  await t.test('resolveCopyIconState kopyalandı ve bekleme durumunda doğru ikon ve sınıf döner', () => {
    const copied = resolveCopyIconState(true);
    assert.equal(copied.iconName, 'check');
    assert.match(copied.iconClass, /text-ok/);

    const idle = resolveCopyIconState(false);
    assert.equal(idle.iconName, 'copy');
    assert.doesNotMatch(idle.iconClass, /text-ok/);
  });

  await t.test('formatPairingModalAriaLabel oda kodu ve slot ile doğru formatlar', () => {
    assert.equal(
      formatPairingModalAriaLabel('ABCDEF', 1),
      'Oda ABCDEF, 1. Oyuncu için telefon bağlama modalı',
    );
    assert.equal(
      formatPairingModalAriaLabel('XYZ123', 2),
      'Oda XYZ123, 2. Oyuncu için telefon bağlama modalı',
    );
    assert.equal(
      formatPairingModalAriaLabel('XYZ123', null),
      'Oda XYZ123 için telefon bağlama modalı',
    );
    assert.equal(
      formatPairingModalAriaLabel(''),
      'Oda ...... için telefon bağlama modalı',
    );
  });
});

