type BlockTypes = 'I' | 'J' | 'L' | 'O' | 'S' | 'T' | 'Z';

type KnownKeys = 'ARROW_LEFT' | 'ARROW_UP' | 'ARROW_RIGHT' | 'ARROW_DOWN' | 'SPACE';

type Sizes = 'WIDTH' | 'HEIGHT' | 'GAME_WIDTH' | 'TILE';

type Shape = Array<Array<number>>;

type Color = 'lightBlue' | 'blue' | 'purple' | 'red' | 'orange' | 'yellow' | 'green';

interface ColorSchema {
	light: string;
	dark: string;
}

type Board = Array<Array<Color>>;
