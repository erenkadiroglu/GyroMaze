import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateTimeAttackLimit,
  calculateTimeRemaining,
  resolveTimerColorClass,
  resolveConnectionStatus,
  formatPortalStatus,
  formatCameraModeLabel,
} from '../src/utils/hudUtils.ts';

test('hudUtils — HUD Durum, Süre ve Formatlama Yardımcıları', async (t) => {
  await t.test('calculateTimeAttackLimit iki yıldız sınırına göre doğru azami süreyi belirler', () => {
    // [15, 24] barajında 24 * 1.15 = 27.6 -> round = 28
    assert.equal(calculateTimeAttackLimit([15, 24]), 28);
    // Çok düşük barajlarda alt sınır 14 saniyedir
    assert.equal(calculateTimeAttackLimit([5, 8]), 14);
    // Varsayılan tanımsız baraj [15, 24] kullanır -> 28
    assert.equal(calculateTimeAttackLimit(undefined), 28);
  });

  await t.test('calculateTimeRemaining kalan süreyi hesaplar ve negatif değerleri sıfırlar', () => {
    assert.equal(calculateTimeRemaining(28, 10.4), 17.6);
    assert.equal(calculateTimeRemaining(28, 27.9), 0.1);
    assert.equal(calculateTimeRemaining(28, 30.5), 0);
  });

  await t.test('resolveTimerColorClass kalan süreye ve mod durumuna göre renk sınıfı döndürür', () => {
    // Normal modda her zaman text-fg döner
    assert.equal(resolveTimerColorClass(false, 3.2), 'text-fg');

    // Süreye Karşı modunda: > 8s text-fg, 5-8s text-warn, <= 4s text-danger
    assert.equal(resolveTimerColorClass(true, 12.0), 'text-fg');
    assert.equal(resolveTimerColorClass(true, 7.5), 'text-warn');
    assert.equal(resolveTimerColorClass(true, 4.0), 'text-danger');
    assert.equal(resolveTimerColorClass(true, 1.2), 'text-danger');
  });

  await t.test('resolveConnectionStatus sunucu ve kontrolcü durumlarına göre renk ve etiket üretir', () => {
    // Hiçbir bağlantı yokken
    const disconnected = resolveConnectionStatus(false, false, false);
    assert.equal(disconnected.isAnyPaired, false);
    assert.equal(disconnected.dotColor, 'bg-danger');

    // Yalnız sunucu bağlı, kontrolcü bekleniyor
    const awaitingController = resolveConnectionStatus(true, false, false);
    assert.equal(awaitingController.isAnyPaired, false);
    assert.equal(awaitingController.dotColor, 'bg-brass');

    // 1. kontrolcü bağlı
    const pairedP1 = resolveConnectionStatus(true, true, false);
    assert.equal(pairedP1.isAnyPaired, true);
    assert.equal(pairedP1.dotColor, 'bg-ok');

    // 2. kontrolcü bağlı
    const pairedP2 = resolveConnectionStatus(true, false, true);
    assert.equal(pairedP2.isAnyPaired, true);
    assert.equal(pairedP2.dotColor, 'bg-ok');
  });

  await t.test('formatPortalStatus kristal sayımına göre kilit ve ipucu metinlerini üretir', () => {
    // Henüz toplanmamış kristaller var
    const locked = formatPortalStatus(5, 2);
    assert.equal(locked.isUnlocked, false);
    assert.equal(locked.ratioText, '2/5');
    assert.match(locked.tooltip, /3 kristal kaldı/);

    // Tüm kristaller toplandı
    const unlocked = formatPortalStatus(5, 5);
    assert.equal(unlocked.isUnlocked, true);
    assert.equal(unlocked.ratioText, '5/5');
    assert.equal(unlocked.tooltip, 'Hedef portalı açık');
  });

  await t.test('formatCameraModeLabel kamera moduna göre Türkçe başlık döner', () => {
    assert.equal(formatCameraModeLabel('isometric'), 'İzometrik');
    assert.equal(formatCameraModeLabel('topdown'), 'Üstten');
    assert.equal(formatCameraModeLabel('follow'), 'Takip');
  });
});
