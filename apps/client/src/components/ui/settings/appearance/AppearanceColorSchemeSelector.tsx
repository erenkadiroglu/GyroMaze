'use client';

import type { ColorScheme } from '@gyromaze/shared';
import { FieldLabel, Segmented } from '../../primitives';
import { COLOR_SCHEME_OPTIONS } from '@/utils/appearanceUtils';

interface AppearanceColorSchemeSelectorProps {
  colorScheme: ColorScheme;
  onSetColorScheme: (scheme: ColorScheme) => void;
}

/**
 * Ayarlar modalı açık/koyu renk şeması seçici bileşeni.
 */
export function AppearanceColorSchemeSelector({
  colorScheme,
  onSetColorScheme,
}: AppearanceColorSchemeSelectorProps) {
  return (
    <div>
      <FieldLabel>Renk şeması</FieldLabel>
      <Segmented<ColorScheme>
        label="Renk şeması"
        value={colorScheme}
        options={COLOR_SCHEME_OPTIONS}
        onChange={onSetColorScheme}
      />
    </div>
  );
}
