import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getDesktopHomeMainClassName,
  getDesktopLoadingContainerClassName,
  getDesktopLoadingSpinnerClassName,
  getDesktopLoadingMessage,
  getDesktopSocketRoleConfig,
  formatDesktopStageAriaLabel,
} from '../src/utils/desktopHomeViewUtils.ts';

test('desktopHomeViewUtils — Masaüstü Ana Ekran Görünüm ve Yükleme Yardımcıları', async (t) => {
  await t.test('standart layout ve spinner sınıflarını döner', () => {
    assert.equal(
      getDesktopHomeMainClassName(),
      'relative h-screen w-screen overflow-hidden bg-base text-fg',
    );
    assert.match(getDesktopLoadingContainerClassName(), /fixed inset-0 flex/);
    assert.match(getDesktopLoadingSpinnerClassName(), /animate-spin/);
  });

  await t.test('yükleme mesajı standart Türkçe bilgilendirme içerir', () => {
    assert.equal(getDesktopLoadingMessage(), '3B fizik sahnesi hazırlanıyor...');
  });

  await t.test('getDesktopSocketRoleConfig rolü daima host olarak döner', () => {
    assert.deepEqual(getDesktopSocketRoleConfig(), { role: 'host' });
  });

  await t.test('formatDesktopStageAriaLabel seviye parametresini doğru formatlar', () => {
    assert.equal(
      formatDesktopStageAriaLabel(3),
      'GyroMaze Masaüstü 3B Labirent Sahnesi — Seviye 3',
    );
    assert.equal(
      formatDesktopStageAriaLabel('Özel'),
      'GyroMaze Masaüstü 3B Labirent Sahnesi — Seviye Özel',
    );
    assert.equal(
      formatDesktopStageAriaLabel(null),
      'GyroMaze Masaüstü 3B Labirent Sahnesi',
    );
    assert.equal(
      formatDesktopStageAriaLabel(undefined),
      'GyroMaze Masaüstü 3B Labirent Sahnesi',
    );
    assert.equal(
      formatDesktopStageAriaLabel('   '),
      'GyroMaze Masaüstü 3B Labirent Sahnesi',
    );
  });
});
