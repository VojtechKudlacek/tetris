export const randomFromTo = (min: number, max: number): number => {
	return Math.floor(Math.random() * (max - min + 1) + min);
}

export const createArray = <T>(length: number, fill: T): Array<T> => {
	return Array.from({ length }, () => fill);
}

export const create2DArray = <T>(height: number, width: number, fill: T): Array<Array<T>> => {
	return Array.from({ length: height }, () => Array.from({ length: width }, () => fill));
}

export const getBlockSizes = (block: Shape): Size => {
	const tmpW: Array<number> = []
	let h: number = 0;
	let contains: boolean;
	for (let i = 0; i < block.length; i++) {
		contains = false;
		for (let j = 0; j < block[i].length; j++) {
			tmpW[j] = tmpW[j] || block[i][j];
			if (block[i][j]) {
				contains = true;
			}
		}
		if (contains) { h++ }
	}
	return {
		h,
		w: tmpW.reduce((a, v) => a + v, 0),
	};
}
