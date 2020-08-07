import Tools from './tools';
import { BLOCKS, KEYS, SIZES, COLORS } from './const';
import { randomFromTo, createArray, create2DArray } from './utils';

interface Particle {
	x: number;
	y: number;
	radius: number;
	vx: number;
	vy: number;
	r: number;
	g: number;
	b: number;
}

const createParticle = (x: number, y: number): Particle => ({
	x, y, radius: 2 + Math.random()*3,
	vx: -5 + Math.random()*10,
	vy: -5 + Math.random()*10,
	r: Math.round(Math.random())*255,
	g: Math.round(Math.random())*255,
	b: Math.round(Math.random())*255,
})

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
	private interval: number = 200;
	// Current block
	private currentBlock: Shape | null = null;
	private currentPos!: Vector;
	private currentColor!: Color;
	// Particles
	private particles: Array<Particle> = [];

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

	private rotate(block: Shape): Shape {
		const newBlock = [];
		for (let i = 0; i < block[0].length; i++) {
			let row = block.map(e => e[i]).reverse();
			newBlock.push(row);
		}
		return newBlock;
	}

	private isColiding(block: Shape, { x, y }: Vector): boolean {
		for (let i = 0; i < block.length; i++) { // i = row
			for (let j = 0; j < block[i].length; j++) { // j = col
				if (block[i][j]) {
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
		return false;
	}

	private checkRows(): void {
		for (let i = 0; i < this.field.length; i++) { // i = row
			let count = 0;
			for (let j = 0; j < this.field[i].length; j++) { // j = col
				if (this.field[i][j]) {
					count++;
				}
			}
			if (count === SIZES.COLS) {
				this.field.splice(i, 1);
				this.field.unshift(createArray<number>(SIZES.COLS, 0));
				this.colorField.splice(i, 1);
				this.colorField.unshift(createArray<null>(SIZES.COLS, null));
			}
		}
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
			this.checkRows();
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
			if (!this.isColiding(this.currentBlock, { x: this.currentPos.x, y: this.currentPos.y + 1 })) {
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
		for(let i = 0; i < this.particles.length; i++){
			const c = this.particles[i];
			this.ctx.beginPath();
			this.ctx.arc(c.x, c.y, c.radius, 0, Math.PI*2, false);
			this.ctx.fillStyle = "rgba("+c.r+", "+c.g+", "+c.b+", 0.5)";
			this.ctx.fill();
			c.x += c.vx;
			c.y += c.vy;
			c.radius -= .02;
			if(c.radius < 0) {
				this.particles.splice(i, 1);
				i--;
			}
		}
		console.log(this.particles.length);
	}

	private loop = (delta: number): void => {
		this.tools.clear(this.canvas.width, this.canvas.height, '#00040B');
		this.draw();

		if (delta - this.lastUpdateTime > this.interval) {
			this.processMove();
			this.lastUpdateTime = delta;
		}

		if (this.animating) {
			requestAnimationFrame(this.loop)
		}
	}

	private fillField(): void {
		this.field = create2DArray<number>(SIZES.ROWS, SIZES.COLS, 0);
		this.colorField = create2DArray<null>(SIZES.ROWS, SIZES.COLS, null);
	}

	private registerEvents(): void {
		this.canvas.addEventListener('click', (e) => {
			for (let i = 0; i < 200; i++) {
				this.particles.push(createParticle(e.offsetX, e.offsetY));
			}
		});
		window.addEventListener('keyup', (e) => {
			if (e.keyCode === KEYS.ARROW_DOWN) {
				this.interval = 200;
			}
		});
		window.addEventListener('keydown', (e) => {
			switch (e.keyCode) {
				case KEYS.ARROW_LEFT:
					if (!this.currentBlock) { break; }
					if (!this.isColiding(this.currentBlock, { x: this.currentPos.x - 1, y: this.currentPos.y })) {
						this.currentPos.x--;
					}
					break
				case KEYS.ARROW_RIGHT:
					if (!this.currentBlock) { break; }
					if (!this.isColiding(this.currentBlock, { x: this.currentPos.x + 1, y: this.currentPos.y })) {
						this.currentPos.x++;
					}
					break;
				case KEYS.ARROW_DOWN:
					this.interval = 50;
					break;
				case KEYS.ARROW_UP:
					this.currentPos.y--;
					break;
				case KEYS.SPACE:
					if (this.currentBlock) {
						const newBlock = this.rotate(this.currentBlock);
						if (!this.isColiding(newBlock, this.currentPos)) {
							this.currentBlock = newBlock;
						}
					}
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
		});
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
