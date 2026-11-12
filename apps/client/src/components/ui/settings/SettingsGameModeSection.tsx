'use client';

import { GameMode } from '@gyromaze/shared';
import { SettingsSection, FieldLabel, Segmented } from '../primitives';

interface SettingsGameModeSectionProps {
  isMultiplayer: boolean;
  onToggleMultiplayer: () => void;
  gameMode: GameMode;
  onSetGameMode: (mode: GameMode) => void;
}

export function SettingsGameModeSection({
  isMultiplayer,
  onToggleMultiplayer,
  gameMode,
  onSetGameMode,
}: SettingsGameModeSectionProps) {
  return (
    <SettingsSection title="Oyun modu">
      <div>
        <FieldLabel>Oyuncu sayısı</FieldLabel>
        <Segmented<'solo' | 'duo'>
          label="Oyuncu sayısı"
          value={isMultiplayer ? 'duo' : 'solo'}
          options={[
            { value: 'solo', label: '1 Oyuncu' },
            { value: 'duo', label: '2 Oyuncu (1v1)' },
          ]}
          onChange={(val) => {
            if ((val === 'duo') !== isMultiplayer) onToggleMultiplayer();
          }}
        />
        {isMultiplayer && (
          <p className="mt-2 text-xs leading-relaxed text-muted">
            2. oyuncu aynı oda koduna katılıp telefonundan{' '}
            <strong className="text-fg">Oyuncu 2</strong> yuvasını seçebilir ya
            da masaüstünde <strong className="text-fg">Yön Tuşları</strong>{' '}
            ile oynayabilir.
          </p>
        )}
      </div>

      <div>
        <FieldLabel>Süre kuralı</FieldLabel>
        <Segmented<GameMode>
          label="Süre kuralı"
          value={gameMode}
          options={[
            { value: 'standard', label: 'Standart' },
            {
              value: 'time_attack',
              label: 'Süreye karşı',
              hint: 'Bölüm süresi dolmadan kristalleri toplayıp çıkışı bul',
            },
          ]}
          onChange={onSetGameMode}
        />
      </div>
    </SettingsSection>
  );
}

