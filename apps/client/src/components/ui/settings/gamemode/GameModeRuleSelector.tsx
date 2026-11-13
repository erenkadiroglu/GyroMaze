'use client';

import type { GameMode } from '@gyromaze/shared';
import { FieldLabel, Segmented } from '../../primitives';
import { GAME_MODE_RULE_OPTIONS } from '@/utils/gameModeSectionUtils';

interface GameModeRuleSelectorProps {
  gameMode: GameMode;
  onSetGameMode: (mode: GameMode) => void;
}

/**
 * Oyun modu kuralı (Standart vs Süreye karşı) seçici bileşeni.
 */
export function GameModeRuleSelector({
  gameMode,
  onSetGameMode,
}: GameModeRuleSelectorProps) {
  return (
    <div>
      <FieldLabel>Süre kuralı</FieldLabel>
      <Segmented<GameMode>
        label="Süre kuralı"
        value={gameMode}
        options={GAME_MODE_RULE_OPTIONS}
        onChange={onSetGameMode}
      />
    </div>
  );
}
