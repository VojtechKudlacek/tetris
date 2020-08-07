export const randomFromTo = (min: number, max: number): number => {
	return Math.floor(Math.random() * (max - min + 1) + min);
}

export const createArray = <T>(length: number, fill: T): Array<T> => {
	return Array.from({ length }, () => fill);
}

export const create2DArray = <T>(height: number, width: number, fill: T): Array<Array<T>> => {
	return Array.from({ length: height }, () => Array.from({ length: width }, () => fill));
}
