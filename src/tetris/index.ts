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
	private colorField: Board<Color | null> = [];
	private pickerA: Array<Shape> = [];
	private pickerB: Array<Shape> = [];
	// Time
	private lastUpdateTime: number = 0;
	// Current block
	private currentBlock: Shape | null = null;
	private currentPos!: Vector;
	private currentColor!: Color;

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

	private pickRandomBlock(): Shape {
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

	private isColiding({ x, y }: Vector): boolean {
		if (this.currentBlock) {
			for (let i = 0; i < this.currentBlock.length; i++) { // i = row
				for (let j = 0; j < this.currentBlock[i].length; j++) { // j = col
					if (this.currentBlock[i][j]) {
						if (x + j < 0) {
							return true;
						} else if ((x + j) >= SIZES.COLS) {
							return true;
						} else if ((y + i) >= SIZES.ROWS) {
							return true;
						}
						if (this.field[y + i] && this.field[y + i][x + j]) {
							return true;
						}
					}
				}
			}
		}
		return false;
	}

	private placeBlock(): void {
		if (this.currentBlock) {
			for (let i = 0; i < this.currentBlock.length; i++) { // i = row
				for (let j = 0; j < this.currentBlock[i].length; j++) { // j = col
					if (this.currentBlock[i][j]) {
						this.field[i + this.currentPos.y][j + this.currentPos.x] = 1;
						this.colorField[i + this.currentPos.y][j + this.currentPos.x] = this.currentColor;
					}
				}
			}
		}
		this.currentBlock = null;
	}

	private processMove(): void {
		if (!this.currentBlock) {
			this.currentBlock = this.pickRandomBlock();
			this.currentColor = this.getRandomColor();
			this.currentPos = {
				x: (SIZES.COLS / 2) - Math.floor(this.currentBlock.length),
				y: -4,
			}
		} else {
			if (!this.isColiding({ x: this.currentPos.x, y: this.currentPos.y + 1 })) {
				this.currentPos.y++;
			} else {
				this.placeBlock();
			}
		}
	}

	private draw(): void {
		this.tools.setColor('#000000');
		for (let i = 0; i < this.field.length; i++) { // i = row
			for (let j = 0; j < this.field[i].length; j++) { // j = col
				if (this.field[i][j]) {
					const color = this.colorField[i][j] as Color;
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
		if (this.currentBlock) {
			for (let i = 0; i < this.currentBlock.length; i++) { // i = row
				for (let j = 0; j < this.currentBlock[i].length; j++) { // j = col
					const isSolid = this.currentBlock[i][j];
					if (isSolid) {
						this.tools.setColor(COLORS[this.currentColor].dark);
						this.tools.draw((this.currentPos.x + j) * SIZES.TILE, (this.currentPos.y + i) * SIZES.TILE, SIZES.TILE, SIZES.TILE);
						this.tools.setColor(COLORS[this.currentColor].light);
						this.tools.draw((this.currentPos.x + j) * SIZES.TILE + 2, (this.currentPos.y + i) * SIZES.TILE + 2, SIZES.TILE - 4, SIZES.TILE - 4);
					}
				}
			}
		}
	}

	private loop = (delta: number): void => {
		this.tools.clear(this.canvas.width, this.canvas.height, '#00040B');
		this.draw();

		if (delta - this.lastUpdateTime > 200) {
			this.processMove();
			this.lastUpdateTime = delta;
		}

		if (this.animating) {
			requestAnimationFrame(this.loop)
		}
	}

	private fillField(): void {
		this.field = Array.from({ length: SIZES.ROWS }, () => Array.from({ length: SIZES.COLS }, () => 0));
		this.colorField = Array.from({ length: SIZES.ROWS }, () => Array.from({ length: SIZES.COLS }, () => null));
	}

	private registerEvents(): void {
		window.addEventListener('keydown', (e) => {
			switch(e.keyCode) {
				case KEYS.ARROW_LEFT:
					if (!this.isColiding({ x: this.currentPos.x - 1, y: this.currentPos.y })) {
						this.currentPos.x--;
					}
					break
				case KEYS.ARROW_RIGHT:
					if (!this.isColiding({ x: this.currentPos.x + 1, y: this.currentPos.y })) {
						this.currentPos.x++;
					}
					break;
				case KEYS.ARROW_DOWN:
					this.currentPos.y++;
					break;
				case KEYS.ARROW_UP:
					this.currentPos.y--;
					break;
				case KEYS.P:
					if (this.animating) {
						this.stop();
					} else {
						this.start();
					}
					break;
				default:
					break
			}
		})
	}

	// EXPOSED

	public init() {
		this.fillField();
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
