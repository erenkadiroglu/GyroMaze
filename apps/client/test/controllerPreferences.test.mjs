import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

/**
 * Son bağlanılan oda kodları listesini güncelleyen saf yardımcı kural.
 */
function updateRecentRooms(prev, roomCode) {
  const code = (roomCode ?? '').trim().toUpperCase().slice(0, 6);
  if (!code) return prev;
  const filtered = prev.filter((r) => r !== code);
  return [code, ...filtered].slice(0, 3);
}

/**
 * Gecikme (RTT) değerine göre renk/durum tonunu belirleyen kural.
 */
function getLatencyTone(ms) {
  if (ms <= 0) return 'none';
  if (ms < 35) return 'ok';
  if (ms < 75) return 'brass';
  return 'warn';
}

describe('Mobil Kontrolcü Tercihleri ve Bağlantı Kalite Kuralları', () => {
  it('son odalar listesini benzersiz, en yeni başta ve en fazla 3 kayıtla sınırlandırır', () => {
    let list = [];
    list = updateRecentRooms(list, '84K9X2');
    assert.deepEqual(list, ['84K9X2']);

    list = updateRecentRooms(list, 'THFYBD');
    assert.deepEqual(list, ['THFYBD', '84K9X2']);

    list = updateRecentRooms(list, 'QJ7F6G');
    assert.deepEqual(list, ['QJ7F6G', 'THFYBD', '84K9X2']);

    // 4. oda eklendiğinde en eski olan ('84K9X2') listeden düşmeli
    list = updateRecentRooms(list, 'N6T889');
    assert.deepEqual(list, ['N6T889', 'QJ7F6G', 'THFYBD']);

    // Mevcut oda yeniden ziyaret edildiğinde en başa taşınmalı
    list = updateRecentRooms(list, 'qj7f6g');
    assert.deepEqual(list, ['QJ7F6G', 'N6T889', 'THFYBD']);

    // Boş veya geçersiz kodlar listeyi değiştirmemeli
    assert.deepEqual(updateRecentRooms(list, ''), list);
    assert.deepEqual(updateRecentRooms(list, '   '), list);
    assert.deepEqual(updateRecentRooms(list, null), list);
  });

  it('gecikme sürelerini (RTT) doğru ağ kalite eşiklerine sınıflandırır', () => {
    assert.equal(getLatencyTone(0), 'none');
    assert.equal(getLatencyTone(12), 'ok');
    assert.equal(getLatencyTone(34), 'ok');
    assert.equal(getLatencyTone(35), 'brass');
    assert.equal(getLatencyTone(74), 'brass');
    assert.equal(getLatencyTone(75), 'warn');
    assert.equal(getLatencyTone(180), 'warn');
  });
});

