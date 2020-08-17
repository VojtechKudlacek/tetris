import Block from 'tetris/Block';
import { SIZES } from 'tetris/const';

export const randomFromTo = (min: number, max: number, floored: boolean = false): number => {
	const random = Math.random() * (max - min + 1) + min;
	return floored ? Math.floor(random) : random;
};

export const createArray = <T>(length: number, fill: T): Array<T> => {
	return Array.from({ length }, () => fill);
};

export const create2DArray = <T>(height: number, width: number, fill: T): Array<Array<T>> => {
	return Array.from({ length: height }, () => Array.from({ length: width }, () => fill));
};

export const isColiding = (block: Block, field: Field, pos: Vector): boolean => {
	const { x, y } = pos;
	for (let row = 0; row < block.tiles; row++) {
		for (let col = 0; col < block.tiles; col++) {
			if (block.value[row][col]) { // If block has value at current iterated position
				if (x + col < 0) { // If block is offscreen (left)
					return true;
				} else if ((x + col) >= SIZES.COL_COUNT) { // If block is offscreen (right)
					return true;
				} else if ((y + row) >= SIZES.ROW_COUNT) { // If block is offscreen (bottom)
					return true;
				}
				if (field[y + row] && field[y + row][x + col]) { // If block coliding with another placed block
					return true;
				}
			}
		}
	}
	return false;
};
