export { COLORS } from './colors';
export { AVAILABLE_KEYS } from './keys';

// Game sizes
export const ROW_COUNT = 20;
export const COL_COUNT = 10;
// Render tile size
export const TILE_SIZE = 30;
export const HALF_TILE_SIZE = Math.floor(TILE_SIZE / 2);
// Sidebar
export const SIDEBAR_WIDTH = 100;
export const SIDEBAR_BORDER_WIDTH = 2;
// Next block area
export const NEXT_BLOCK_AREA = SIDEBAR_WIDTH - 10;
export const NEXT_BLOCK_AREA_PADDING = 5;
export const NEXT_BLOCK_ARE_TILE_COUNT = 4;
// Game and canvas
export const GAME_WIDTH = TILE_SIZE * COL_COUNT;
export const CANVAS_WIDTH = GAME_WIDTH + SIDEBAR_BORDER_WIDTH + SIDEBAR_WIDTH;
export const CANVAS_HEIGHT = TILE_SIZE * ROW_COUNT;
// Menu
export const MENU_PARTICLE_COUNT = 100;
// Speed
export const SLAM_INTERVAL = 25;
// Levels
export const LEVEL_COUNT = 18;
export const ROWS_TO_INCREASE_LEVEL = 30;
