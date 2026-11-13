'use client';

import {
  shouldShowLevelNavBanner,
  shouldShowVictoryBanner,
  shouldShowDefeatBanner,
} from '@/utils/controllerBannerUtils';
import { ControllerErrorBanner } from './banners/ControllerErrorBanner';
import { ControllerLevelNavBanner } from './banners/ControllerLevelNavBanner';
import { ControllerVictoryBanner } from './banners/ControllerVictoryBanner';
import { ControllerDefeatBanner } from './banners/ControllerDefeatBanner';

interface ControllerStatusBannersProps {
  errorMessage: string | null;
  onOpenRoomEditor: () => void;
  isControllerPaired: boolean;
  isRoomEditorOpen: boolean;
  level: number;
  remoteCrystalsCollected: number;
  remoteCrystalsTotal: number;
  gameStatus: string;
  onChangeLevel: (direction: 'next' | 'prev') => void;
  onResetBall: () => void;
}

export function ControllerStatusBanners({
  errorMessage,
  onOpenRoomEditor,
  isControllerPaired,
  isRoomEditorOpen,
  level,
  remoteCrystalsCollected,
  remoteCrystalsTotal,
  gameStatus,
  onChangeLevel,
  onResetBall,
}: ControllerStatusBannersProps) {
  const showNav = shouldShowLevelNavBanner(isControllerPaired, isRoomEditorOpen);
  const showVictory = shouldShowVictoryBanner(
    isControllerPaired,
    gameStatus,
    isRoomEditorOpen,
  );
  const showDefeat = shouldShowDefeatBanner(
    isControllerPaired,
    gameStatus,
    isRoomEditorOpen,
  );

  return (
    <>
      <ControllerErrorBanner
        errorMessage={errorMessage}
        onOpenRoomEditor={onOpenRoomEditor}
      />

      {showNav && (
        <ControllerLevelNavBanner
          level={level}
          remoteCrystalsCollected={remoteCrystalsCollected}
          remoteCrystalsTotal={remoteCrystalsTotal}
          onChangeLevel={onChangeLevel}
        />
      )}

      {showVictory && (
        <ControllerVictoryBanner onChangeLevel={onChangeLevel} />
      )}

      {showDefeat && (
        <ControllerDefeatBanner onResetBall={onResetBall} />
      )}
    </>
  );
}
