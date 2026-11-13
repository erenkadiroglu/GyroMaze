import test from 'node:test';
import assert from 'node:assert/strict';
import {
  isResetBallDisabled,
  resolveRecalibrateAriaLabel,
  resolveResetBallAriaLabel,
} from '../src/utils/controllerFooterUtils.ts';

test('controllerFooterUtils — Mobil Kontrolcü Alt Eylemleri ve Kalibrasyon Kuralları', async (t) => {
  await t.test('isResetBallDisabled hem soket hem kontrolcü eşleştiğinde false döner', () => {
    assert.equal(isResetBallDisabled(true, true), false);
    assert.equal(isResetBallDisabled(false, true), true);
    assert.equal(isResetBallDisabled(true, false), true);
    assert.equal(isResetBallDisabled(false, false), true);
  });

  await t.test('resolveRecalibrateAriaLabel açıklayıcı erişilebilirlik metni döner', () => {
    assert.equal(resolveRecalibrateAriaLabel(), 'Jiroskop merkezini sıfırla ve kalibre et');
  });

  await t.test('resolveResetBallAriaLabel aktiflik durumuna göre doğru erişilebilirlik metni döner', () => {
    assert.equal(resolveResetBallAriaLabel(false), 'Topu başlangıç noktasına al');
    assert.equal(resolveResetBallAriaLabel(true), 'Topu başa al (Eşleşme bekleniyor)');
  });
});
