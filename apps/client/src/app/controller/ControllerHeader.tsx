'use client';

import { useControllerHeader } from '@/hooks/useControllerHeader';
import { ControllerBrandCapsule } from './header/ControllerBrandCapsule';
import { ControllerHeaderActions } from './header/ControllerHeaderActions';

export interface ControllerHeaderProps {
  activeRoomCode: string;
  playerSlot: 1 | 2;
  isHapticEnabled: boolean;
  onToggleHaptic: () => void;
  colorScheme: 'dark' | 'light';
  onToggleColorScheme: () => void;
  isRoomEditorOpen: boolean;
  onOpenRoomEditor: () => void;
  onCloseRoomEditor: () => void;
  isControllerPaired: boolean;
  isSocketConnected: boolean;
  latencyMs: number;
}

/**
 * Mobil kontrolcü üst başlık çubuğu: sol tarafta marka ve oda kodu,
 * sağ tarafta hızlı eylemler ve bağlantı durumu.
 */
export function ControllerHeader(props: ControllerHeaderProps) {
  const {
    containerProps,
    activeRoomCode,
    playerSlot,
    isHapticEnabled,
    onToggleHaptic,
    colorScheme,
    onToggleColorScheme,
    isRoomEditorOpen,
    onOpenRoomEditor,
    onCloseRoomEditor,
    isControllerPaired,
    isSocketConnected,
    latencyMs,
  } = useControllerHeader(props);

  return (
    <header {...containerProps}>
      <ControllerBrandCapsule
        activeRoomCode={activeRoomCode}
        playerSlot={playerSlot}
      />

      <ControllerHeaderActions
        isHapticEnabled={isHapticEnabled}
        onToggleHaptic={onToggleHaptic}
        colorScheme={colorScheme}
        onToggleColorScheme={onToggleColorScheme}
        activeRoomCode={activeRoomCode}
        isRoomEditorOpen={isRoomEditorOpen}
        onOpenRoomEditor={onOpenRoomEditor}
        onCloseRoomEditor={onCloseRoomEditor}
        isControllerPaired={isControllerPaired}
        isSocketConnected={isSocketConnected}
        latencyMs={latencyMs}
      />
    </header>
  );
}
