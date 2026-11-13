'use client';

import { RoomCardHeader } from './room/RoomCardHeader';
import { RoomCodeInput } from './room/RoomCodeInput';
import { RecentRoomsList } from './room/RecentRoomsList';
import { RoomConnectButton } from './room/RoomConnectButton';

interface ControllerRoomCardProps {
  manualRoomInput: string;
  setManualRoomInput: (val: string) => void;
  roomFormError: string | null;
  setRoomFormError: (err: string | null) => void;
  recentRooms: string[];
  activeRoomCode: string;
  onClose?: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function ControllerRoomCard({
  manualRoomInput,
  setManualRoomInput,
  roomFormError,
  setRoomFormError,
  recentRooms,
  activeRoomCode,
  onClose,
  onSubmit,
}: ControllerRoomCardProps) {
  const handleSelectRecentRoom = (roomCode: string) => {
    setManualRoomInput(roomCode);
    setRoomFormError(null);
  };

  return (
    <form
      onSubmit={onSubmit}
      className="w-full max-w-sm space-y-4 rounded-3xl border border-line bg-surface p-6"
    >
      <RoomCardHeader activeRoomCode={activeRoomCode} onClose={onClose} />

      <RoomCodeInput
        value={manualRoomInput}
        error={roomFormError}
        onChange={setManualRoomInput}
        onErrorClear={() => setRoomFormError(null)}
      />

      <RecentRoomsList
        recentRooms={recentRooms}
        onSelectRoom={handleSelectRecentRoom}
      />

      <RoomConnectButton />
    </form>
  );
}
