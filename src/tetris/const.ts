type BLOCKS_KEYS = 'I' | 'J' | 'L' | 'O' | 'S' | 'T' | 'Z';
export const BLOCKS: Record<BLOCKS_KEYS, Shape> = {
	I: [
		[0, 0, 0, 0],
		[1, 1, 1, 1],
		[0, 0, 0, 0],
		[0, 0, 0, 0]
	],
	J: [
		[1, 0, 0],
		[1, 1, 1],
		[0, 0, 0]
	],
	L: [
		[0, 0, 1],
		[1, 1, 1],
		[0, 0, 0]
	],
	O: [
		[1, 1],
		[1, 1]
	],
	S: [
		[0, 1, 1],
		[1, 1, 0],
		[0, 0, 0]
	],
	T: [
		[0, 1, 0],
		[1, 1, 1],
		[0, 0, 0]
	],
	Z: [
		[1, 1, 0],
		[0, 1, 1],
		[0, 0, 0]
	]
};

type KEYS_KEYS = 'ARROW_LEFT' | 'ARROW_UP' | 'ARROW_RIGHT' | 'ARROW_DOWN' | 'SPACE' | 'P';
export const KEYS: Record<KEYS_KEYS, number> = {
	ARROW_LEFT: 37,
	ARROW_UP: 38,
	ARROW_RIGHT: 39,
	ARROW_DOWN: 40,
	SPACE: 32,
	P: 80,
};

export const COLORS: Record<Color, ColorSchema> = {
	lightBlue: { light: '#99E5E3', dark: '#3DB5F3' },
	blue: { light: '#5099E7', dark: '#104F9C' },
	purple: { light: '#D5A8EA', dark: '#8419B3' },
	red: { light: '#E18700', dark: '#A32109' },
	orange: { light: '#E9AB00', dark: '#CD5E02' },
	yellow: { light: '#EFD76B', dark: '#EEA73C' },
	green: { light: '#CCE900', dark: '#2B930C' },
};


type SIZES_KEYS = 'ROWS' | 'COLS' | 'TILE';
export const SIZES: Record<SIZES_KEYS, number> = {
	ROWS: 20,
	COLS: 10,
	TILE: 30,
};
