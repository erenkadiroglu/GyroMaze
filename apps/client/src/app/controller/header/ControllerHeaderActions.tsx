'use client';

import { ControllerHapticButton } from './actions/ControllerHapticButton';
import { ControllerThemeButton } from './actions/ControllerThemeButton';
import { ControllerRoomButton } from './actions/ControllerRoomButton';
import { ControllerConnectionBadge } from './actions/ControllerConnectionBadge';

interface ControllerHeaderActionsProps {
  isHapticEnabled: boolean;
  onToggleHaptic: () => void;
  colorScheme: 'dark' | 'light';
  onToggleColorScheme: () => void;
  activeRoomCode: string;
  isRoomEditorOpen: boolean;
  onOpenRoomEditor: () => void;
  onCloseRoomEditor: () => void;
  isControllerPaired: boolean;
  isSocketConnected: boolean;
  latencyMs: number;
}

/**
 * Mobil kontrolcü sağ üst hızlı eylem butonları (Titreşim, Tema, Kod) ve ağ bağlantı rozeti.
 */
export function ControllerHeaderActions({
  isHapticEnabled,
  onToggleHaptic,
  colorScheme,
  onToggleColorScheme,
  activeRoomCode,
  isRoomEditorOpen,
  onOpenRoomEditor,
  onCloseRoomEditor,
  isControllerPaired,
  isSocketConnected,
  latencyMs,
}: ControllerHeaderActionsProps) {
  return (
    <div className="flex items-center gap-1.5">
      <ControllerHapticButton
        isHapticEnabled={isHapticEnabled}
        onToggleHaptic={onToggleHaptic}
      />

      <ControllerThemeButton
        colorScheme={colorScheme}
        onToggleColorScheme={onToggleColorScheme}
      />

      <ControllerRoomButton
        activeRoomCode={activeRoomCode}
        isRoomEditorOpen={isRoomEditorOpen}
        onOpenRoomEditor={onOpenRoomEditor}
        onCloseRoomEditor={onCloseRoomEditor}
      />

      <ControllerConnectionBadge
        isControllerPaired={isControllerPaired}
        isSocketConnected={isSocketConnected}
        latencyMs={latencyMs}
      />
    </div>
  );
}
