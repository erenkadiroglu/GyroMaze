'use client';

import { GimbalModeSelector } from './selectors/GimbalModeSelector';
import { GimbalSensitivitySelector } from './selectors/GimbalSensitivitySelector';
import { GimbalSlotSelector } from './selectors/GimbalSlotSelector';

interface GimbalControlSelectorsProps {
  controllerTouchOverride: boolean;
  onToggleTouchOverride: (touch: boolean) => void;
  controllerSensitivity: 0.75 | 1 | 1.35;
  onSelectSensitivity: (mult: 0.75 | 1 | 1.35) => void;
  playerSlot: 1 | 2;
  onSelectSlot: (slot: 1 | 2) => void;
}

/**
 * Kontrol modu (Jiroskop/Dokunmatik), hassasiyet çarpanı ve oyuncu yuvası radyo buton grupları.
 */
export function GimbalControlSelectors({
  controllerTouchOverride,
  onToggleTouchOverride,
  controllerSensitivity,
  onSelectSensitivity,
  playerSlot,
  onSelectSlot,
}: GimbalControlSelectorsProps) {
  return (
    <>
      <GimbalModeSelector
        controllerTouchOverride={controllerTouchOverride}
        onToggleTouchOverride={onToggleTouchOverride}
      />
      <GimbalSensitivitySelector
        controllerSensitivity={controllerSensitivity}
        onSelectSensitivity={onSelectSensitivity}
      />
      <GimbalSlotSelector
        playerSlot={playerSlot}
        onSelectSlot={onSelectSlot}
      />
    </>
  );
}
