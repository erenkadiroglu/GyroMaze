import test from 'node:test';
import assert from 'node:assert/strict';

import {
  shouldShowScoreSubmitForm,
  shouldShowMultiplayerWinner,
  isStarFilled,
  formatSubmitButtonText,
} from '../src/utils/victoryModalUtils.ts';

test('victoryModalUtils — Zafer Modalı ve Skor Gönderim Kuralları', async (t) => {
  await t.test('shouldShowScoreSubmitForm: ozel harita (99) haric tum seviyelerde true doner', () => {
    assert.equal(shouldShowScoreSubmitForm(1), true);
    assert.equal(shouldShowScoreSubmitForm(5), true);
    assert.equal(shouldShowScoreSubmitForm(99), false);
  });

  await t.test('shouldShowMultiplayerWinner: yalniz cok oyunculu ve kazanan varken true doner', () => {
    assert.equal(shouldShowMultiplayerWinner(true, 1), true);
    assert.equal(shouldShowMultiplayerWinner(true, 2), true);
    assert.equal(shouldShowMultiplayerWinner(true, null), false);
    assert.equal(shouldShowMultiplayerWinner(false, 1), false);
  });

  await t.test('isStarFilled: kazanilan yildiz adedine gore boolean doner', () => {
    assert.equal(isStarFilled(1, 2), true);
    assert.equal(isStarFilled(2, 2), true);
    assert.equal(isStarFilled(3, 2), false);
  });

  await t.test('formatSubmitButtonText: skor gonderildiyse Kaydedildi, gonderilmediyse Skoru kaydet doner', () => {
    assert.equal(formatSubmitButtonText(true), 'Kaydedildi');
    assert.equal(formatSubmitButtonText(false), 'Skoru kaydet');
  });
});

