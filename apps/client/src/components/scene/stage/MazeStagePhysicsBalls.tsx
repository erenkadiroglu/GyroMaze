'use client';

import { type RefObject } from 'react';
import {
  RigidBody,
  BallCollider,
  type RapierRigidBody,
} from '@react-three/rapier';
import { BALL_RADIUS } from '../sceneMaterials';
import { resolveBallSpawnPosition } from '@/utils/stageUtils';

interface MazeStagePhysicsBallsProps {
  ballBodyRef: RefObject<RapierRigidBody | null>;
  ball2BodyRef: RefObject<RapierRigidBody | null>;
  startPosition: [number, number, number];
  p2SpawnOffsetX: number;
  p2SpawnOffsetZ: number;
  isMultiplayer: boolean;
  onBallCollision: (slot: 1 | 2) => void;
}

/**
 * 1. ve 2. oyuncular için sıfır zıplamalı (Y kilitli) Rapier dinamik fizik küreleri.
 */
export function MazeStagePhysicsBalls({
  ballBodyRef,
  ball2BodyRef,
  startPosition,
  p2SpawnOffsetX,
  p2SpawnOffsetZ,
  isMultiplayer,
  onBallCollision,
}: MazeStagePhysicsBallsProps) {
  const p1Spawn = resolveBallSpawnPosition(startPosition);
  const p2Spawn = resolveBallSpawnPosition(startPosition, [
    p2SpawnOffsetX,
    p2SpawnOffsetZ,
  ]);

  return (
    <>
      {/* 1. Oyuncu Dinamik Fizik Küresi (Y ekseni kilitli -> Sıfır Zıplama!) */}
      <RigidBody
        ref={ballBodyRef}
        name="ball-p1"
        type="dynamic"
        colliders={false}
        position={p1Spawn.position}
        enabledTranslations={[true, false, true]}
        enabledRotations={[false, false, false]}
        restitution={0.22}
        friction={0.08}
        ccd={true}
        onCollisionEnter={() => onBallCollision(1)}
      >
        <BallCollider args={[BALL_RADIUS]} />
      </RigidBody>

      {/* Çok Oyunculu Modda 2. Oyuncu Dinamik Fizik Küresi */}
      {isMultiplayer && (
        <RigidBody
          ref={ball2BodyRef}
          name="ball-p2"
          type="dynamic"
          colliders={false}
          position={p2Spawn.position}
          enabledTranslations={[true, false, true]}
          enabledRotations={[false, false, false]}
          restitution={0.22}
          friction={0.08}
          ccd={true}
          onCollisionEnter={() => onBallCollision(2)}
        >
          <BallCollider args={[BALL_RADIUS]} />
        </RigidBody>
      )}
    </>
  );
}

