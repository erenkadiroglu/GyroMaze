'use client';

import { useMazeStageBoardBase } from '@/hooks/useMazeStageBoardBase';
import { _boardMaterial } from '../sceneMaterials';

export interface MazeStageBoardBaseProps {
  boardSize: number;
  isLightBoard: boolean;
}

/**
 * 3B Labirent tahta tabanı ve ızgara yardımcısı (gridHelper) bileşeni.
 * useMazeStageBoardBase kancası üzerinden saf orkestrasyon motoru tarafından beslenir.
 */
export function MazeStageBoardBase(props: MazeStageBoardBaseProps) {
  const { baseConfig, gridConfig } = useMazeStageBoardBase(props);

  return (
    <>
      <mesh
        position={baseConfig.position}
        material={_boardMaterial}
        receiveShadow
      >
        <boxGeometry args={baseConfig.boxArgs} />
      </mesh>

      <gridHelper
        key={gridConfig.key}
        args={[
          gridConfig.size,
          gridConfig.divisions,
          gridConfig.colorCenterLine,
          gridConfig.colorGrid,
        ]}
        position={gridConfig.position}
      />
    </>
  );
}
