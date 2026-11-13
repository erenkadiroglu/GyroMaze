'use client';

import { formatRecentRoomAriaLabel } from '@/utils/roomCardUtils';

interface RecentRoomsListProps {
  recentRooms: string[];
  onSelectRoom: (roomCode: string) => void;
}

export function RecentRoomsList({
  recentRooms,
  onSelectRoom,
}: RecentRoomsListProps) {
  if (recentRooms.length === 0) return null;

  return (
    <div className="space-y-1.5 pt-1 text-left">
      <span className="text-[11px] font-medium text-muted">
        Son bağlandığın odalar:
      </span>
      <div className="flex flex-wrap gap-1.5">
        {recentRooms.map((roomCode) => (
          <button
            key={roomCode}
            type="button"
            onClick={() => onSelectRoom(roomCode)}
            aria-label={formatRecentRoomAriaLabel(roomCode)}
            className="gm-num cursor-pointer rounded-lg border border-line bg-surface-2 px-2.5 py-1 text-xs font-mono font-semibold tracking-wider text-brass transition-all hover:border-brass/60 active:scale-95"
          >
            {roomCode}
          </button>
        ))}
      </div>
    </div>
  );
}

