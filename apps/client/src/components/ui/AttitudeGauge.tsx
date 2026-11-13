'use client';

import { useAttitudeTelemetryLoop } from '@/hooks/useAttitudeTelemetryLoop';
import { AttitudeHorizonDial } from './AttitudeHorizonDial';
import { AttitudeTelemetryColumn } from './attitude/AttitudeTelemetryColumn';
import { MiniMapRadar } from './MiniMapRadar';

export interface AttitudeGaugeProps {
  /** Labirent tahtasının genişlik/uzunluk boyutu (varsayılan 12) */
  boardSize?: number;
  /** Hedef portalının koordinatı [x, y, z] */
  goalPosition: [number, number, number];
  /** Kalan kristallerin 2B tahta üzerindeki koordinatları */
  remainingCrystals: Array<[number, number]>;
  /** Portalın kilidinin açık olup olmadığı */
  isPortalUnlocked: boolean;
  /** Çok oyunculu modun aktif olup olmadığı */
  isMultiplayer: boolean;
  /** 2B mini-harita radarının gösterilip gösterilmeyeceği */
  showMiniMap: boolean;
}

/**
 * Havacılık yapay ufuk göstergesinden (attitude indicator) esinlenen,
 * 60 FPS doğrudan DOM transformlarıyla güncellenen kokpit telemetri kümesi.
 * React yeniden render'ı tetiklemeden bilye hızı, eğim açıları ve 2B radarı gösterir.
 */
export function AttitudeGauge({
  boardSize = 12,
  goalPosition,
  remainingCrystals,
  isPortalUnlocked,
  isMultiplayer,
  showMiniMap,
}: AttitudeGaugeProps) {
  const {
    horizonRef,
    pitchTextRef,
    rollTextRef,
    speedTextRef,
    miniMapBallRef,
    miniMapBall2Ref,
  } = useAttitudeTelemetryLoop(boardSize);

  return (
    <div
      className="gm-panel pointer-events-auto flex items-center gap-4 rounded-2xl px-3.5 py-2.5 shadow-lg"
      aria-label="Canlı uçuş ve hız göstergesi"
    >
      {/* Yapay Ufuk Kadranı */}
      <AttitudeHorizonDial ref={horizonRef} />

      {/* Sayısal Telemetri Sütunu */}
      <AttitudeTelemetryColumn
        pitchRef={pitchTextRef}
        rollRef={rollTextRef}
        speedRef={speedTextRef}
      />

      {/* Kompakt 2B Canlı Radar */}
      {showMiniMap && (
        <MiniMapRadar
          ref={miniMapBallRef}
          ball2Ref={miniMapBall2Ref}
          boardSize={boardSize}
          goalPosition={goalPosition}
          remainingCrystals={remainingCrystals}
          isPortalUnlocked={isPortalUnlocked}
          isMultiplayer={isMultiplayer}
        />
      )}
    </div>
  );
}
