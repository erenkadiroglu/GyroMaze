import test from 'node:test';
import assert from 'node:assert/strict';

import {
  EDITOR_GRID_SIZE,
  EDITOR_CELL_WORLD_SIZE,
  computeEditorBoostDirection,
  computeEditorLaserAxis,
  computeEditorMovingConfig,
  editorGridCellToWorld,
  worldToEditorGridCell,
  validateEditorGrid,
  levelDefinitionToEditorGrid,
  buildLevelFromEditorGrid,
} from '../src/utils/editorCompiler.ts';

test('computeEditorBoostDirection: hedefe ve acik koridorlara gore yon secimi', () => {
  // 8x8 izgarada (2, 2) noktasinda bir boost pad, hedef (6, 6) noktasinda
  // Sag (col + 1) ve Asagi (row + 1) acik, Ust ve Sol kapali
  const isBlockedCell = (r, c) => {
    // Sol ve Ust hucreler duvar
    if (r === 1 || c === 1) return true;
    return false;
  };

  const dir = computeEditorBoostDirection(2, 2, [6, 6], isBlockedCell);
  // Hedef (6, 6) oldugu icin pozitif r veya pozitif c yonunde olmali (dc >= 0, dr >= 0)
  assert.ok(dir[0] >= 0 && dir[1] >= 0, 'Boost yonu hedefe dogru pozitif olmali');
  assert.ok(Math.abs(dir[0]) + Math.abs(dir[1]) === 1, 'Birim eksen yonu olmali');

  // Her tarafi acik bir izgarada dogrudan hedefe en cok yaklastiran eksen secilmeli
  const allOpen = () => false;
  const dirToGoal = computeEditorBoostDirection(1, 1, [1, 5], allOpen);
  // Hedef ayni satirda saga dogru (dr = 0, dc = +4), yon [1, 0] olmali
  assert.deepEqual(dirToGoal, [1, 0]);
});

test('computeEditorLaserAxis: dikey ve yatay koridorlara gore dik eksen secimi', () => {
  // Dikey koridor: Sol (c-1) ve Sag (c+1) duvar, Ust ve Alt acik
  const verticalCorridor = (r, c) => c === 1 || c === 3;
  const axisVert = computeEditorLaserAxis(2, 2, verticalCorridor);
  assert.equal(axisVert, 'x', 'Dikey koridoru kesmek icin lazer yatay x ekseninde olmali');

  // Yatay koridor: Ust (r-1) ve Alt (r+1) duvar, Sol ve Sag acik
  const horizontalCorridor = (r, c) => r === 1 || r === 3;
  const axisHoriz = computeEditorLaserAxis(2, 2, horizontalCorridor);
  assert.equal(axisHoriz, 'z', 'Yatay koridoru kesmek icin lazer dikey z ekseninde olmali');
});

test('computeEditorMovingConfig: bosluk genisligine gore eksen ve genlik', () => {
  // Sadece yatayda saga ve sola acik bir alan
  const horizontalOpen = (r, c) => r !== 2;
  const configH = computeEditorMovingConfig(2, 2, horizontalOpen);
  assert.equal(configH.axis, 'x');
  assert.equal(configH.amplitude, 0.72);

  // Sadece dikeyde acik bir alan
  const verticalOpen = (r, c) => c !== 2;
  const configV = computeEditorMovingConfig(2, 2, verticalOpen);
  assert.equal(configV.axis, 'z');
  assert.equal(configV.amplitude, 0.72);
});

test('editorGridCellToWorld ve worldToEditorGridCell: dunya-izgara cift yonlu esleme', () => {
  const gridSize = EDITOR_GRID_SIZE; // 8

  // Izgaradaki her bir hucre dunya koordinatindan geri cevrildiginde ayni olmali
  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      const [wx, wz] = editorGridCellToWorld(r, c);
      const [mappedR, mappedC] = worldToEditorGridCell(wx, wz);
      assert.equal(mappedR, r, `Satir eslesmeli (${r}, ${c})`);
      assert.equal(mappedC, c, `Sutun eslesmeli (${r}, ${c})`);
    }
  }

  // Sinir disi dunya koordinatlari sinirlara (clamp) oturmali
  const [clampedR1, clampedC1] = worldToEditorGridCell(-999, -999);
  assert.deepEqual([clampedR1, clampedC1], [0, 0]);

  const [clampedR2, clampedC2] = worldToEditorGridCell(999, 999);
  assert.deepEqual([clampedR2, clampedC2], [gridSize - 1, gridSize - 1]);
});

