import Block from 'tetris/block';

type ColorOptions = 'BLUE' | 'GREEN' | 'LIGHT_BLUE' | 'ORANGE' | 'PURPLE' | 'RED' | 'YELLOW';
export const COLORS: Record<ColorOptions, Color> = {
	BLUE: { light: '#5099E7', dark: '#104F9C' },
	GREEN: { light: '#CCE900', dark: '#2B930C' },
	LIGHT_BLUE: { light: '#99E5E3', dark: '#3DB5F3' },
	ORANGE: { light: '#E9AB00', dark: '#CD5E02' },
	PURPLE: { light: '#D5A8EA', dark: '#8419B3' },
	RED: { light: '#E18700', dark: '#A32109' },
	YELLOW: { light: '#EFD76B', dark: '#EEA73C' },
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
	SIDEBAR: 100,
	NEXT_BLOCK_AREA: 90, // SIDEBAR - 10
	NEXT_BLOCK_AREA_PADDING: 15,
	FIELD_WIDTH: 300, // TILE * COL_COUNT
	GAME_WIDTH: 400, // FIELD_WIDTH + SIDEBAR
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
			[1, 0, 0],
			[1, 1, 1],
			[0, 0, 0]
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
			[0, 0, 1],
			[1, 1, 1],
			[0, 0, 0]
		],
		color: COLORS.LIGHT_BLUE
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
		color: COLORS.PURPLE
	}),
	new Block({
		minSize: 2,
		maxSize: 3,
		tiles: 3,
		defaultX: (SIZES.COL_COUNT / 2) - 1,
		defaultY: -2,
		value: [
			[0, 1, 0],
			[1, 1, 1],
			[0, 0, 0]
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
