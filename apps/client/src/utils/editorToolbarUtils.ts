import { createElement, type ReactNode } from 'react';
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
import type { CellTool } from './editorUtils.ts';

export interface ToolDefinition {
  id: CellTool;
  label: string;
  activeClass: string;
  cellClass: string;
  symbol: string;
  icon: ReactNode;
}

export const TOOLS: ToolDefinition[] = [
  {
    id: 'wall',
    label: 'Duvar',
    activeClass: 'border-fg/40 bg-surface-2 text-fg',
    cellClass: 'border-muted/50 bg-muted/30 text-fg',
    symbol: '■',
    icon: createElement(Box, { className: 'h-3.5 w-3.5', 'aria-hidden': 'true' }),
  },
  {
    id: 'hole',
    label: 'Delik',
    activeClass: 'border-danger/50 bg-danger/15 text-danger',
    cellClass: 'border-danger/60 bg-danger/20 text-danger',
    symbol: '●',
    icon: createElement(CircleDot, { className: 'h-3.5 w-3.5', 'aria-hidden': 'true' }),
  },
  {
    id: 'crystal',
    label: 'Kristal',
    activeClass: 'border-signal/50 bg-signal/15 text-signal',
    cellClass: 'border-signal/60 bg-signal/20 text-signal',
    symbol: '◆',
    icon: createElement(Gem, { className: 'h-3.5 w-3.5', 'aria-hidden': 'true' }),
  },
  {
    id: 'laser',
    label: 'Lazer',
    activeClass: 'border-warn/50 bg-warn/15 text-warn',
    cellClass: 'border-warn/60 bg-warn/20 text-warn',
    symbol: '⚡',
    icon: createElement(Zap, { className: 'h-3.5 w-3.5', 'aria-hidden': 'true' }),
  },
  {
    id: 'boost',
    label: 'Hız rampası',
    activeClass: 'border-brass/50 bg-brass/15 text-brass',
    cellClass: 'border-brass/60 bg-brass/20 text-brass',
    symbol: '▲',
    icon: createElement(Play, { className: 'h-3.5 w-3.5', 'aria-hidden': 'true' }),
  },
  {
    id: 'moving',
    label: 'Devriye engel',
    activeClass: 'border-warn/50 bg-warn/15 text-warn',
    cellClass: 'border-warn/60 bg-warn/20 text-warn',
    symbol: '↔',
    icon: createElement(Activity, { className: 'h-3.5 w-3.5', 'aria-hidden': 'true' }),
  },
  {
    id: 'portal',
    label: 'Portal (çift)',
    activeClass: 'border-signal/50 bg-signal/15 text-signal',
    cellClass: 'border-signal/60 bg-signal/20 text-signal font-bold',
    symbol: '◎',
    icon: createElement(Orbit, { className: 'h-3.5 w-3.5', 'aria-hidden': 'true' }),
  },
  {
    id: 'start',
    label: 'Başlangıç',
    activeClass: 'border-signal/50 bg-signal/15 text-signal',
    cellClass: 'border-signal bg-signal/25 text-signal font-bold',
    symbol: 'B',
    icon: createElement(MapPin, { className: 'h-3.5 w-3.5', 'aria-hidden': 'true' }),
  },
  {
    id: 'goal',
    label: 'Hedef',
    activeClass: 'border-ok/50 bg-ok/15 text-ok',
    cellClass: 'border-ok bg-ok/25 text-ok font-bold',
    symbol: 'H',
    icon: createElement(Flag, { className: 'h-3.5 w-3.5', 'aria-hidden': 'true' }),
  },
  {
    id: 'erase',
    label: 'Silgi',
    activeClass: 'border-line bg-surface-2 text-fg',
    cellClass: '',
    symbol: '',
    icon: createElement(Eraser, { className: 'h-3.5 w-3.5', 'aria-hidden': 'true' }),
  },
];

export const TOOL_BY_ID = Object.fromEntries(
  TOOLS.map((t) => [t.id, t]),
) as Record<CellTool, ToolDefinition>;

/**
 * Belirtilen kimliğe sahip araç tanımını döner.
 */
export function getToolDefinition(id: CellTool): ToolDefinition {
  return TOOL_BY_ID[id] ?? TOOL_BY_ID.wall;
}

/**
 * Aracın aktif olup olmadığını denetler.
 */
export function isToolActive(activeTool: CellTool, toolId: CellTool): boolean {
  return activeTool === toolId;
}

/**
 * Araç butonunun Tailwind sınıf kombinasyonunu belirler.
 */
export function resolveToolButtonClass(
  tool: ToolDefinition,
  isActive: boolean,
): string {
  const base =
    'flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-medium transition-colors text-left cursor-pointer';
  if (isActive) {
    return `${base} ${tool.activeClass}`;
  }
  return `${base} border-line bg-surface-2/40 text-muted hover:border-line hover:text-fg`;
}
