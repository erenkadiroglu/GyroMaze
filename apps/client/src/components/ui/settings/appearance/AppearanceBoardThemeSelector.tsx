'use client';

import type { BoardTheme } from '@gyromaze/shared';
import { FieldLabel, Segmented } from '../../primitives';
import { BOARD_THEME_OPTIONS } from '@/utils/appearanceUtils';

interface AppearanceBoardThemeSelectorProps {
  boardTheme: BoardTheme;
  onSetBoardTheme: (theme: BoardTheme) => void;
}

/**
 * 3B sahne atmosferi (Zümrüt, Siberpunk, Kızıl Kor, Gün Işığı) tema seçici bileşeni.
 */
export function AppearanceBoardThemeSelector({
  boardTheme,
  onSetBoardTheme,
}: AppearanceBoardThemeSelectorProps) {
  return (
    <div>
      <FieldLabel>3B sahne atmosferi</FieldLabel>
      <Segmented<BoardTheme>
        label="Sahne atmosferi"
        value={boardTheme}
        options={BOARD_THEME_OPTIONS}
        onChange={onSetBoardTheme}
      />
    </div>
  );
}
