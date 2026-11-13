import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getCenterStageAriaLabel,
  getCenterStageContainerClass,
  isGimbalStageActive,
  isRoomStageActive,
  isSensorStageActive,
  formatStageModeSummary,
} from '../src/utils/controllerCenterStageUtils.ts';

test('controllerCenterStageUtils — Mobil Kontrolcü Merkez Sahnesi Yardımcıları', async (t) => {
  await t.test('getCenterStageAriaLabel her sahne aşamasına uygun erişilebilir etiket üretir', () => {
    assert.equal(getCenterStageAriaLabel('room'), 'Oda bağlantı kartı');
    assert.equal(getCenterStageAriaLabel('sensor'), 'Sensör izin ve etkinleştirme kartı');
    assert.equal(getCenterStageAriaLabel('gimbal'), 'Sanal gimbal ve açı gösterge alanı');
    assert.equal(getCenterStageAriaLabel('other'), 'Mobil kontrolcü merkez aşaması');
    assert.equal(getCenterStageAriaLabel(undefined), 'Mobil kontrolcü merkez aşaması');
  });

  await t.test('getCenterStageContainerClass beklenen hizalama ve boşluk sınıflarını döner', () => {
    const cls = getCenterStageContainerClass();
    assert.match(cls, /my-auto/);
    assert.match(cls, /flex/);
    assert.match(cls, /items-center/);
    assert.match(cls, /justify-center/);
  });

  await t.test('aşama doğrulama fonksiyonları stageMode durumunu doğru çözümler', () => {
    assert.equal(isGimbalStageActive('gimbal'), true);
    assert.equal(isGimbalStageActive('room'), false);
    assert.equal(isRoomStageActive('room'), true);
    assert.equal(isRoomStageActive('sensor'), false);
    assert.equal(isSensorStageActive('sensor'), true);
    assert.equal(isSensorStageActive('gimbal'), false);
  });

  await t.test('formatStageModeSummary aşama ve kontrol durumunu formatlar', () => {
    assert.equal(
      formatStageModeSummary('gimbal', true, true),
      'Aşama: gimbal, Bağlantı: Eşleşti, Kontrol: Dokunmatik',
    );
    assert.equal(
      formatStageModeSummary('room', false, false),
      'Aşama: room, Bağlantı: Bağlantı Yok, Kontrol: Jiroskop',
    );
    assert.equal(
      formatStageModeSummary('', false, true),
      'Aşama: bilinmeyen, Bağlantı: Bağlantı Yok, Kontrol: Dokunmatik',
    );
  });
});

