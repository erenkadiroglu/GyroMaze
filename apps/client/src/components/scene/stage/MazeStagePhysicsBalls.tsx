'use client';

import { type RefObject } from 'react';
import {
  RigidBody,
  BallCollider,
  type RapierRigidBody,
} from '@react-three/rapier';
import { useMazeStagePhysicsBalls } from '@/hooks/useMazeStagePhysicsBalls';

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
  const {
    p1BallConfig,
    p2BallConfig,
    handleP1Collision,
    handleP2Collision,
  } = useMazeStagePhysicsBalls({
    startPosition,
    p2SpawnOffsetX,
    p2SpawnOffsetZ,
    isMultiplayer,
    onBallCollision,
  });

  return (
    <>
      {/* 1. Oyuncu Dinamik Fizik Küresi (Y ekseni kilitli -> Sıfır Zıplama!) */}
      <RigidBody
        ref={ballBodyRef}
        name={p1BallConfig.name}
        type={p1BallConfig.type}
        colliders={p1BallConfig.colliders}
        position={p1BallConfig.position}
        enabledTranslations={p1BallConfig.enabledTranslations}
        enabledRotations={p1BallConfig.enabledRotations}
        restitution={p1BallConfig.restitution}
        friction={p1BallConfig.friction}
        ccd={p1BallConfig.ccd}
        onCollisionEnter={handleP1Collision}
      >
        <BallCollider args={[p1BallConfig.colliderRadius]} />
      </RigidBody>

      {/* Çok Oyunculu Modda 2. Oyuncu Dinamik Fizik Küresi */}
      {isMultiplayer && (
        <RigidBody
          ref={ball2BodyRef}
          name={p2BallConfig.name}
          type={p2BallConfig.type}
          colliders={p2BallConfig.colliders}
          position={p2BallConfig.position}
          enabledTranslations={p2BallConfig.enabledTranslations}
          enabledRotations={p2BallConfig.enabledRotations}
          restitution={p2BallConfig.restitution}
          friction={p2BallConfig.friction}
          ccd={p2BallConfig.ccd}
          onCollisionEnter={handleP2Collision}
        >
          <BallCollider args={[p2BallConfig.colliderRadius]} />
        </RigidBody>
      )}
    </>
  );
}
