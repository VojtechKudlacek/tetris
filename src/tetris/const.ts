import Block from 'tetris/Block';

export const COLORS = {
	BLUE: '#00D9FF',
	GREEN: '#13FF00',
	PURPLE: '#B200FF',
	ORANGE: '#FF8C00',
	PINK: '#FF00D1',
	RED: '#FF1C23',
	YELLOW: '#EAE800'
};

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

export const SIZES = {
	ROW_COUNT: 20,
	COL_COUNT: 10,
	TILE: 30,
	HALF_TILE: 15, // TILE / 2
	SIDEBAR: 102,
	NEXT_BLOCK_AREA: 90, // SIDEBAR - 10
	NEXT_BLOCK_AREA_PADDING: 5,
	NEXT_BLOCK_ARE_TILE_COUNT: 4,
	FIELD_WIDTH: 300, // TILE * COL_COUNT
	GAME_WIDTH: 402, // FIELD_WIDTH + SIDEBAR
	GAME_HEIGHT: 600, // TILE * ROW_COUNT
};

export const BLOCKS: Array<Block> = [
	new Block({
		minSize: 1,
		maxSize: 4,
		tiles: 4,
		defaultX: (SIZES.COL_COUNT / 2) - 2,
		defaultY: -2,
		value: [
			[0, 0, 0, 0],
			[1, 1, 1, 1],
			[0, 0, 0, 0],
			[0, 0, 0, 0]
		],
		color: COLORS.BLUE
	}),
	new Block({
		minSize: 2,
		maxSize: 3,
		tiles: 3,
		defaultX: (SIZES.COL_COUNT / 2) - 1,
		defaultY: -2,
		value: [
			[0, 0, 0],
			[1, 1, 1],
			[0, 0, 1]
		],
		color: COLORS.GREEN
	}),
	new Block({
		minSize: 2,
		maxSize: 3,
		tiles: 3,
		defaultX: (SIZES.COL_COUNT / 2) - 1,
		defaultY: -2,
		value: [
			[0, 0, 0],
			[1, 1, 1],
			[1, 0, 0]
		],
		color: COLORS.PURPLE
	}),
	new Block({
		minSize: 2,
		maxSize: 2,
		tiles: 2,
		defaultX: (SIZES.COL_COUNT / 2) - 1,
		defaultY: -2,
		value: [
			[1, 1],
			[1, 1]
		],
		color: COLORS.ORANGE
	}),
	new Block({
		minSize: 2,
		maxSize: 3,
		tiles: 3,
		defaultX: (SIZES.COL_COUNT / 2) - 1,
		defaultY: -2,
		value: [
			[0, 1, 1],
			[1, 1, 0],
			[0, 0, 0]
		],
		color: COLORS.PINK
	}),
	new Block({
		minSize: 2,
		maxSize: 3,
		tiles: 3,
		defaultX: (SIZES.COL_COUNT / 2) - 1,
		defaultY: -2,
		value: [
			[0, 0, 0],
			[1, 1, 1],
			[0, 1, 0]
		],
		color: COLORS.RED
	}),
	new Block({
		minSize: 2,
		maxSize: 3,
		tiles: 3,
		defaultX: (SIZES.COL_COUNT / 2) - 1,
		defaultY: -2,
		value: [
			[1, 1, 0],
			[0, 1, 1],
			[0, 0, 0]
		],
		color: COLORS.YELLOW
	})
];
