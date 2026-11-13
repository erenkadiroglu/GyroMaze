import {
  resolveBoardBaseConfig,
  resolveGridHelperConfig,
  type BoardBaseConfig,
  type GridHelperConfig,
} from './stageUtils.ts';

export interface MazeStageBoardBaseOptions {
  boardSize: number;
  isLightBoard: boolean;
}

export interface BoardBaseMeshProps {
  position: [number, number, number];
  boxArgs: [number, number, number];
  receiveShadow: true;
}

export interface ResolvedMazeStageBoardBaseState {
  boardSize: number;
  isLightBoard: boolean;
  baseConfig: BoardBaseConfig;
  gridConfig: GridHelperConfig;
  meshProps: BoardBaseMeshProps;
  telemetrySummary: string;
}

/**
 * 3B Tahta alt gövde mesh'i için prop paketini hazırlar.
 */
export function resolveBoardBaseMeshProps(boardSize: number): BoardBaseMeshProps {
  const baseConfig = resolveBoardBaseConfig(boardSize);
  return {
    position: baseConfig.position,
    boxArgs: baseConfig.boxArgs,
    receiveShadow: true,
  };
}

/**
 * 3B Tahta tabanı ve ızgarası için tek satırlık telemetri ve hata ayıklama dizesi üretir.
 */
export function formatMazeStageBoardBaseTelemetry(
  boardSize: number,
  isLightBoard: boolean,
): string {
  const safeSize = Number.isFinite(boardSize) && boardSize > 0 ? Math.floor(boardSize) : 12;
  const themeText = isLightBoard ? 'Aydınlık Zemin' : 'Karanlık Zemin';
  const gridConfig = resolveGridHelperConfig(safeSize, isLightBoard);
  const sizeText = gridConfig.size.toFixed(1);

  return `3B Tahta Tabanı: ${safeSize}x${safeSize} (${themeText}) | Izgara: ${sizeText} birim, ${gridConfig.divisions} bölme | Taban: [${safeSize}.0, 0.5, ${safeSize}.0]`;
}

/**
 * 3B Tahta tabanı ve ızgara yardımcısının tüm durumunu tek bir saf nesnede toplar.
 */
export function resolveMazeStageBoardBaseState({
  boardSize,
  isLightBoard,
}: MazeStageBoardBaseOptions): ResolvedMazeStageBoardBaseState {
  const safeSize = Number.isFinite(boardSize) && boardSize > 0 ? Math.floor(boardSize) : 12;
  const baseConfig = resolveBoardBaseConfig(safeSize);
  const gridConfig = resolveGridHelperConfig(safeSize, isLightBoard);
  const meshProps = resolveBoardBaseMeshProps(safeSize);
  const telemetrySummary = formatMazeStageBoardBaseTelemetry(safeSize, isLightBoard);

  return {
    boardSize: safeSize,
    isLightBoard,
    baseConfig,
    gridConfig,
    meshProps,
    telemetrySummary,
  };
}

