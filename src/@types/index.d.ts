interface Dictionary<T = any> {
	[key: string]: T;
}

interface NumDictionary<T = any> {
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

type KeyboardListener = (e: KeyboardEvent) => void;

type Component<P = {}> = (props: P) => HTMLElement;
