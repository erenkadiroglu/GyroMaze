import test from 'node:test';
import assert from 'node:assert/strict';
import {
  validateRoomCodeInput,
  shouldShowCloseButton,
  formatRecentRoomAriaLabel,
  isSubmitDisabled,
} from '../src/utils/roomCardUtils.ts';

test('roomCardUtils — Mobil Oda Kartı Giriş ve Doğrulama Kuralları', async (t) => {
  await t.test('validateRoomCodeInput boş girişte hata döner', () => {
    const res = validateRoomCodeInput('');
    assert.equal(res.isValid, false);
    assert.equal(res.error, 'Lütfen 6 haneli oda kodunu girin.');

    const resWhitespace = validateRoomCodeInput('   ');
    assert.equal(resWhitespace.isValid, false);
    assert.equal(resWhitespace.error, 'Lütfen 6 haneli oda kodunu girin.');
  });

  await t.test('validateRoomCodeInput eksik karakterde uzunluk uyarısı döner', () => {
    const res = validateRoomCodeInput('AB12');
    assert.equal(res.isValid, false);
    assert.equal(res.error, 'Oda kodu 6 haneli olmalıdır (4/6).');
  });

  await t.test('validateRoomCodeInput tam 6 haneli geçerli kodda başarı döner', () => {
    const res = validateRoomCodeInput('84K9X2');
    assert.equal(res.isValid, true);
    assert.equal(res.error, null);
  });

  await t.test('shouldShowCloseButton aktif oda kodu ve handler varlığında true döner', () => {
    assert.equal(shouldShowCloseButton('84K9X2', true), true);
    assert.equal(shouldShowCloseButton('', true), false);
    assert.equal(shouldShowCloseButton('   ', true), false);
    assert.equal(shouldShowCloseButton('84K9X2', false), false);
  });

  await t.test('formatRecentRoomAriaLabel doğru açıklama metni üretir', () => {
    assert.equal(
      formatRecentRoomAriaLabel('ABCDEF'),
      'Son kullanılan oda kodunu seç: ABCDEF',
    );
  });

  await t.test('isSubmitDisabled 6 karakter dışındaki durumlarda true döner', () => {
    assert.equal(isSubmitDisabled(''), true);
    assert.equal(isSubmitDisabled('12345'), true);
    assert.equal(isSubmitDisabled('123456'), false);
    assert.equal(isSubmitDisabled('1234567'), false); // cleanRoomCode ilk 6 karakteri alır (slice 0, 6)
  });
});

