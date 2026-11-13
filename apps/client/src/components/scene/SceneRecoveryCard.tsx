'use client';

import {
  resolveSceneRecoveryState,
  SCENE_RECOVERY_CARD_CLASS,
  SCENE_RECOVERY_TITLE_CLASS,
  SCENE_RECOVERY_MESSAGE_CLASS,
  SCENE_RECOVERY_BUTTON_CLASS,
  type SceneRecoveryVariant,
} from '@/utils/sceneRecoveryOrchestrationUtils';

export interface SceneRecoveryCardProps {
  variant?: SceneRecoveryVariant;
  revision?: number;
  onRetry: () => void;
}

/**
 * 3B WebGL Sahnesi Hata ve Bağlam Kurtarma Kartı.
 * sceneRecoveryOrchestrationUtils saf motoru üzerinden metin, stil ve ARIA özniteliklerini
 * çözümleyerek WebGL bağlam kesilmesi ve başlatma çökmelerinde kurtarma arayüzü sunar.
 */
export function SceneRecoveryCard({
  variant = 'context_lost',
  revision = 0,
  onRetry,
}: SceneRecoveryCardProps) {
  const { config, containerProps } = resolveSceneRecoveryState({
    variant,
    revision,
  });

  return (
    <div {...containerProps}>
      <div className={SCENE_RECOVERY_CARD_CLASS}>
        <h2 className={SCENE_RECOVERY_TITLE_CLASS}>{config.title}</h2>
        <p className={SCENE_RECOVERY_MESSAGE_CLASS}>{config.message}</p>
        <button
          type="button"
          onClick={onRetry}
          className={SCENE_RECOVERY_BUTTON_CLASS}
        >
          {config.buttonText}
        </button>
      </div>
    </div>
  );
}

