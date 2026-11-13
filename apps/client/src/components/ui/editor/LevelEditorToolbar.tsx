'use client';

import type { CellTool } from '@/utils/editorUtils';
import {
  TOOLS,
  TOOL_BY_ID,
  type ToolDefinition,
} from '@/utils/editorToolbarUtils';
import { EditorToolButton } from './toolbar/EditorToolButton';

export { TOOLS, TOOL_BY_ID, type ToolDefinition };

interface LevelEditorToolbarProps {
  activeTool: CellTool;
  onSelectTool: (tool: CellTool) => void;
}

/**
 * Harita editörü araç paleti:
 * 10 farklı çizim ve düzenleme aracını (Duvar, Delik, Kristal, Lazer, Hız Rampası,
 * Devriye Engel, Portal, Başlangıç, Hedef, Silgi) içeren erişilebilir radyo grubu.
 */
export function LevelEditorToolbar({
  activeTool,
  onSelectTool,
}: LevelEditorToolbarProps) {
  return (
    <div>
      <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">
        Araç paleti
      </div>
      <div
        role="radiogroup"
        aria-label="Izgara aracı"
        className="grid grid-cols-2 gap-1.5 sm:grid-cols-5 md:grid-cols-2"
      >
        {TOOLS.map((tool) => (
          <EditorToolButton
            key={tool.id}
            tool={tool}
            activeTool={activeTool}
            onSelectTool={onSelectTool}
          />
        ))}
      </div>
    </div>
  );
}
