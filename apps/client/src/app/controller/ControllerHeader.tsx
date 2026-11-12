'use client';

import {
  Smartphone,
  Wifi,
  WifiOff,
  KeyRound,
  Sun,
  Moon,
  Activity,
} from 'lucide-react';
import { cx } from '@/components/ui/primitives';
import { resolveControllerConnectionBadge } from '@/utils/controllerUtils';

interface ControllerHeaderProps {
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

export function ControllerHeader({
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
}: ControllerHeaderProps) {
  const connectionBadge = resolveControllerConnectionBadge(
    isControllerPaired,
    isSocketConnected,
    latencyMs,
  );

  return (
    <header className="flex items-center justify-between gap-2 rounded-2xl border border-line bg-surface px-3.5 py-2.5">
      <div className="flex items-center gap-2.5">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-brass/30 bg-brass/10 text-brass">
          <Smartphone className="h-4 w-4" aria-hidden="true" />
        </div>
        <div>
          <h1 className="text-sm leading-tight font-semibold">GyroMaze</h1>
          <div className="flex items-center gap-1.5 text-xs text-muted">
            <span>Oda:</span>
            <span className="gm-num font-semibold tracking-wider text-brass">
              {activeRoomCode || 'Yok'}
            </span>
            <span
              className={cx(
                'gm-num rounded-md border px-1.5 py-0.5 text-[10px] font-semibold',
                playerSlot === 2
                  ? 'border-warn/40 bg-warn/10 text-warn'
                  : 'border-brass/40 bg-brass/10 text-brass',
              )}
            >
              P{playerSlot}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={onToggleHaptic}
          aria-label={isHapticEnabled ? 'Titreşimi kapat' : 'Titreşimi aç'}
          title={isHapticEnabled ? 'Titreşim açık' : 'Titreşim kapalı'}
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
          <span>{activeRoomCode ? 'Kod' : 'Kod gir'}</span>
        </button>

        <div
          aria-label={
            isControllerPaired
              ? `Bağlantı durumu: Bağlı (${latencyMs}ms)`
              : isSocketConnected
                ? 'Bağlantı durumu: Hazır'
                : 'Bağlantı durumu: Kopuk'
          }
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
    </header>
  );
}
