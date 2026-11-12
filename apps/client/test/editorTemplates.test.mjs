import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  createEmptyGrid,
  EDITOR_TEMPLATES,
  getEditorTemplateById,
} from '../src/utils/editorTemplates.ts';
import { validateEditorGrid } from '../src/components/scene/mazeLevels.ts';

describe('editorTemplates — 3B Harita Editörü Şablon Motoru Testleri', () => {
  it('createEmptyGrid 8x8 boyutunda geçerli başlangıç ve hedef içeren ızgara üretir', () => {
    const emptyGrid = createEmptyGrid(8);
    assert.equal(emptyGrid.length, 8);
    assert.equal(emptyGrid[0].length, 8);
    assert.equal(emptyGrid[0][0], 'start');
    assert.equal(emptyGrid[7][7], 'goal');

    const validation = validateEditorGrid(emptyGrid);
    assert.equal(validation.ok, true);
  });

  it('getEditorTemplateById şablonları ID ile bulur ve geçersiz ID durumunda undefined döner', () => {
    const spiral = getEditorTemplateById('spiral');
    assert.ok(spiral);
    assert.equal(spiral.name, 'Spiral Koridor');
    assert.equal(spiral.boardSize, 14);

    const nonExistent = getEditorTemplateById('unknown-id');
    assert.equal(nonExistent, undefined);
  });

  it('tüm editör şablonları 8x8 ızgaraya ve benzersiz meta alanlarına sahiptir', () => {
    const seenIds = new Set();

    for (const template of EDITOR_TEMPLATES) {
      assert.ok(template.id, 'Şablon ID boş olamaz');
      assert.ok(!seenIds.has(template.id), `Tekrarlanan şablon ID: ${template.id}`);
      seenIds.add(template.id);

      assert.ok(template.name.length > 0, 'Şablon adı boş olamaz');
      assert.ok(template.description.length > 0, 'Şablon açıklaması boş olamaz');
      assert.ok([12, 14, 16].includes(template.boardSize), 'Tahta boyutu 12, 14 veya 16 olmalıdır');

      assert.equal(template.grid.length, 8, `${template.id} 8 satır olmalıdır`);
      for (let r = 0; r < 8; r++) {
        assert.equal(template.grid[r].length, 8, `${template.id} ${r}. satır 8 sütun olmalıdır`);
      }
    }
  });

  it('tüm editör şablonları validateEditorGrid doğrulamasından başarıyla geçer (ok: true)', () => {
    for (const template of EDITOR_TEMPLATES) {
      const validation = validateEditorGrid(template.grid);
      assert.equal(
        validation.ok,
        true,
        `Şablon "${template.name}" doğrulanamadı: ${validation.ok ? '' : validation.reason}`,
      );
    }
  });

  it('Kuantum Köprüsü şablonunda sol ve sağ odalar duvarla ayrılmış ve portal üzerinden çözülebilirdir', () => {
    const qBridge = getEditorTemplateById('quantum-bridge');
    assert.ok(qBridge);

    // 3. sütundaki tüm hücreler duvar olmalıdır
    for (let r = 0; r < 8; r++) {
      assert.equal(qBridge.grid[r][3], 'wall', `${r}. satır duvar olmalıdır`);
    }

    // Portal çifti bulunmalı
    const portals = qBridge.grid.flatMap((row, rIdx) =>
      row
        .map((cell, cIdx) => (cell === 'portal' ? [rIdx, cIdx] : null))
        .filter(Boolean),
    );
    assert.equal(portals.length, 2, 'Tam 2 portal bulunmalıdır');

    // BFS geçerliliği
    const validation = validateEditorGrid(qBridge.grid);
    assert.equal(validation.ok, true);
  });
});

