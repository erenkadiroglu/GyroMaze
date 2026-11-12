'use client';

import { KeyRound, X, ArrowRight } from 'lucide-react';
import { cleanRoomCode } from '@/utils/controllerUtils';

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
  return (
    <form
      onSubmit={onSubmit}
      className="w-full max-w-sm space-y-4 rounded-3xl border border-line bg-surface p-6"
    >
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
        {activeRoomCode && onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Oda kodu düzenlemeyi kapat"
            className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border border-line bg-surface-2 text-muted"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
      </div>

      <input
        type="text"
        inputMode="text"
        autoCapitalize="characters"
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
        aria-label="6 haneli oda kodu"
        value={manualRoomInput}
        onChange={(e) => {
          setRoomFormError(null);
          setManualRoomInput(cleanRoomCode(e.target.value));
        }}
        placeholder="ÖRN: 84K9X2"
        className="gm-num w-full rounded-2xl border border-line bg-surface-2 px-4 py-3.5 text-center text-2xl font-semibold tracking-[0.25em] text-brass uppercase outline-none focus:border-brass"
      />

      {roomFormError && (
        <p role="alert" className="text-xs font-medium text-danger">
          {roomFormError}
        </p>
      )}

      {recentRooms.length > 0 && (
        <div className="space-y-1.5 pt-1 text-left">
          <span className="text-[11px] font-medium text-muted">
            Son bağlandığın odalar:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {recentRooms.map((roomCode) => (
              <button
                key={roomCode}
                type="button"
                onClick={() => {
                  setManualRoomInput(roomCode);
                  setRoomFormError(null);
                }}
                className="gm-num cursor-pointer rounded-lg border border-line bg-surface-2 px-2.5 py-1 text-xs font-mono font-semibold tracking-wider text-brass hover:border-brass/60 active:scale-95"
              >
                {roomCode}
              </button>
            ))}
          </div>
        </div>
      )}

      <button
        type="submit"
        className="flex min-h-[48px] w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-brass text-sm font-semibold text-brass-fg active:scale-[0.98]"
      >
        <span>Odaya bağlan</span>
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </button>
    </form>
  );
}

