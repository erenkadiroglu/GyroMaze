import test from 'node:test';
import assert from 'node:assert/strict';
import {
  formatVolumeLabel,
  resolveActiveVolumeValue,
  resolveNextRadioIndex,
  resolveBallSkinSwatch,
  BALL_SKIN_OPTIONS,
  GRAVITY_SCALE_OPTIONS,
  TILT_RESPONSIVENESS_OPTIONS,
  VOLUME_SEGMENTED_OPTIONS,
} from '../src/utils/settingsUtils.ts';

test('settingsUtils — Ayarlar Seçenekleri ve Biçimlendirme Motoru', async (t) => {
  await t.test('formatVolumeLabel ses şiddetini yüzdeye veya sessiz etiketine çevirir', () => {
    assert.equal(formatVolumeLabel(0.5, false), '%50');
    assert.equal(formatVolumeLabel(1, false), '%100');
    assert.equal(formatVolumeLabel(0.25, false), '%25');
    assert.equal(formatVolumeLabel(0, false), 'Sessiz');
    assert.equal(formatVolumeLabel(0.75, true), 'Sessiz');
  });

  await t.test('resolveActiveVolumeValue sessize alındığında 0, aksi halde geçerli ses seviyesini döner', () => {
    assert.equal(resolveActiveVolumeValue(0.75, false), 0.75);
    assert.equal(resolveActiveVolumeValue(0.75, true), 0);
    assert.equal(resolveActiveVolumeValue(1.5, false), 1);
    assert.equal(resolveActiveVolumeValue(-0.5, false), 0);
    assert.equal(resolveActiveVolumeValue(NaN, false), 0.5);
  });

  await t.test('resolveNextRadioIndex ok tuşlarında döngüsel (wrap-around) indeks hesaplar', () => {
    // next: 0 -> 1 -> 2 -> 3 -> 0
    assert.equal(resolveNextRadioIndex(0, 4, 'next'), 1);
    assert.equal(resolveNextRadioIndex(2, 4, 'next'), 3);
    assert.equal(resolveNextRadioIndex(3, 4, 'next'), 0);

    // prev: 3 -> 2 -> 1 -> 0 -> 3
    assert.equal(resolveNextRadioIndex(3, 4, 'prev'), 2);
    assert.equal(resolveNextRadioIndex(1, 4, 'prev'), 0);
    assert.equal(resolveNextRadioIndex(0, 4, 'prev'), 3);

    // Boş dizi koruması
    assert.equal(resolveNextRadioIndex(0, 0, 'next'), 0);
  });

  await t.test('resolveBallSkinSwatch geçerli renk sınıflarını döner', () => {
    assert.equal(resolveBallSkinSwatch('chrome'), 'bg-zinc-200');
    assert.equal(resolveBallSkinSwatch('emerald'), 'bg-emerald-500');
    assert.equal(resolveBallSkinSwatch('plasma'), 'bg-purple-500');
    assert.equal(resolveBallSkinSwatch('crimson'), 'bg-rose-500');
    // @ts-expect-error geçersiz skin fallback kontrolü
    assert.equal(resolveBallSkinSwatch('unknown'), 'bg-zinc-200');
  });

  await t.test('tüm ayar sabitleri tanımlı ve geçerli uzunluktadır', () => {
    assert.equal(BALL_SKIN_OPTIONS.length, 4);
    assert.equal(GRAVITY_SCALE_OPTIONS.length, 3);
    assert.equal(TILT_RESPONSIVENESS_OPTIONS.length, 3);
    assert.equal(VOLUME_SEGMENTED_OPTIONS.length, 5);
  });
});

