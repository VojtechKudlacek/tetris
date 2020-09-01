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

export const delay = async (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));
