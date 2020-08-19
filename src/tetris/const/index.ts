export const KEYS = {
	LEFT: 37,
	UP: 38,
	RIGHT: 39,
	DOWN: 40,
	SPACE: 32,
	P: 80,
	A: 65,
	S: 83,
};

export const COLORS = {
	BLUE: '#00D9FF',
	GREEN: '#13FF00',
	PURPLE: '#B200FF',
	ORANGE: '#FF8C00',
	PINK: '#FF00D1',
	RED: '#FF1C23',
	YELLOW: '#EAE800'
};

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
export const NEXT_BLOCK_AREA = SIDEBAR_WIDTH - SIDEBAR_BORDER_WIDTH - 10;
export const NEXT_BLOCK_AREA_PADDING = 5;
export const NEXT_BLOCK_ARE_TILE_COUNT = 4;
// Game and canvas
export const GAME_WIDTH = TILE_SIZE * COL_COUNT;
export const CANVAS_WIDTH = GAME_WIDTH + SIDEBAR_BORDER_WIDTH + SIDEBAR_WIDTH;
export const CANVAS_HEIGHT = TILE_SIZE * ROW_COUNT;
