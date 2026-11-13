'use client';

import {
  Wifi,
  WifiOff,
  KeyRound,
  Sun,
  Moon,
  Activity,
} from 'lucide-react';
import { cx } from '@/components/ui/primitives';
import { resolveControllerConnectionBadge } from '@/utils/controllerUtils';
import {
  resolveHapticButtonLabel,
  resolveRoomCodeButtonLabel,
  resolveConnectionAriaLabel,
} from '@/utils/controllerHeaderUtils';

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
  const connectionBadge = resolveControllerConnectionBadge(
    isControllerPaired,
    isSocketConnected,
    latencyMs,
  );
  const hapticLabels = resolveHapticButtonLabel(isHapticEnabled);
  const roomButtonLabel = resolveRoomCodeButtonLabel(activeRoomCode);
  const connectionAriaLabel = resolveConnectionAriaLabel(
    isControllerPaired,
    isSocketConnected,
    latencyMs,
  );

  return (
    <div className="flex items-center gap-1.5">
      <button
        type="button"
        onClick={onToggleHaptic}
        aria-label={hapticLabels.ariaLabel}
        title={hapticLabels.title}
        className={cx(
          'flex min-h-[40px] min-w-[40px] cursor-pointer items-center justify-center rounded-xl border border-line bg-surface-2 active:scale-95',
          isHapticEnabled ? 'text-brass' : 'text-muted/50 opacity-60',
        )}
      >
        <Activity className="h-4 w-4" aria-hidden="true" />
      </button>

      <button
        type="button"
        onClick={onToggleColorScheme}
        aria-label={colorScheme === 'light' ? 'Gece moduna geç' : 'Gündüz moduna geç'}
        className="flex min-h-[40px] min-w-[40px] cursor-pointer items-center justify-center rounded-xl border border-line bg-surface-2 active:scale-95"
      >
        {colorScheme === 'light' ? (
          <Sun className="h-4 w-4 text-brass" aria-hidden="true" />
        ) : (
          <Moon className="h-4 w-4 text-signal" aria-hidden="true" />
        )}
      </button>

      <button
        type="button"
        onClick={() => {
          if (isRoomEditorOpen) {
            onCloseRoomEditor();
          } else {
            onOpenRoomEditor();
          }
        }}
        className="flex min-h-[40px] cursor-pointer items-center gap-1.5 rounded-xl border border-line bg-surface-2 px-3 text-xs font-medium text-fg active:scale-95"
      >
        <KeyRound className="h-3.5 w-3.5 text-brass" aria-hidden="true" />
        <span>{roomButtonLabel}</span>
      </button>

      <div
        aria-label={connectionAriaLabel}
        className="flex min-h-[40px] items-center gap-1.5 rounded-xl border border-line bg-surface-2 px-3 text-xs font-semibold"
      >
        {connectionBadge.state === 'paired' ? (
          <>
            <Wifi className="h-3.5 w-3.5 text-ok" aria-hidden="true" />
            <span className="text-ok">Bağlı</span>
            {latencyMs > 0 && (
              <span className={cx('gm-num font-mono text-[11px]', connectionBadge.latencyClass)}>
                {latencyMs}ms
              </span>
            )}
          </>
        ) : connectionBadge.state === 'ready' ? (
          <>
            <span className="h-2 w-2 rounded-full bg-brass" aria-hidden="true" />
            <span className="text-brass">Hazır</span>
          </>
        ) : (
          <>
            <WifiOff className="h-3.5 w-3.5 text-danger" aria-hidden="true" />
            <span className="text-danger">Kopuk</span>
          </>
        )}
      </div>
    </div>
  );
}
