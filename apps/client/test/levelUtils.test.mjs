import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getMazeLevel,
  findSafeP2SpawnOffset,
  getLevelRevisionKey,
  createSeededRng,
  MAZE_LEVELS,
} from '../src/components/scene/levels/index.ts';

test('levelUtils — Labirent Seviye ve Doğuş Yardımcıları', async (t) => {
  await t.test('getMazeLevel 1..5 standart el yapımı seviyeleri döndürür', () => {
    const level1 = getMazeLevel(1);
    assert.equal(level1.id, 1);
    assert.equal(level1.boardSize, 12);
    assert.equal(level1.title, 'Bölüm 01 — Uyanış Koridoru');

    const level5 = getMazeLevel(5);
    assert.equal(level5.id, 5);
    assert.equal(level5.title, 'Bölüm 05 — Karanlık Çekirdek');
  });

  await t.test('getMazeLevel geçersiz veya negatif kimliklerde varsayılan Bölüm 1 döner', () => {
    assert.equal(getMazeLevel(0).id, 1);
    assert.equal(getMazeLevel(-10).id, 1);
    assert.equal(getMazeLevel(NaN).id, 1);
  });

  await t.test('getMazeLevel 6 ve üzeri için prosedürel seviye üretir', () => {
    const level6 = getMazeLevel(6);
    assert.equal(level6.id, 6);
    assert.ok(level6.title.includes('Bölüm 06'));
    assert.ok(level6.crystals.length >= 3);
  });

  await t.test('getMazeLevel özel editör seviyesini (id: 99) customLevel varsa önceliklendirir', () => {
    const mockCustom = {
      ...MAZE_LEVELS[0],
      id: 99,
      title: 'Özel Test Haritası',
    };
    const level99 = getMazeLevel(99, mockCustom);
    assert.equal(level99.id, 99);
    assert.equal(level99.title, 'Özel Test Haritası');
  });

  await t.test('findSafeP2SpawnOffset güvenli sapma koordinatları döner', () => {
    const level1 = getMazeLevel(1);
    const offset = findSafeP2SpawnOffset(level1, 0.34);
    assert.ok(Array.isArray(offset));
    assert.equal(offset.length, 2);
    assert.ok(typeof offset[0] === 'number');
    assert.ok(typeof offset[1] === 'number');
  });

  await t.test('getLevelRevisionKey standart bölümlerde numara, id 99 da tam imza üretir', () => {
    const level2 = getMazeLevel(2);
    assert.equal(getLevelRevisionKey(level2), '2');

    const custom = {
      ...level2,
      id: 99,
    };
    const key = getLevelRevisionKey(custom);
    assert.ok(key.startsWith('99-12-'));
    assert.ok(key.includes('|'));
  });

  await t.test('createSeededRng deterministik 0 ile 1 arası sözde-rastgele sayılar üretir', () => {
    const rng1 = createSeededRng(12345);
    const rng2 = createSeededRng(12345);

    const val1 = rng1();
    const val2 = rng2();
    assert.equal(val1, val2);
    assert.ok(val1 >= 0 && val1 <= 1);
  });
});

