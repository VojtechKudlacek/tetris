type LooseObject<T = any> = { [key: string]: T };

type Shape = Array<Array<number>>;

type Board<T = number> = Array<Array<T>>;

type Color = 'lightBlue' | 'blue' | 'purple' | 'red' | 'orange' | 'yellow' | 'green';

interface ColorSchema {
	light: string;
	dark: string;
}

interface Vector {
	x: number;
	y: number;
}
