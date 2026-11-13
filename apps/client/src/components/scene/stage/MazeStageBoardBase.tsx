'use client';

import {
  resolveBoardBaseConfig,
  resolveGridHelperConfig,
} from '@/utils/stageUtils';
import { _boardMaterial } from '../sceneMaterials';

interface MazeStageBoardBaseProps {
  boardSize: number;
  isLightBoard: boolean;
}

/**
 * 3B Labirent tahta tabanı ve ızgara yardımcısı (gridHelper) bileşeni.
 */
export function MazeStageBoardBase({
  boardSize,
  isLightBoard,
}: MazeStageBoardBaseProps) {
  const baseConfig = resolveBoardBaseConfig(boardSize);
  const gridConfig = resolveGridHelperConfig(boardSize, isLightBoard);

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

