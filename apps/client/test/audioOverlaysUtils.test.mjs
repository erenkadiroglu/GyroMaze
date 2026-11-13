import test from 'node:test';
import assert from 'node:assert/strict';
import {
  OVERLAY_SWITCH_CONFIGS,
  formatOverlayToggleAriaLabel,
  getOverlaySwitchConfig,
  formatVolumeAriaLabel,
} from '../src/utils/audioOverlaysUtils.ts';

test('audioOverlaysUtils — Ayarlar Ses ve Katman Seçenekleri Yardımcıları', async (t) => {
  await t.test('OVERLAY_SWITCH_CONFIGS 4 temel katman anahtarı içerir', () => {
    assert.equal(OVERLAY_SWITCH_CONFIGS.length, 4);
    assert.deepEqual(
      OVERLAY_SWITCH_CONFIGS.map((c) => c.id),
      ['trail', 'ghost', 'miniMap', 'haptic'],
    );
  });

  await t.test('getOverlaySwitchConfig mevcut kimlikleri başarıyla getirir', () => {
    const trail = getOverlaySwitchConfig('trail');
    assert.ok(trail);
    assert.equal(trail?.label, 'Neon hareket izi');

    const haptic = getOverlaySwitchConfig('haptic');
    assert.ok(haptic);
    assert.equal(haptic?.label, 'Mobil titreşim (Haptik)');
  });

  await t.test('getOverlaySwitchConfig geçersiz kimlikte undefined döner', () => {
    assert.equal(getOverlaySwitchConfig('non-existent'), undefined);
  });

  await t.test('formatOverlayToggleAriaLabel açık ve kapalı duruma göre doğru etiket üretir', () => {
    assert.equal(
      formatOverlayToggleAriaLabel('Neon hareket izi', true),
      'Neon hareket izi: Açık',
    );
    assert.equal(
      formatOverlayToggleAriaLabel('Neon hareket izi', false),
      'Neon hareket izi: Kapalı',
    );
  });

  await t.test('formatVolumeAriaLabel ses seviyesi etiketini doğru formatlar', () => {
    assert.equal(formatVolumeAriaLabel('%50'), 'Ses seviyesi: %50');
    assert.equal(formatVolumeAriaLabel('Sessiz'), 'Ses seviyesi: Sessiz');
  });
});
