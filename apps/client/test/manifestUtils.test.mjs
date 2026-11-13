import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildAppManifest,
  DEFAULT_MANIFEST_ICONS,
  DEFAULT_MANIFEST_SHORTCUTS,
} from '../src/utils/manifestUtils.ts';

test('manifestUtils — PWA WebManifest Yapılandırması', async (t) => {
  await t.test('buildAppManifest geçerli bağımsız (standalone) PWA manifesti üretir', () => {
    const manifest = buildAppManifest();

    assert.equal(manifest.name, 'GyroMaze — 3B Jiroskop Labirent');
    assert.equal(manifest.short_name, 'GyroMaze');
    assert.equal(manifest.start_url, '/controller');
    assert.equal(manifest.display, 'standalone');
    assert.equal(manifest.orientation, 'portrait');
    assert.equal(manifest.background_color, '#0f1a2b');
    assert.equal(manifest.theme_color, '#0f1a2b');
  });

  await t.test('buildAppManifest maskelenebilir SVG ikonu içerir', () => {
    const manifest = buildAppManifest();
    assert.ok(manifest.icons.length >= 1);
    const primaryIcon = manifest.icons[0];
    assert.equal(primaryIcon.src, '/icon.svg');
    assert.equal(primaryIcon.type, 'image/svg+xml');
    assert.equal(primaryIcon.purpose, 'maskable');
  });

  await t.test('buildAppManifest mobil kumanda ve 3B sahne kısayollarını tanımlar', () => {
    const manifest = buildAppManifest();
    assert.equal(manifest.shortcuts.length, 2);
    assert.equal(manifest.shortcuts[0].url, '/controller');
    assert.equal(manifest.shortcuts[1].url, '/');
  });
});
