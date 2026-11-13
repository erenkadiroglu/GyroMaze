import test from 'node:test';
import assert from 'node:assert/strict';

import {
  canExportGrid,
  resolveExportPayload,
  parseClipboardMapData,
  getEditorInitialTitle,
  getEditorInitialBoardSize,
} from '../src/utils/editorOrchestrationUtils.ts';
import { encodeCustomMazeLevelForUrl } from '../src/components/scene/mazeLevels.ts';

test('editorOrchestrationUtils — Harita Editörü Orkestrasyon ve Pano Yardımcıları', async (t) => {
  const sampleLevel = {
    id: 99,
    title: 'Test Labirent',
    difficulty: 'Özel',
    boardSize: 14,
    startPosition: [1, 0.34, 1],
    goalPosition: [5, 0.35, 5],
    innerWalls: [],
    voidHoles: [],
    crystals: [],
    laserGates: [],
    boostPads: [],
    teleporters: [],
    movingObstacles: [],
  };

  await t.test('canExportGrid: portal sayısı dengeli olduğunda izin verir, dengesizken uyarır', () => {
    // Portalsız ızgara
    assert.deepEqual(canExportGrid([['start', 'goal']]), { canExport: true });

    // Tek portallı ızgara
    const unbalanced = canExportGrid([['start', 'portal']]);
    assert.equal(unbalanced.canExport, false);
    assert.ok(unbalanced.reason?.includes('kuantum portal'));

    // Çift portallı ızgara
    assert.deepEqual(canExportGrid([['portal', 'portal']]), { canExport: true });
  });

  await t.test('resolveExportPayload: json ve link çıktılarını doğru üretir', () => {
    // JSON
    const jsonOutput = resolveExportPayload(sampleLevel, 'json', 'http://localhost:3000');
    const parsed = JSON.parse(jsonOutput);
    assert.equal(parsed.title, 'Test Labirent');

    // Link
    const linkOutput = resolveExportPayload(sampleLevel, 'link', 'http://localhost:3000');
    assert.ok(linkOutput.includes('map='));
    assert.ok(linkOutput.startsWith('http://localhost:3000/?map='));
  });

  await t.test('parseClipboardMapData: JSON metnini ve paylaşım bağlantısını çözer', () => {
    // Geçerli JSON
    const jsonString = JSON.stringify(sampleLevel);
    const parsedFromJson = parseClipboardMapData(jsonString);
    assert.ok(parsedFromJson !== null);
    assert.equal(parsedFromJson?.title, 'Test Labirent');

    // Geçerli URL
    const token = encodeCustomMazeLevelForUrl(sampleLevel);
    const validUrl = `http://localhost:3000/?map=${token}`;
    const parsedFromUrl = parseClipboardMapData(validUrl);
    assert.ok(parsedFromUrl !== null);
    assert.equal(parsedFromUrl?.title, 'Test Labirent');

    // Bozuk metin
    assert.equal(parseClipboardMapData(''), null);
    assert.equal(parseClipboardMapData('rastgele bozuk metin'), null);
  });

  await t.test('getEditorInitialTitle ve getEditorInitialBoardSize: varsayılanları veya mevcut seviyeyi döner', () => {
    assert.equal(getEditorInitialTitle('Özel Haritam'), 'Özel Haritam');
    assert.equal(getEditorInitialTitle(''), 'Özel Labirent — Tasarım 1');
    assert.equal(getEditorInitialTitle(undefined), 'Özel Labirent — Tasarım 1');

    assert.equal(getEditorInitialBoardSize(16), 16);
    assert.equal(getEditorInitialBoardSize(undefined), 12);
    assert.equal(getEditorInitialBoardSize(0), 12);
  });
});
