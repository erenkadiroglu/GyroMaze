export * from './levels/index.ts';

export {
  CUSTOM_MAP_URL_PARAM,
  MAX_ENCODED_MAP_LENGTH,
  parseCustomMazeLevel,
  encodeCustomMazeLevelForUrl,
  decodeCustomMazeLevelFromUrl,
} from '../../utils/customMapCodec.ts';

export {
  pickBestOpenDirection,
  EDITOR_GRID_SIZE,
  EDITOR_CELL_WORLD_SIZE,
  computeEditorBoostDirection,
  computeEditorLaserAxis,
  computeEditorMovingConfig,
  editorGridCellToWorld,
  worldToEditorGridCell,
  validateEditorGrid,
  levelDefinitionToEditorGrid,
  buildLevelFromEditorGrid,
} from '../../utils/editorCompiler.ts';
export type { EditorCellTool } from '../../utils/editorCompiler.ts';
