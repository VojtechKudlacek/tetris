export { COLORS } from './colors';
export { AVAILABLE_KEYS } from './keys';

/** Number of rows in the game */
export const ROW_COUNT = 20;
/** Number of columns in the game */
export const COL_COUNT = 10;
/** Number of pixels for one tile */
export const TILE_SIZE = 30;
/** Half of the number of pixels for one tile to save some calculations */
export const HALF_TILE_SIZE = Math.floor(TILE_SIZE / 2);
/** Width of the sidebar in pixels */
export const SIDEBAR_WIDTH = 100;
/** Width of the sidebar border in pixels */
export const SIDEBAR_BORDER_WIDTH = 2;
/** Size of the next block area in pixel with considered sidebar (outer) padding */
export const NEXT_BLOCK_AREA = SIDEBAR_WIDTH - 10;
/** Next block renderer inner padding */
export const NEXT_BLOCK_AREA_PADDING = 5;
/** Next block renderer grid size in tiles */
export const NEXT_BLOCK_ARE_TILE_COUNT = 4;
/** Width of the game in the renderer */
export const GAME_WIDTH = TILE_SIZE * COL_COUNT;
/** Width of the renderer */
export const CANVAS_WIDTH = GAME_WIDTH + SIDEBAR_BORDER_WIDTH + SIDEBAR_WIDTH;
/** Height of the renderer */
export const CANVAS_HEIGHT = TILE_SIZE * ROW_COUNT;
/** Number of particles in the menu */
export const MENU_PARTICLE_COUNT = 100;
/** Interval while holding key for speed boost */
export const SLAM_INTERVAL = 25;
/** Number of levels */
export const LEVEL_COUNT = 18;
/** Number of rows to be cleared for increasing the level */
export const ROWS_TO_INCREASE_LEVEL = 30;
/** Number of ticks to delay next block movement */
export const MOVEMENT_DELAY = 20;