test('validateEditorGrid: baslangic/bitis eksikligi, portal ciftligi ve BFS ulasilabilirlik', () => {
  // 1. Baslangic eksik
  const missingStartGrid = Array.from({ length: 8 }, () => Array(8).fill('erase'));
  missingStartGrid[7][7] = 'goal';
  const val1 = validateEditorGrid(missingStartGrid);
  assert.equal(val1.ok, false);
  assert.match(val1.reason, /başlangıç/i);

  // 2. Bitis eksik
  const missingGoalGrid = Array.from({ length: 8 }, () => Array(8).fill('erase'));
  missingGoalGrid[0][0] = 'start';
  const val2 = validateEditorGrid(missingGoalGrid);
  assert.equal(val2.ok, false);
  assert.match(val2.reason, /hedef/i);

  // 3. Tek sayida portal (ornek: 3 adet portal)
  const oddPortalGrid = Array.from({ length: 8 }, () => Array(8).fill('erase'));
  oddPortalGrid[0][0] = 'start';
  oddPortalGrid[7][7] = 'goal';
  oddPortalGrid[1][1] = 'portal';
  oddPortalGrid[2][2] = 'portal';
  oddPortalGrid[3][3] = 'portal';
  const val3 = validateEditorGrid(oddPortalGrid);
  assert.equal(val3.ok, false);
  assert.match(val3.reason, /çift halinde/i);

  // 4. Hedefe yol yok (duvarla cevrili hedef)
  const blockedGoalGrid = Array.from({ length: 8 }, () => Array(8).fill('erase'));
  blockedGoalGrid[0][0] = 'start';
  blockedGoalGrid[7][7] = 'goal';
  blockedGoalGrid[6][7] = 'wall';
  blockedGoalGrid[7][6] = 'wall';
  const val4 = validateEditorGrid(blockedGoalGrid);
  assert.equal(val4.ok, false);
  assert.match(val4.reason, /ulaşılabilir bir yol/i);

  // 5. Gecerli harita
  const validGrid = Array.from({ length: 8 }, () => Array(8).fill('erase'));
  validGrid[0][0] = 'start';
  validGrid[7][7] = 'goal';
  validGrid[2][2] = 'crystal';
  const val5 = validateEditorGrid(validGrid);
  assert.equal(val5.ok, true);
});

test('buildLevelFromEditorGrid & levelDefinitionToEditorGrid: tam donusum ve ciftli portal destegi', () => {
  const grid = Array.from({ length: 8 }, () => Array(8).fill('erase'));
  grid[0][0] = 'start';
  grid[7][7] = 'goal';
  grid[1][1] = 'wall';
  grid[2][2] = 'hole';
  grid[3][3] = 'crystal';
  grid[4][4] = 'laser';
  grid[5][5] = 'boost';
  grid[6][6] = 'moving';
  grid[1][6] = 'portal';
  grid[6][1] = 'portal';

  const level = buildLevelFromEditorGrid(grid, {
    title: 'Test Arenasi',
    boardSize: 12,
  });

  assert.equal(level.id, 99);
  assert.equal(level.title, 'Test Arenasi');
  assert.equal(level.boardSize, 12);
  assert.equal(level.innerWalls?.length, 1);
  assert.equal(level.voidHoles?.length, 1);
  assert.equal(level.crystals?.length, 1);
  assert.equal(level.laserGates?.length, 1);
  assert.equal(level.boostPads?.length, 1);
  assert.equal(level.movingObstacles?.length, 1);
  assert.equal(level.teleporters?.length, 1, '2 portal tek bir teleporter cifti olusturmali');

  // Tekrar levelDefinitionToEditorGrid ile izgaraya cevir
  const roundtripGrid = levelDefinitionToEditorGrid(level, 8);
  assert.equal(roundtripGrid[0][0], 'start');
  assert.equal(roundtripGrid[7][7], 'goal');
  assert.equal(roundtripGrid[1][1], 'wall');
  assert.equal(roundtripGrid[2][2], 'hole');
  assert.equal(roundtripGrid[3][3], 'crystal');
  assert.equal(roundtripGrid[4][4], 'laser');
  assert.equal(roundtripGrid[5][5], 'boost');
  assert.equal(roundtripGrid[6][6], 'moving');
  assert.equal(roundtripGrid[1][6], 'portal');
  assert.equal(roundtripGrid[6][1], 'portal');
});
