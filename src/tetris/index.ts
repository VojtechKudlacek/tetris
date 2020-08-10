import Tools from './tools';
import { BLOCKS, KEYS, SIZES, COLORS } from './const';
import { randomFromTo, createArray, create2DArray, getBlockSizes } from './utils';

interface Particle {
	x: number;
	y: number;
	radius: number;
	vx: number;
	vy: number;
	color: string;
}

class Tetris {
	// Tools
	private tools: Tools;
	// DOM
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
	private originalInterval: number = 200;
	// Current block
	private currentBlock!: Shape;
	private currentColor!: Color;
	private currentPos!: Vector;
	// Next block
	private nextBlock?: Shape;
	private nextColor?: Color;
	// Particles
	private particles: Array<Particle> = [];

	constructor(canvas: HTMLCanvasElement) {
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

	private createParticles(x: number, y: number, color: string, amount: number): void {
		for (let i = 0; i < amount; i++) {
			this.particles.push({
				x,
				y,
				radius: 2 + Math.random()*3,
				vx: -5 + Math.random()*10,
				vy: -5 + Math.random()*10,
				color,
			});
		}
	}

	private checkRows(): void {
		const halfTile = Math.floor(SIZES.TILE / 2);
		for (let i = 0; i < this.field.length; i++) { // i = row
			let count = 0;
			for (let j = 0; j < this.field[i].length; j++) { // j = col
				if (this.field[i][j]) {
					count++;
				}
			}
			if (count === SIZES.COLS) {
				for (let j = 0; j < SIZES.COLS; j++) {
					const color = this.colorField[i][j] as Color;
					this.createParticles((j * SIZES.TILE) + halfTile, (i * SIZES.TILE) + halfTile, COLORS[color].light, 10);
				}
				this.field.splice(i, 1);
				this.field.unshift(createArray<number>(SIZES.COLS, 0));
				this.colorField.splice(i, 1);
				this.colorField.unshift(createArray<null>(SIZES.COLS, null));
			}
		}
	}

	private replaceCurrentWithNextBlock(): void {
		this.currentBlock = this.nextBlock as Shape;
		this.nextBlock = undefined;
		this.currentColor = this.nextColor as Color;
		this.nextColor = undefined;
		const sizes = getBlockSizes(this.currentBlock);
		this.currentPos = {
			x: (SIZES.COLS / 2) - Math.floor(Math.max(sizes.w, sizes.h)),
			y: -3,
		}
		this.checkBlocks(); // To fill the next block
	}

	private placeBlock(): void {
		for (let i = 0; i < this.currentBlock.length; i++) { // i = row
			for (let j = 0; j < this.currentBlock[i].length; j++) { // j = col
				if (this.currentBlock[i][j]) {
					const row = i + this.currentPos.y;
					if (row < 0) {
						break;
					}
					this.field[row][j + this.currentPos.x] = 1;
					this.colorField[row][j + this.currentPos.x] = this.currentColor;
				}
			}
		}
		this.checkRows();
		this.replaceCurrentWithNextBlock();
	}

	private checkBlocks(): void {
		if (!this.nextBlock) {
			this.nextBlock = this.pickRandomBlock();
			this.nextColor = this.getRandomColor();
		}
		if (!this.currentBlock) {
			this.replaceCurrentWithNextBlock();
		}
	}

	private checkLoose(): void {
		for (let i = 0; i < this.field[0].length; i++) {
			if (this.field[0][i]) {
				this.restart();
				break;
			}
		}
	}

	private processMove(): void {
		this.checkBlocks();
		this.checkLoose();
		if (!this.isColiding(this.currentBlock, { x: this.currentPos.x, y: this.currentPos.y + 1 })) {
			this.currentPos.y++;
		} else {
			this.placeBlock();
		}
	}

	private drawNextBlock(x: number, y: number, drawSize: number): void {
		if (this.nextBlock) {
			const padding = 15;
			const blockSize = getBlockSizes(this.nextBlock);
			const maxBlockSize = Math.max(blockSize.h, blockSize.w);
			const minBlockSize = Math.min(blockSize.h, blockSize.w);
			const tileSize = (drawSize - (padding * 2)) / maxBlockSize;
			const bonusPadding = (tileSize * (maxBlockSize - minBlockSize)) / 2;
			const color = this.nextColor as Color;
			for (let i = 0; i < this.nextBlock.length; i++) {
				for (let j = 0; j < this.nextBlock[i].length; j++) {
					if (this.nextBlock[i][j]) {
						const xPos = (j * tileSize) + x + padding;
						const yPos = (i * tileSize) + y + padding + bonusPadding;
						this.tools.setColor(COLORS[color].dark);
						this.tools.draw(xPos, yPos, tileSize, tileSize);
						this.tools.setColor(COLORS[color].light);
						this.tools.draw(xPos + 2, yPos + 2, tileSize - 2, tileSize - 2);
					}
				}
			}
		}
	}

	private drawOverlay(): void {
		const offset = SIZES.COLS * SIZES.TILE;
		this.tools.setColor('#444444');
		this.tools.draw(offset, 0, SIZES.SIDEBAR, SIZES.ROWS * SIZES.TILE);
		this.tools.setColor('#ffffff');
		this.tools.write(offset + 8, 20, 'NEXT BLOCK');
		this.tools.setColor('#000000');
		this.tools.draw(offset + 5, 30, SIZES.SIDEBAR - 10, SIZES.SIDEBAR - 10);
		this.drawNextBlock(offset + 5, 30, SIZES.SIDEBAR - 10);
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
					this.tools.draw(j * SIZES.TILE + 2, i * SIZES.TILE + 2, SIZES.TILE - 2, SIZES.TILE - 2);
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
						this.tools.draw((this.currentPos.x + j) * SIZES.TILE + 2, (this.currentPos.y + i) * SIZES.TILE + 2, SIZES.TILE - 2, SIZES.TILE - 2);
					}
				}
			}
		}
		for(let i = 0; i < this.particles.length; i++){
			const particle = this.particles[i];
			this.ctx.beginPath();
			this.ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI*2, false);
			this.ctx.fillStyle = particle.color;
			this.ctx.fill();
			particle.x += particle.vx;
			particle.y += particle.vy;
			particle.radius -= .02;
			if(particle.radius < 0) {
				this.particles.splice(i, 1);
				i--;
			}
		}
	}

	private render = (delta: number): void => {
		this.tools.clear(SIZES.COLS * SIZES.TILE, SIZES.ROWS * SIZES.TILE, '#000000');
		this.drawOverlay();
		this.draw();

		if (delta - this.lastUpdateTime > this.interval) {
			this.processMove();
			this.lastUpdateTime = delta;
		}

		if (this.animating) {
			requestAnimationFrame(this.render)
		}
	}

	private fillField(): void {
		this.field = create2DArray<number>(SIZES.ROWS, SIZES.COLS, 0);
		this.colorField = create2DArray<null>(SIZES.ROWS, SIZES.COLS, null);
	}

	private registerEvents(): void {
		window.addEventListener('keyup', (e) => {
			switch (e.keyCode) {
				case KEYS.ARROW_UP:
				case KEYS.ARROW_DOWN:
					this.interval = this.originalInterval;
					break;
				default:
					break
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
					this.interval = Infinity;
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

	public init(withoutEvents = false) {
		this.fillField();
		if (!withoutEvents) {
			this.registerEvents();
		}
		this.drawOverlay();
	}

	public start() {
		this.animating = true;
		requestAnimationFrame(this.render);
	}

	public stop() {
		this.animating = false;
	}

	public restart() {
		this.init(true);
	}

}

export default Tetris;
