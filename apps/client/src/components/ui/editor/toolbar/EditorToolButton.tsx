'use client';

import type { CellTool } from '@/utils/editorUtils';
import {
  type ToolDefinition,
  isToolActive,
  resolveToolButtonClass,
} from '@/utils/editorToolbarUtils';

interface EditorToolButtonProps {
  tool: ToolDefinition;
  activeTool: CellTool;
  onSelectTool: (tool: CellTool) => void;
}

/**
 * Harita editörü paletindeki tekil araç seçim butonu
 */
export function EditorToolButton({
  tool,
  activeTool,
  onSelectTool,
}: EditorToolButtonProps) {
  const isActive = isToolActive(activeTool, tool.id);
  const className = resolveToolButtonClass(tool, isActive);

  return (
    <button
      type="button"
      role="radio"
      aria-checked={isActive}
      onClick={() => onSelectTool(tool.id)}
      className={className}
    >
      {tool.icon}
      <span className="truncate">{tool.label}</span>
    </button>
  );
}
