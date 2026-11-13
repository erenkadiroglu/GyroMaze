'use client';

import type { MazeLevelDefinition } from './mazeLevels';
import { MazeStageWalls } from './MazeStageWalls';
import { MazeStageHazards } from './MazeStageHazards';
import { MazeStageCollectibles } from './MazeStageCollectibles';
import { MazeStageActors } from './MazeStageActors';
import { MazeStageColliders } from './MazeStageColliders';
import { MazeStageBoardBase } from './stage/MazeStageBoardBase';
import { MazeStagePhysicsBalls } from './stage/MazeStagePhysicsBalls';
import { useMazeStageOrchestration } from '@/hooks/useMazeStageOrchestration';

export interface MazeStageProps {
  levelData: MazeLevelDefinition;
  isGoalUnlocked: boolean;
  collectedCrystals: number[];
  ghostPath?: Array<[number, number]>;
  onCollectCrystal: (idx: number) => void;
  onReachGoal: (runPath: Array<[number, number]>, winnerSlot?: 1 | 2) => void;
  onFallIntoHole: (slot: 1 | 2) => void;
  onLaserHit: (slot: 1 | 2) => void;
  onBoostHit: (slot: 1 | 2) => void;
  onTeleportHit: (slot: 1 | 2) => void;
  onWallHit: (speed: number, slot: 1 | 2) => void;
}

/**
 * Zıplamasız (Zero-Bounce), Enerji Kristalli, Lazer Kapılı, Hızlandırma Rampalı, Kuantum Portallı ve Hayalet Yarışçılı 3B Labirent Sahnesi.
 */
export function MazeStage(props: MazeStageProps) {
  const {
    outerWalls,
    levelRevisionKey,
    p2SpawnOffsetX,
    p2SpawnOffsetZ,
    isLightBoard,
    isMultiplayer,
    ballBodyRef,
    ball2BodyRef,
    visualTiltGroupRef,
    visualBallMeshRef,
    visualBall2MeshRef,
    ghostBallMeshRef,
    goalRingRef,
    crystalMeshesRef,
    laserBeamMeshesRef,
    movingObstacleMeshesRef,
    trailMeshesRef,
    runPathRef,
    runPathP2Ref,
    lastHoleHitMsRef,
    resetSingleBall,
    resetBallAndBoard,
    handleBallCollision,
  } = useMazeStageOrchestration(props);

  const {
    levelData,
    isGoalUnlocked,
    collectedCrystals,
    onReachGoal,
    onFallIntoHole,
  } = props;

  return (
    <>
      {/* 1. SABİT FİZİK ÇARPIŞTIRICILARI (TAHTA-YEREL UZAY) */}
      <MazeStageColliders
        levelRevisionKey={levelRevisionKey}
        levelData={levelData}
        outerWalls={outerWalls}
        runPathRef={runPathRef}
        runPathP2Ref={runPathP2Ref}
        lastHoleHitMsRef={lastHoleHitMsRef}
        isMultiplayer={isMultiplayer}
        ballBodyRef={ballBodyRef}
        ball2BodyRef={ball2BodyRef}
        onReachGoal={onReachGoal}
        onFallIntoHole={onFallIntoHole}
        resetSingleBall={resetSingleBall}
        resetBallAndBoard={resetBallAndBoard}
      />

      {/* 1. ve 2. Oyuncu Dinamik Fizik Küreleri (Y ekseni kilitli -> Sıfır Zıplama!) */}
      <MazeStagePhysicsBalls
        ballBodyRef={ballBodyRef}
        ball2BodyRef={ball2BodyRef}
        startPosition={levelData.startPosition}
        p2SpawnOffsetX={p2SpawnOffsetX}
        p2SpawnOffsetZ={p2SpawnOffsetZ}
        isMultiplayer={isMultiplayer}
        onBallCollision={handleBallCollision}
      />

      {/* 2. GÖRSEL 3B SAHNE GRUBU */}
      <group ref={visualTiltGroupRef}>
        {/* Tahta Tabanı ve Izgara Yardımcısı */}
        <MazeStageBoardBase
          boardSize={levelData.boardSize}
          isLightBoard={isLightBoard}
        />

        {/* İç ve Dış Duvarlar */}
        <MazeStageWalls
          levelRevisionKey={levelRevisionKey}
          outerWalls={outerWalls}
          innerWalls={levelData.innerWalls}
        />

        {/* Tehlikeler ve Kinetik Engeller */}
        <MazeStageHazards
          levelRevisionKey={levelRevisionKey}
          voidHoles={levelData.voidHoles}
          boostPads={levelData.boostPads}
          teleporters={levelData.teleporters}
          laserGates={levelData.laserGates}
          movingObstacles={levelData.movingObstacles}
          laserBeamMeshesRef={laserBeamMeshesRef}
          movingObstacleMeshesRef={movingObstacleMeshesRef}
        />

        {/* Toplanabilirler, Başlangıç Halkası ve Hedef Portalı */}
        <MazeStageCollectibles
          levelRevisionKey={levelRevisionKey}
          startPosition={levelData.startPosition}
          goalPosition={levelData.goalPosition}
          crystals={levelData.crystals}
          collectedCrystals={collectedCrystals}
          isGoalUnlocked={isGoalUnlocked}
          crystalMeshesRef={crystalMeshesRef}
          goalRingRef={goalRingRef}
        />

        {/* Bilyeler, Hayalet Yarışçı ve Hareket İzi */}
        <MazeStageActors
          startPosition={levelData.startPosition}
          p2SpawnOffsetX={p2SpawnOffsetX}
          p2SpawnOffsetZ={p2SpawnOffsetZ}
          trailMeshesRef={trailMeshesRef}
          ghostBallMeshRef={ghostBallMeshRef}
          visualBallMeshRef={visualBallMeshRef}
          visualBall2MeshRef={visualBall2MeshRef}
        />
      </group>
    </>
  );
}
