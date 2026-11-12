'use client';

import {
  RotateCcw,
  Camera,
  Sun,
  Moon,
  Volume2,
  VolumeX,
  Wrench,
  Medal,
} from 'lucide-react';
import { useGameStore } from '@/store/useGameStore';
import { formatCameraModeLabel } from '@/utils/hudUtils';
import { IconButton } from './primitives';

interface QuickControlsToolbarProps {
  onResetClick: () => void;
}

export function QuickControlsToolbar({ onResetClick }: QuickControlsToolbarProps) {
  const cameraMode = useGameStore((s) => s.cameraMode);
  const cycleCameraMode = useGameStore((s) => s.cycleCameraMode);
  const colorScheme = useGameStore((s) => s.colorScheme);
  const toggleColorScheme = useGameStore((s) => s.toggleColorScheme);
  const isSoundMuted = useGameStore((s) => s.isSoundMuted);
  const toggleSoundMuted = useGameStore((s) => s.toggleSoundMuted);
  const setEditorOpen = useGameStore((s) => s.setEditorOpen);
  const setLeaderboardOpen = useGameStore((s) => s.setLeaderboardOpen);

  const cameraModeLabel = formatCameraModeLabel(cameraMode);

  return (
    <div
      role="toolbar"
      aria-label="Hızlı sahne kontrolleri"
      className="gm-panel pointer-events-auto flex items-center gap-1 rounded-2xl p-1.5 shadow-lg"
    >
      <div role="group" aria-label="Görünüm ve ses" className="flex items-center gap-0.5">
        <IconButton
          label="Topu başa al"
          shortcut="R"
          onClick={onResetClick}
        >
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
        </IconButton>

        <IconButton
          label={`Kamera açısı: ${cameraModeLabel}`}
          shortcut="C"
          onClick={cycleCameraMode}
        >
          <Camera className="h-4 w-4" aria-hidden="true" />
        </IconButton>

        <IconButton
          label={colorScheme === 'light' ? 'Gece moduna geç' : 'Gündüz moduna geç'}
          shortcut="L"
          pressed={colorScheme === 'light'}
          onClick={toggleColorScheme}
        >
          {colorScheme === 'light' ? (
            <Sun className="h-4 w-4" aria-hidden="true" />
          ) : (
            <Moon className="h-4 w-4" aria-hidden="true" />
          )}
        </IconButton>

        <IconButton
          label={isSoundMuted ? 'Sesi aç' : 'Sesi kapat'}
          shortcut="M"
          pressed={isSoundMuted}
          onClick={toggleSoundMuted}
        >
          {isSoundMuted ? (
            <VolumeX className="h-4 w-4 text-danger" aria-hidden="true" />
          ) : (
            <Volume2 className="h-4 w-4" aria-hidden="true" />
          )}
        </IconButton>
      </div>

      <span
        role="separator"
        aria-orientation="vertical"
        className="mx-1 h-5 w-px bg-line"
      />

      <div role="group" aria-label="Araçlar" className="flex items-center gap-0.5">
        <IconButton
          label="Harita editörü"
          onClick={() => setEditorOpen(true)}
        >
          <Wrench className="h-4 w-4" aria-hidden="true" />
        </IconButton>

        <IconButton
          label="Skor tablosu"
          onClick={() => setLeaderboardOpen(true)}
        >
          <Medal className="h-4 w-4" aria-hidden="true" />
        </IconButton>
      </div>
    </div>
  );
}
