type Field<T = number> = Array<Array<T>>;

interface Color {
	light: string;
	dark: string;
}

interface Vector {
	x: number;
	y: number;
}

interface Size {
	w: number;
	h: number;
}

interface Particle extends Vector {
	vx: number;
	vy: number;
	radius: number;
	color: string;
}
