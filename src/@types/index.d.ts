interface LooseObject<T = any> {
	[key: string]: T;
}

interface Vector {
	x: number;
	y: number;
}

interface Size {
	w: number;
	h: number;
}
