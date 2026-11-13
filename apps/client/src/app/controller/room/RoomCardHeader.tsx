'use client';

import { KeyRound, X } from 'lucide-react';
import { shouldShowCloseButton } from '@/utils/roomCardUtils';

interface RoomCardHeaderProps {
  activeRoomCode: string;
  onClose?: () => void;
}

export function RoomCardHeader({ activeRoomCode, onClose }: RoomCardHeaderProps) {
  const showClose = shouldShowCloseButton(activeRoomCode, Boolean(onClose));

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2.5">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-brass/30 bg-brass/10 text-brass">
          <KeyRound className="h-4 w-4" aria-hidden="true" />
        </div>
        <div>
          <h2 className="text-base font-semibold">Oda kodu ile bağlan</h2>
          <p className="text-xs text-muted">Masaüstündeki 6 haneli kodu yaz</p>
        </div>
      </div>
      {showClose && onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Oda kodu düzenlemeyi kapat"
          className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border border-line bg-surface-2 text-muted transition-colors hover:text-foreground active:scale-95"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}

