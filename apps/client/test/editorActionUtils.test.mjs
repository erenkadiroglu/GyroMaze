import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildInitialEditorGrid,
  createShareUrl,
  detectClipboardMapType,
} from '../src/utils/editorActionUtils.ts';

test('editorActionUtils — Harita Editörü Eylemleri ve Paylaşım Yardımcıları', async (t) => {
  await t.test('buildInitialEditorGrid geçerli başlangıç ızgarası üretir', () => {
    const grid8 = buildInitialEditorGrid(8);
    assert.equal(grid8.length, 8);
    assert.equal(grid8[0].length, 8);
    assert.equal(grid8[0][0], 'start');
    assert.equal(grid8[7][7], 'goal');
    assert.equal(grid8[2][2], 'wall');
    assert.equal(grid8[3][5], 'crystal');
    assert.equal(grid8[5][2], 'hole');
    assert.equal(grid8[4][4], 'laser');
  });

  await t.test('createShareUrl URL arama parametresine harita kodunu yerleştirir', () => {
    const shareUrl = createShareUrl('https://gyromaze.vercel.app/game?room=123#test', 'custom_encoded_abc');
    assert.equal(shareUrl, 'https://gyromaze.vercel.app/?map=custom_encoded_abc');

    const fallbackUrl = createShareUrl('invalid-url', 'custom_encoded_abc');
    assert.equal(fallbackUrl, '/?map=custom_encoded_abc');
  });

  await t.test('detectClipboardMapType JSON ve URL formatlarını doğru ayrıştırır', () => {
    assert.equal(detectClipboardMapType('{"id": 99, "title": "Test"}'), 'json');
    assert.equal(detectClipboardMapType('   { "ok": true }  '), 'json');
    assert.equal(detectClipboardMapType('https://gyromaze.app/?map=xyz'), 'url_or_token');
    assert.equal(detectClipboardMapType('GZM1.eyJuYW1lIjoiTWF6ZSJ9'), 'url_or_token');
  });
});
