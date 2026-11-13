'use client';

import { useControllerStatusBanners } from '@/hooks/useControllerStatusBanners';
import { ControllerErrorBanner } from './banners/ControllerErrorBanner';
import { ControllerLevelNavBanner } from './banners/ControllerLevelNavBanner';
import { ControllerVictoryBanner } from './banners/ControllerVictoryBanner';
import { ControllerDefeatBanner } from './banners/ControllerDefeatBanner';

export interface ControllerStatusBannersProps {
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

/**
 * Mobil kontrolcü ekranındaki hata, bölüm gezinme, zafer ve süre dolumu şeritlerini
 * tekil ve erişilebilir bir bildirim bölgesinde sunan orkestratör bileşen.
 */
export function ControllerStatusBanners(props: ControllerStatusBannersProps) {
  const {
    state,
    errorMessage,
    onOpenRoomEditor,
    level,
    remoteCrystalsCollected,
    remoteCrystalsTotal,
    onChangeLevel,
    onResetBall,
  } = useControllerStatusBanners(props);

  const { visibility, containerProps } = state;

  return (
    <div {...containerProps}>
      <ControllerErrorBanner
        errorMessage={errorMessage}
        onOpenRoomEditor={onOpenRoomEditor}
      />

      {visibility.showNav && (
        <ControllerLevelNavBanner
          level={level}
          remoteCrystalsCollected={remoteCrystalsCollected}
          remoteCrystalsTotal={remoteCrystalsTotal}
          onChangeLevel={onChangeLevel}
        />
      )}

      {visibility.showVictory && (
        <ControllerVictoryBanner onChangeLevel={onChangeLevel} />
      )}

      {visibility.showDefeat && (
        <ControllerDefeatBanner onResetBall={onResetBall} />
      )}
    </div>
  );
}
