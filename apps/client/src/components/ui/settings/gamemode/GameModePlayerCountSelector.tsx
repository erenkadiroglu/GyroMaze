'use client';

import { FieldLabel, Segmented } from '../../primitives';
import {
  PLAYER_COUNT_OPTIONS,
  PlayerCountValue,
  resolvePlayerCountValue,
} from '@/utils/gameModeSectionUtils';

interface GameModePlayerCountSelectorProps {
  isMultiplayer: boolean;
  onToggleMultiplayer: () => void;
}

/**
 * 1 Oyuncu (solo) ve 2 Oyuncu (1v1 duo) seçici bileşeni ve yardım açıklaması.
 */
export function GameModePlayerCountSelector({
  isMultiplayer,
  onToggleMultiplayer,
}: GameModePlayerCountSelectorProps) {
  const activeValue = resolvePlayerCountValue(isMultiplayer);

  return (
    <div>
      <FieldLabel>Oyuncu sayısı</FieldLabel>
      <Segmented<PlayerCountValue>
        label="Oyuncu sayısı"
        value={activeValue}
        options={PLAYER_COUNT_OPTIONS}
        onChange={(val) => {
          if ((val === 'duo') !== isMultiplayer) onToggleMultiplayer();
        }}
      />
      {isMultiplayer && (
        <p className="mt-2 text-xs leading-relaxed text-muted">
          2. oyuncu aynı oda koduna katılıp telefonundan{' '}
          <strong className="text-fg">Oyuncu 2</strong> yuvasını seçebilir ya
          da masaüstünde <strong className="text-fg">Yön Tuşları</strong> ile
          oynayabilir.
        </p>
      )}
    </div>
  );
}
