'use client';

import { cleanRoomCode } from '@/utils/controllerUtils';

interface RoomCodeInputProps {
  value: string;
  error: string | null;
  onChange: (val: string) => void;
  onErrorClear: () => void;
}

export function RoomCodeInput({
  value,
  error,
  onChange,
  onErrorClear,
}: RoomCodeInputProps) {
  return (
    <div className="space-y-2">
      <input
        type="text"
        inputMode="text"
        autoCapitalize="characters"
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
        aria-label="6 haneli oda kodu"
        value={value}
        onChange={(e) => {
          onErrorClear();
          onChange(cleanRoomCode(e.target.value));
        }}
        placeholder="ÖRN: 84K9X2"
        className="gm-num w-full rounded-2xl border border-line bg-surface-2 px-4 py-3.5 text-center text-2xl font-semibold tracking-[0.25em] text-brass uppercase outline-none transition-colors focus:border-brass"
      />

      {error && (
        <p role="alert" className="text-xs font-medium text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

