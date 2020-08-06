import Tools from './tools';
import { BLOCKS, KEYS, SIZES, COLORS } from './const';
import { randomFromTo } from './utils';

class Tetris {
	// Tools
	private tools: Tools;
	// DOM
	private canvas: HTMLCanvasElement;
	private ctx: CanvasRenderingContext2D;
	// Render
	private animating: boolean = false;
	// Game
	private field: Board = [];
	private pickerA: Array<Shape> = [];
	private pickerB: Array<Shape> = [];

	constructor(canvas: HTMLCanvasElement) {
		this.canvas = canvas;
		this.ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
		this.tools = new Tools(this.ctx);
	}

	private fillPickers(): void {
		const source = Object.values(BLOCKS);
		// Welp, remove the god damn references for modifying the arrays later
		this.pickerA = JSON.parse(JSON.stringify(source));
		this.pickerB = JSON.parse(JSON.stringify(source));
	}

	private pickRandomShape(): Shape {
		// Fill pickers if both empty
		if (!this.pickerA.length && !this.pickerB.length) {
			this.fillPickers();
		}
		// Return from emptier picker to make sure picking is pseudo-random
		if (this.pickerA.length > this.pickerB.length) {
			return this.pickerA.splice(randomFromTo(0, this.pickerA.length - 1), 1)[0];
		}
		return this.pickerB.splice(randomFromTo(0, this.pickerB.length - 1), 1)[0];
	}

	private getRandomColor(): Color {
		const colors = Object.keys(COLORS) as Array<Color>;
		return colors[randomFromTo(0, colors.length - 1)];
	}

	private draw(): void {
		this.tools.setColor('#000000');
		for (let i = 0; i < this.field.length; i++) { // i = row
			for (let j = 0; j < this.field[i].length; j++) { // j = col
				if (this.field[i][j]) {
					const color = this.field[i][j] as Color;
					this.tools.setColor(COLORS[color].dark);
					this.tools.draw(j * SIZES.TILE, i * SIZES.TILE, SIZES.TILE, SIZES.TILE);
					this.tools.setColor(COLORS[color].light);
					this.tools.draw(j * SIZES.TILE + 2, i * SIZES.TILE + 2, SIZES.TILE - 4, SIZES.TILE - 4);
				} else {
					this.tools.setColor('#012046');
					this.tools.draw(j * SIZES.TILE + 1, i * SIZES.TILE + 1, SIZES.TILE - 2, SIZES.TILE - 2);
				}
			}
		}
	}

	private loop = (delta: number): void => {
		this.tools.clear(this.canvas.width, this.canvas.height, '#00040B');
		this.draw();

		if (this.animating) {
			requestAnimationFrame(this.loop)
		}
	}

	private registerEvents() {
		window.addEventListener('keydown', (e) => {
			switch(e.keyCode) {
				case KEYS.ARROW_LEFT:
					break
				default:
					break
			}
		})
	}

	// EXPOSED

	public init() {
		this.field = Array(20).fill(null).map(() => Array(10).fill(null));
		const color = this.getRandomColor();
		const shape = this.pickRandomShape().map((row) => row.map((col) => col ? color : null));
		shape.forEach((row, rowIndex) => row.forEach((col, colIndex) => this.field[rowIndex][colIndex] = col))
		console.log(shape);
		this.registerEvents();
	}

	public start() {
		this.animating = true;
		requestAnimationFrame(this.loop);
	}

	public stop() {
		this.animating = false;
	}

	public restart() {
		// TODO
	}

}

export default Tetris;
