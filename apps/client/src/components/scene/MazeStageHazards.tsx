'use client';

import { MutableRefObject } from 'react';
import * as THREE from 'three';
import type {
  VoidHoleDefinition,
  BoostPadDefinition,
  TeleporterPairDefinition,
  LaserGateDefinition,
  MovingObstacleDefinition,
} from './mazeLevels';
import {
  calculateLaserGateGeometry,
  calculateBoostYaw,
} from '../../utils/sceneGeometry.ts';
import {
  _holeCoreMaterial,
  _holeRingMaterial,
  _boostBaseMaterial,
  _boostArrowMaterial,
  _teleporterRingMaterial,
  _teleporterCoreMaterial,
  _laserPillarMaterial,
  _laserBeamMaterial,
  _movingObstacleMaterial,
} from './sceneMaterials';

interface MazeStageHazardsProps {
  levelRevisionKey: string;
  voidHoles: VoidHoleDefinition[];
  boostPads?: BoostPadDefinition[];
  teleporters?: TeleporterPairDefinition[];
  laserGates: LaserGateDefinition[];
  movingObstacles?: MovingObstacleDefinition[];
  laserBeamMeshesRef: MutableRefObject<Array<THREE.Mesh | null>>;
  movingObstacleMeshesRef: MutableRefObject<Array<THREE.Mesh | null>>;
}

/**
 * 3B Labirent sahnesi tehlikeleri ve dinamik alanları:
 * Tuzak delikleri, hızlandırma rampaları, kuantum portalları, lazer kapıları ve kinetik hareketli engeller.
 */
export function MazeStageHazards({
  levelRevisionKey,
  voidHoles,
  boostPads,
  teleporters,
  laserGates,
  movingObstacles,
  laserBeamMeshesRef,
  movingObstacleMeshesRef,
}: MazeStageHazardsProps) {
  return (
    <>
      {/* Tuzak Delikleri */}
      {voidHoles.map((hole, idx) => {
        const r = hole.radius ?? 0.42;
        return (
          <group
            key={`vis-hole-${levelRevisionKey}-${idx}`}
            position={[hole.position[0], 0.02, hole.position[1]]}
          >
            <mesh rotation={[-Math.PI / 2, 0, 0]} material={_holeCoreMaterial}>
              <circleGeometry args={[r, 24]} />
            </mesh>
            <mesh
              rotation={[-Math.PI / 2, 0, 0]}
              position={[0, 0.005, 0]}
              material={_holeRingMaterial}
            >
              <ringGeometry args={[r * 0.82, r * 1.08, 24]} />
            </mesh>
          </group>
        );
      })}

      {/* Kinetik Hızlandırma Rampaları (Boost Pads) */}
      {(boostPads ?? []).map((pad, idx) => {
        const [bx, bz] = pad.position;
        const yawAngle = calculateBoostYaw(pad.direction);
        return (
          <group
            key={`boost-${levelRevisionKey}-${idx}`}
            position={[bx, 0.02, bz]}
            rotation={[0, yawAngle, 0]}
          >
            <mesh
              rotation={[-Math.PI / 2, 0, 0]}
              material={_boostBaseMaterial}
            >
              <planeGeometry args={[0.85, 1.1]} />
            </mesh>
            <mesh
              position={[0, 0.02, 0.12]}
              rotation={[Math.PI / 2, 0, 0]}
              material={_boostArrowMaterial}
            >
              <coneGeometry args={[0.24, 0.48, 3]} />
            </mesh>
          </group>
        );
      })}

      {/* Çift Yönlü Kuantum Işınlanma Portalları (Teleporters) */}
      {(teleporters ?? []).map((pair, idx) =>
        [pair.entry, pair.exit].map(([tx, tz], subIdx) => (
          <group
            key={`teleporter-${levelRevisionKey}-${idx}-${subIdx}`}
            position={[tx, 0.025, tz]}
          >
            <mesh
              rotation={[-Math.PI / 2, 0, 0]}
              material={_teleporterRingMaterial}
            >
              <ringGeometry args={[0.28, 0.44, 24]} />
            </mesh>
            <mesh
              rotation={[-Math.PI / 2, 0, 0]}
              position={[0, -0.005, 0]}
              material={_teleporterCoreMaterial}
            >
              <circleGeometry args={[0.28, 20]} />
            </mesh>
          </group>
        )),
      )}

      {/* Periyodik Lazer Kapılar */}
      {laserGates.map((gate, idx) => {
        const { p1, p2, beamSize } = calculateLaserGateGeometry(gate);
        const [gx, gz] = gate.position;

        return (
          <group key={`laser-${levelRevisionKey}-${idx}`}>
            <mesh position={p1} material={_laserPillarMaterial}>
              <cylinderGeometry args={[0.1, 0.12, 0.7, 12]} />
            </mesh>
            <mesh position={p2} material={_laserPillarMaterial}>
              <cylinderGeometry args={[0.1, 0.12, 0.7, 12]} />
            </mesh>
            <mesh
              ref={(el) => {
                laserBeamMeshesRef.current[idx] = el;
              }}
              position={[gx, 0.35, gz]}
              material={_laserBeamMaterial}
            >
              <boxGeometry args={beamSize} />
            </mesh>
          </group>
        );
      })}

      {/* Hareketli Kinetik Devriye Engelleri (Moving Obstacles) */}
      {(movingObstacles ?? []).map((obs, idx) => (
        <mesh
          key={`moving-obs-${levelRevisionKey}-${idx}`}
          ref={(el) => {
            movingObstacleMeshesRef.current[idx] = el;
          }}
          position={[obs.center[0], 0.36, obs.center[1]]}
          material={_movingObstacleMaterial}
          castShadow
        >
          <cylinderGeometry args={[0.36, 0.38, 0.72, 16]} />
        </mesh>
      ))}
    </>
  );
}
