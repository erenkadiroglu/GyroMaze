'use client';

import { KeyRound } from 'lucide-react';
import { resolveRoomCodeButtonLabel } from '@/utils/controllerHeaderUtils';

interface ControllerRoomButtonProps {
  activeRoomCode: string;
  isRoomEditorOpen: boolean;
  onOpenRoomEditor: () => void;
  onCloseRoomEditor: () => void;
}

/**
 * Mobil kontrolcü oda kodu düzenleyicisi açma/kapatma eylem butonu.
 */
export function ControllerRoomButton({
  activeRoomCode,
  isRoomEditorOpen,
  onOpenRoomEditor,
  onCloseRoomEditor,
}: ControllerRoomButtonProps) {
  const roomButtonLabel = resolveRoomCodeButtonLabel(activeRoomCode);

  return (
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
  );
}
