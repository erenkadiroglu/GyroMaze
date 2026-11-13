import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getSettingsModalTitle,
  getSettingsModalDescription,
  getSettingsContainerAriaLabel,
  isSettingsModalOpen,
  formatSettingsSectionAriaLabel,
  formatActivePreferencesSummary,
} from '../src/utils/settingsModalViewUtils.ts';

test('settingsModalViewUtils — Ayarlar Çekmecesi Görünüm ve Özet Yardımcıları', async (t) => {
  await t.test('standart başlık, açıklama ve kapsayıcı etiketlerini döner', () => {
    assert.equal(getSettingsModalTitle(), 'Ayarlar');
    assert.match(getSettingsModalDescription(), /Oyun modu, görünüm, fizik/);
    assert.equal(getSettingsContainerAriaLabel(), 'Oyun ve Arayüz Ayarları');
  });

  await t.test('isSettingsModalOpen açık durumunu boolean olarak doğrular', () => {
    assert.equal(isSettingsModalOpen(true), true);
    assert.equal(isSettingsModalOpen(false), false);
    assert.equal(isSettingsModalOpen(null), false);
    assert.equal(isSettingsModalOpen(undefined), false);
  });

  await t.test('formatSettingsSectionAriaLabel bölüm adına göre doğru aria etiketi üretir', () => {
    assert.equal(formatSettingsSectionAriaLabel('Görünüm'), 'Görünüm Ayarları');
    assert.equal(formatSettingsSectionAriaLabel('Fizik'), 'Fizik Ayarları');
    assert.equal(formatSettingsSectionAriaLabel(''), 'Genel Ayarlar');
    assert.equal(formatSettingsSectionAriaLabel(null), 'Genel Ayarlar');
  });

  await t.test('formatActivePreferencesSummary 1P klasik modu ve ses seviyesini formatlar', () => {
    const summary = formatActivePreferencesSummary({
      isMultiplayer: false,
      gameMode: 'classic',
      colorScheme: 'dark',
      soundVolume: 0.75,
      isMuted: false,
    });
    assert.equal(summary, '1P Solo | Klasik | Karanlık | Ses: %75');
  });

  await t.test('formatActivePreferencesSummary 2P zamana karşı ve sessize alma durumunu yansıtır', () => {
    const summary = formatActivePreferencesSummary({
      isMultiplayer: true,
      gameMode: 'time-attack',
      colorScheme: 'neon',
      soundVolume: 0.8,
      isMuted: true,
    });
    assert.equal(summary, '2P Çok Oyunculu | Zamana Karşı | Neon | Ses: Sessiz');
  });

  await t.test('formatActivePreferencesSummary cyberpunk şeması ve sıfır ses düzeyini doğru ele alır', () => {
    const summary = formatActivePreferencesSummary({
      isMultiplayer: false,
      gameMode: 'unknown',
      colorScheme: 'cyberpunk',
      soundVolume: 0,
      isMuted: false,
    });
    assert.equal(summary, '1P Solo | Klasik | Cyberpunk | Ses: Sessiz');
  });
});

