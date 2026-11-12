import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  applyToolToCell,
  countGridPortals,
  isPortalCountBalanced,
  generateRandomEditorGrid,
} from '../src/utils/editorUtils.ts';
import { createEmptyGrid } from '../src/utils/editorTemplates.ts';
import { validateEditorGrid } from '../src/components/scene/mazeLevels.ts';

describe('editorUtils — Harita Editörü Izgara ve Araç Mantığı Testleri', () => {
  test('applyToolToCell başlangıç noktasını yeni hücreye taşır ve tekil bırakır', () => {
    const grid = createEmptyGrid(8);
    assert.equal(grid[0][0], 'start');

    // Başlangıcı (2, 2) konumuna taşı
    const updated = applyToolToCell(grid, 2, 2, 'start', 8);
    assert.equal(updated[2][2], 'start');
    assert.equal(updated[0][0], 'erase');

    // Izgarada toplam tam olarak 1 adet start olmalı
    const startCount = updated.flat().filter((c) => c === 'start').length;
    assert.equal(startCount, 1);
  });

  test('applyToolToCell hedef noktasını yeni hücreye taşır ve tekil bırakır', () => {
    const grid = createEmptyGrid(8);
    assert.equal(grid[7][7], 'goal');

    // Hedefi (5, 5) konumuna taşı
    const updated = applyToolToCell(grid, 5, 5, 'goal', 8);
    assert.equal(updated[5][5], 'goal');
    assert.equal(updated[7][7], 'erase');

    const goalCount = updated.flat().filter((c) => c === 'goal').length;
    assert.equal(goalCount, 1);
  });

  test('applyToolToCell start veya goal üzerine normal araç çizilmesini engeller', () => {
    const grid = createEmptyGrid(8);
    const updated = applyToolToCell(grid, 0, 0, 'wall', 8);
    // 0, 0 hücresi 'start' olarak kalmalıdır, duvar olmamalıdır
    assert.equal(updated[0][0], 'start');
  });

  test('applyToolToCell normal araçları toggle eder ve siler', () => {
    const grid = createEmptyGrid(8);
    assert.equal(grid[3][3], 'erase');

    // 1. Tıklama: Kristal ekle
    const withCrystal = applyToolToCell(grid, 3, 3, 'crystal', 8);
    assert.equal(withCrystal[3][3], 'crystal');

    // 2. Tıklama: Aynı araçla tekrar tıklandığında siler (erase)
    const toggledOff = applyToolToCell(withCrystal, 3, 3, 'crystal', 8);
    assert.equal(toggledOff[3][3], 'erase');

    // Farklı araç ile tıklanırsa yeni araca dönüştürür
    const withLaser = applyToolToCell(withCrystal, 3, 3, 'laser', 8);
    assert.equal(withLaser[3][3], 'laser');
  });

  test('countGridPortals ve isPortalCountBalanced kuantum portal çiftlerini doğrular', () => {
    const grid = createEmptyGrid(8);
    assert.equal(countGridPortals(grid), 0);
    assert.equal(isPortalCountBalanced(grid), true);

    // 1 portal ekle (dengesiz)
    grid[1][1] = 'portal';
    assert.equal(countGridPortals(grid), 1);
    assert.equal(isPortalCountBalanced(grid), false);

    // 2. portalı ekle (dengeli çift)
    grid[6][6] = 'portal';
    assert.equal(countGridPortals(grid), 2);
    assert.equal(isPortalCountBalanced(grid), true);
  });

  test('generateRandomEditorGrid çözülebilir ve geçerli 8x8 harita üretir', () => {
    const generated = generateRandomEditorGrid(8, validateEditorGrid);
    assert.equal(generated.length, 8);
    assert.equal(generated[0].length, 8);
    assert.equal(generated[0][0], 'start');
    assert.equal(generated[7][7], 'goal');

    const validation = validateEditorGrid(generated);
    assert.equal(validation.ok, true);
  });
});
