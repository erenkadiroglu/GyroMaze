'use client';

import {
  Box,
  CircleDot,
  Gem,
  Zap,
  Play,
  Activity,
  Orbit,
  MapPin,
  Flag,
  Eraser,
} from 'lucide-react';
import type { CellTool } from '@/utils/editorUtils';
import { cx } from '../primitives';

export interface ToolDefinition {
  id: CellTool;
  label: string;
  activeClass: string;
  cellClass: string;
  symbol: string;
  icon: React.ReactNode;
}

export const TOOLS: ToolDefinition[] = [
  {
    id: 'wall',
    label: 'Duvar',
    activeClass: 'border-fg/40 bg-surface-2 text-fg',
    cellClass: 'border-muted/50 bg-muted/30 text-fg',
    symbol: '■',
    icon: <Box className="h-3.5 w-3.5" aria-hidden="true" />,
  },
  {
    id: 'hole',
    label: 'Delik',
    activeClass: 'border-danger/50 bg-danger/15 text-danger',
    cellClass: 'border-danger/60 bg-danger/20 text-danger',
    symbol: '●',
    icon: <CircleDot className="h-3.5 w-3.5" aria-hidden="true" />,
  },
  {
    id: 'crystal',
    label: 'Kristal',
    activeClass: 'border-signal/50 bg-signal/15 text-signal',
    cellClass: 'border-signal/60 bg-signal/20 text-signal',
    symbol: '◆',
    icon: <Gem className="h-3.5 w-3.5" aria-hidden="true" />,
  },
  {
    id: 'laser',
    label: 'Lazer',
    activeClass: 'border-warn/50 bg-warn/15 text-warn',
    cellClass: 'border-warn/60 bg-warn/20 text-warn',
    symbol: '⚡',
    icon: <Zap className="h-3.5 w-3.5" aria-hidden="true" />,
  },
  {
    id: 'boost',
    label: 'Hız rampası',
    activeClass: 'border-brass/50 bg-brass/15 text-brass',
    cellClass: 'border-brass/60 bg-brass/20 text-brass',
    symbol: '▲',
    icon: <Play className="h-3.5 w-3.5" aria-hidden="true" />,
  },
  {
    id: 'moving',
    label: 'Devriye engel',
    activeClass: 'border-warn/50 bg-warn/15 text-warn',
    cellClass: 'border-warn/60 bg-warn/20 text-warn',
    symbol: '↔',
    icon: <Activity className="h-3.5 w-3.5" aria-hidden="true" />,
  },
  {
    id: 'portal',
    label: 'Portal (çift)',
    activeClass: 'border-signal/50 bg-signal/15 text-signal',
    cellClass: 'border-signal/60 bg-signal/20 text-signal font-bold',
    symbol: '◎',
    icon: <Orbit className="h-3.5 w-3.5" aria-hidden="true" />,
  },
  {
    id: 'start',
    label: 'Başlangıç',
    activeClass: 'border-signal/50 bg-signal/15 text-signal',
    cellClass: 'border-signal bg-signal/25 text-signal font-bold',
    symbol: 'B',
    icon: <MapPin className="h-3.5 w-3.5" aria-hidden="true" />,
  },
  {
    id: 'goal',
    label: 'Hedef',
    activeClass: 'border-ok/50 bg-ok/15 text-ok',
    cellClass: 'border-ok bg-ok/25 text-ok font-bold',
    symbol: 'H',
    icon: <Flag className="h-3.5 w-3.5" aria-hidden="true" />,
  },
  {
    id: 'erase',
    label: 'Silgi',
    activeClass: 'border-line bg-surface-2 text-fg',
    cellClass: '',
    symbol: '',
    icon: <Eraser className="h-3.5 w-3.5" aria-hidden="true" />,
  },
];

export const TOOL_BY_ID = Object.fromEntries(TOOLS.map((t) => [t.id, t])) as Record<
  CellTool,
  ToolDefinition
>;

interface LevelEditorToolbarProps {
  activeTool: CellTool;
  onSelectTool: (tool: CellTool) => void;
}

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
        {TOOLS.map((tool) => {
          const isActive = activeTool === tool.id;
          return (
            <button
              key={tool.id}
              type="button"
              role="radio"
              aria-checked={isActive}
              onClick={() => onSelectTool(tool.id)}
              className={cx(
                'flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-medium transition-colors text-left',
                isActive
                  ? tool.activeClass
                  : 'border-line bg-surface-2/40 text-muted hover:border-line hover:text-fg',
              )}
            >
              {tool.icon}
              <span className="truncate">{tool.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

