import Block from 'tetris/block';

export const BLOCKS: Array<Block> = [
	new Block({
		minSize: 1,
		maxSize: 4,
		value: [
			[0, 0, 0, 0],
			[1, 1, 1, 1],
			[0, 0, 0, 0],
			[0, 0, 0, 0]
		],
		color: { light: '', dark: '' }
	}),
	new Block({
		minSize: 1,
		maxSize: 4,
		value: [
			[1, 0, 0],
			[1, 1, 1],
			[0, 0, 0]
		],
		color: { light: '', dark: '' }
	}),
	new Block({
		minSize: 1,
		maxSize: 4,
		value: [
			[0, 0, 1],
			[1, 1, 1],
			[0, 0, 0]
		],
		color: { light: '', dark: '' }
	}),
	new Block({
		minSize: 1,
		maxSize: 4,
		value: [
			[1, 1],
			[1, 1]
		],
		color: { light: '', dark: '' }
	}),
	new Block({
		minSize: 1,
		maxSize: 4,
		value: [
			[0, 1, 1],
			[1, 1, 0],
			[0, 0, 0]
		],
		color: { light: '', dark: '' }
	}),
	new Block({
		minSize: 1,
		maxSize: 4,
		value: [
			[0, 1, 0],
			[1, 1, 1],
			[0, 0, 0]
		],
		color: { light: '', dark: '' }
	}),
	new Block({
		minSize: 1,
		maxSize: 4,
		value: [
			[1, 1, 0],
			[0, 1, 1],
			[0, 0, 0]
		],
		color: { light: '', dark: '' }
	})
];

export const KEYS = {
	ARROW_LEFT: 37,
	ARROW_UP: 38,
	ARROW_RIGHT: 39,
	ARROW_DOWN: 40,
	SPACE: 32,
	P: 80,
};

export const COLORS = {
	lightBlue: { light: '#99E5E3', dark: '#3DB5F3' },
	blue: { light: '#5099E7', dark: '#104F9C' },
	purple: { light: '#D5A8EA', dark: '#8419B3' },
	red: { light: '#E18700', dark: '#A32109' },
	orange: { light: '#E9AB00', dark: '#CD5E02' },
	yellow: { light: '#EFD76B', dark: '#EEA73C' },
	green: { light: '#CCE900', dark: '#2B930C' },
};

export const SIZES = {
	ROWS: 20,
	COLS: 10,
	TILE: 30,
	SIDEBAR: 100,
};
