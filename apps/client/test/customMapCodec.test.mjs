import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  parseCustomMazeLevel,
  encodeCustomMazeLevelForUrl,
  decodeCustomMazeLevelFromUrl,
  CUSTOM_MAP_URL_PARAM,
  MAX_ENCODED_MAP_LENGTH,
} from '../src/utils/customMapCodec.ts';

describe('customMapCodec — Özel Harita URL Kodlama ve Şema Ayrıştırma Testleri', () => {
  const sampleLevel = {
    id: 99,
    title: 'Test Labirent',
    subtitle: 'Birim Test Haritası',
    boardSize: 12,
    startPosition: [-4.5, 0.34, -4.5],
    goalPosition: [4.5, 0.35, 4.5],
    innerWalls: [
      { position: [0, 0.375, 0], size: [2, 0.75, 0.36] },
    ],
    voidHoles: [{ position: [2, 2], radius: 0.42 }],
    crystals: [[1, -1], [-1, 1]],
    laserGates: [
      {
        position: [0, 2],
        length: 2.5,
        axis: 'x',
        periodSeconds: 3.0,
        phaseOffset: 0.5,
      },
    ],
    boostPads: [{ position: [-2, 0], direction: [0, 1] }],
    teleporters: [{ entry: [-3, 3], exit: [3, -3] }],
    movingObstacles: [
      {
        center: [0, -2],
        axis: 'x',
        amplitude: 1.0,
        speed: 2.0,
        phaseOffset: 0,
      },
    ],
    starThresholds: [18.0, 30.0],
  };

  test('parseCustomMazeLevel geçerli nesneyi güvenli id: 99 tanımına ayrıştırır', () => {
    const parsed = parseCustomMazeLevel(sampleLevel);
    assert.ok(parsed);
    assert.equal(parsed.id, 99);
    assert.equal(parsed.title, 'Test Labirent');
    assert.equal(parsed.innerWalls.length, 1);
    assert.equal(parsed.crystals.length, 2);
    assert.equal(parsed.laserGates.length, 1);
    assert.equal(parsed.boostPads?.length, 1);
    assert.equal(parsed.teleporters?.length, 1);
    assert.equal(parsed.movingObstacles?.length, 1);
  });

  test('parseCustomMazeLevel eksik veya bozuk tiplerde null döner', () => {
    assert.equal(parseCustomMazeLevel(null), null);
    assert.equal(parseCustomMazeLevel('geçersiz dize'), null);
    assert.equal(parseCustomMazeLevel({}), null);
    assert.equal(parseCustomMazeLevel({ startPosition: [0, 0] }), null);
    assert.equal(
      parseCustomMazeLevel({
        startPosition: [0, 0, 0],
        goalPosition: [1, 1, 1],
        innerWalls: 'duvar değil',
      }),
      null,
    );
  });

  test('encodeCustomMazeLevelForUrl URL-safe Base64url dizesi üretir', () => {
    const parsed = parseCustomMazeLevel(sampleLevel);
    assert.ok(parsed);
    const encoded = encodeCustomMazeLevelForUrl(parsed);

    assert.ok(typeof encoded === 'string');
    assert.ok(encoded.length > 20);
    // URL güvensiz karakterler (+, /, =) içermemelidir
    assert.equal(encoded.includes('+'), false);
    assert.equal(encoded.includes('/'), false);
    assert.equal(encoded.includes('='), false);
    assert.ok(/^[A-Za-z0-9_-]+$/.test(encoded));
  });

  test('decodeCustomMazeLevelFromUrl kodlanan haritayı kayıpsız çözer (round-trip)', () => {
    const parsed = parseCustomMazeLevel(sampleLevel);
    assert.ok(parsed);
    const encoded = encodeCustomMazeLevelForUrl(parsed);

    const decoded = decodeCustomMazeLevelFromUrl(encoded);
    assert.ok(decoded);
    assert.equal(decoded.title, parsed.title);
    assert.equal(decoded.boardSize, parsed.boardSize);
    assert.deepEqual(decoded.startPosition, parsed.startPosition);
    assert.deepEqual(decoded.goalPosition, parsed.goalPosition);
    assert.equal(decoded.crystals.length, parsed.crystals.length);
  });

  test('decodeCustomMazeLevelFromUrl geçersiz karakter, bozuk veri veya limit aşımında null döner', () => {
    assert.equal(decodeCustomMazeLevelFromUrl(''), null);
    assert.equal(decodeCustomMazeLevelFromUrl('   '), null);
    assert.equal(decodeCustomMazeLevelFromUrl('geçersiz+karakterler!!'), null);
    assert.equal(decodeCustomMazeLevelFromUrl('dGVzdA'), null); // 'test' JSON değil

    // Maksimum uzunluk aşımı
    const oversized = 'A'.repeat(MAX_ENCODED_MAP_LENGTH + 1);
    assert.equal(decodeCustomMazeLevelFromUrl(oversized), null);
  });

  test('CUSTOM_MAP_URL_PARAM sabitinin "map" olduğunu doğrular', () => {
    assert.equal(CUSTOM_MAP_URL_PARAM, 'map');
  });
});

