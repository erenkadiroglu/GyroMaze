'use client';

import {
  BallSkin,
  BoardTheme,
  CameraMode,
  ColorScheme,
} from '@gyromaze/shared';
import {
  SettingsSection,
  FieldLabel,
  Segmented,
  handleRadioGroupKeyDown,
} from '../primitives';
import { BALL_SKIN_OPTIONS } from '@/utils/settingsUtils';

interface SettingsAppearanceSectionProps {
  colorScheme: ColorScheme;
  onSetColorScheme: (scheme: ColorScheme) => void;
  boardTheme: BoardTheme;
  onSetBoardTheme: (theme: BoardTheme) => void;
  cameraMode: CameraMode;
  onSetCameraMode: (mode: CameraMode) => void;
  ballSkin: BallSkin;
  onSetBallSkin: (skin: BallSkin) => void;
}

export function SettingsAppearanceSection({
  colorScheme,
  onSetColorScheme,
  boardTheme,
  onSetBoardTheme,
  cameraMode,
  onSetCameraMode,
  ballSkin,
  onSetBallSkin,
}: SettingsAppearanceSectionProps) {
  return (
    <SettingsSection title="Görünüm ve sahne">
      <div>
        <FieldLabel>Renk şeması</FieldLabel>
        <Segmented<ColorScheme>
          label="Renk şeması"
          value={colorScheme}
          options={[
            { value: 'dark', label: 'Gece' },
            { value: 'light', label: 'Gündüz' },
          ]}
          onChange={onSetColorScheme}
        />
      </div>

      <div>
        <FieldLabel>3B sahne atmosferi</FieldLabel>
        <Segmented<BoardTheme>
          label="Sahne atmosferi"
          value={boardTheme}
          options={[
            { value: 'emerald', label: 'Zümrüt' },
            { value: 'cyberpunk', label: 'Siberpunk' },
            { value: 'crimson', label: 'Kızıl Kor' },
            { value: 'daylight', label: 'Gün Işığı' },
          ]}
          onChange={onSetBoardTheme}
        />
      </div>

      <div>
        <FieldLabel>Kamera açısı</FieldLabel>
        <Segmented<CameraMode>
          label="Kamera açısı"
          value={cameraMode}
          options={[
            { value: 'isometric', label: 'İzometrik' },
            { value: 'topdown', label: 'Üstten' },
            { value: 'follow', label: 'Takip' },
          ]}
          onChange={onSetCameraMode}
        />
      </div>

      <div>
        <FieldLabel>Bilye görünümü</FieldLabel>
        <div
          role="radiogroup"
          aria-label="Bilye görünümü"
          className="grid grid-cols-4 gap-1.5"
        >
          {BALL_SKIN_OPTIONS.map((skin, idx) => {
            const active = ballSkin === skin.value;
            return (
              <button
                key={skin.value}
                type="button"
                role="radio"
                aria-checked={active}
                tabIndex={active ? 0 : -1}
                onClick={() => onSetBallSkin(skin.value)}
                onKeyDown={(e) =>
                  handleRadioGroupKeyDown(
                    e,
                    idx,
                    BALL_SKIN_OPTIONS.length,
                    (nextIdx) => onSetBallSkin(BALL_SKIN_OPTIONS[nextIdx].value),
                  )
                }
                className={`flex cursor-pointer flex-col items-center gap-1.5 rounded-xl border py-2 text-xs font-medium transition-colors ${
                  active
                    ? 'border-brass bg-surface-2 text-fg'
                    : 'border-line bg-surface-2/40 text-muted hover:text-fg'
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`h-4 w-4 rounded-full ring-1 ring-line ${skin.swatchClass}`}
                />
                <span>{skin.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </SettingsSection>
  );
}

