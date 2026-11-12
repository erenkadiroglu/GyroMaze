import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  resolveControllerBaseUrl,
  buildControllerUrl,
} from '../src/utils/pairingUtils.ts';

describe('pairingUtils — Kontrolcü URL ve Eşleşme Yönlendirme Motoru', () => {
  it('HTTPS tüneli aktif olduğunda her zaman tüneli önceliklendirir', () => {
    const res = resolveControllerBaseUrl({
      tunnelUrl: 'https://clasp-luxury-ludicrous.ngrok-free.dev/',
      lanIp: '192.168.1.100',
      location: {
        hostname: 'localhost',
        origin: 'http://localhost:3000',
        port: '3000',
      },
    });

    assert.equal(res.activeBaseUrl, 'https://clasp-luxury-ludicrous.ngrok-free.dev');
    assert.equal(res.routeLabel, 'Güvenli HTTPS tüneli aktif (ngrok)');
  });

  it('tünel yokken ve localhost üzerinde çalışırken LAN IP adresini seçer', () => {
    const res = resolveControllerBaseUrl({
      tunnelUrl: null,
      lanIp: '192.168.1.55',
      location: {
        hostname: 'localhost',
        origin: 'http://localhost:3000',
        port: '3000',
      },
    });

    assert.equal(res.activeBaseUrl, 'http://192.168.1.55:3000');
    assert.match(res.routeLabel, /Yerel Wi-Fi ağı \(192\.168\.1\.55\)/);
  });

  it('canlı veya uzak alan adında mevcut tarayıcı origin adresini kullanır', () => {
    const res = resolveControllerBaseUrl({
      tunnelUrl: '',
      lanIp: '192.168.1.55',
      location: {
        hostname: 'gyromaze.example.com',
        origin: 'https://gyromaze.example.com',
        port: '',
      },
    });

    assert.equal(res.activeBaseUrl, 'https://gyromaze.example.com');
    assert.equal(res.routeLabel, 'Geçerli tarayıcı adresi kullanılıyor');
  });

  it('kontrolcü bağlantı URL adresini oda kodu ve oyuncu yuvası ile oluşturur', () => {
    // Oda kodu yok
    assert.equal(
      buildControllerUrl('https://example.com'),
      'https://example.com/controller',
    );

    // 1. Oyuncu oda kodu ile
    assert.equal(
      buildControllerUrl('https://example.com/', '84K9X2', 1),
      'https://example.com/controller?room=84K9X2',
    );

    // 2. Oyuncu oda kodu ile (&slot=2)
    assert.equal(
      buildControllerUrl('http://192.168.1.50:3000', '84k9x2', 2),
      'http://192.168.1.50:3000/controller?room=84K9X2&slot=2',
    );
  });
});

