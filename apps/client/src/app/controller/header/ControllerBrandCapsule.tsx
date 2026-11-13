'use client';

import { Smartphone } from 'lucide-react';
import { cx } from '@/components/ui/primitives';
import { resolvePlayerSlotBadgeClasses } from '@/utils/controllerHeaderUtils';

interface ControllerBrandCapsuleProps {
  activeRoomCode: string;
  playerSlot: 1 | 2;
}

/**
 * Mobil kontrolcü sol üst marka başlığı, oda kodu ve oyuncu yuvası (P1/P2) kapsülü.
 */
export function ControllerBrandCapsule({
  activeRoomCode,
  playerSlot,
}: ControllerBrandCapsuleProps) {
  const badgeColorClass = resolvePlayerSlotBadgeClasses(playerSlot);

  return (
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
              badgeColorClass,
            )}
          >
            P{playerSlot}
          </span>
        </div>
      </div>
    </div>
  );
}
