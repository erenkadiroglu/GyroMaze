'use client';

import type { GameMode } from '@gyromaze/shared';
import { SettingsSection } from '../primitives';
import { GameModePlayerCountSelector } from './gamemode/GameModePlayerCountSelector';
import { GameModeRuleSelector } from './gamemode/GameModeRuleSelector';

interface SettingsGameModeSectionProps {
  isMultiplayer: boolean;
  onToggleMultiplayer: () => void;
  gameMode: GameMode;
  onSetGameMode: (mode: GameMode) => void;
}

/**
 * Ayarlar çekmecesi oyun modu (oyuncu sayısı ve süre kuralı) bölümü.
 */
export function SettingsGameModeSection({
  isMultiplayer,
  onToggleMultiplayer,
  gameMode,
  onSetGameMode,
}: SettingsGameModeSectionProps) {
  return (
    <SettingsSection title="Oyun modu">
      <GameModePlayerCountSelector
        isMultiplayer={isMultiplayer}
        onToggleMultiplayer={onToggleMultiplayer}
      />

      <GameModeRuleSelector
        gameMode={gameMode}
        onSetGameMode={onSetGameMode}
      />
    </SettingsSection>
  );
}
