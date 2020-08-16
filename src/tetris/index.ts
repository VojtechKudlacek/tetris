import Tools from './tools';
// import PreRenderer from './prerenderer';
import Block from './block';
import { BLOCKS, KEYS, SIZES, COLORS } from './const';
import { randomFromTo, createArray, create2DArray } from './utils';

class Tetris {
	// Tools
	private tools: Tools;
	// PreRenderers
	// private menuPreRenderer: PreRenderer;
	// private gamePreRenderer: PreRenderer;
	// private nextBlockPreRenderer: PreRenderer;
	// DOM
	private ctx: CanvasRenderingContext2D;
	// Render
	private animating: boolean = false;
	// Game
	private field: Field = [];
	private colorField: Field<Color | null> = [];
	private picker: Array<Block> = [];
	// Time
	private lastUpdateTime: number = 0;
	private interval: number = 200;
	private originalInterval: number = 200;
	// Block
	private nextBlock!: Block;
	private currentBlock!: Block;
	// Particles
	private particles: Array<Particle> = [];

	constructor(canvas: HTMLCanvasElement) {
		this.ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
		this.tools = new Tools(this.ctx);
	}

	private fillPicker(): void {
		// Takes predefined blocks and duplicate them
		this.picker = BLOCKS.map((block) => block.duplicate());
	}

	private pickRandomBlock(): Block {
		if (!this.picker.length) {
			// If picker is empty, refill it
			this.fillPicker();
		}
		// Remove one block from the picker and return it
		return this.picker.splice(randomFromTo(0, this.picker.length - 1), 1)[0];
	}

	private isColiding(block: Block, { x, y }: Vector): boolean {
		for (let row = 0; row < block.tiles; row++) {
			for (let col = 0; col < block.tiles; col++) {
				if (block.value[row][col]) { // If block has value at current iterated position
					if (x + col < 0) { // If block is offscreen (left)
						return true;
					} else if ((x + col) >= SIZES.COLS) { // If block is offscreen (right)
						return true;
					} else if ((y + row) >= SIZES.ROWS) { // If block is offscreen (bottom)
						return true;
					}
					if (this.field[y + row] && this.field[y + row][x + col]) { // If block coliding with another placed block
						return true;
					}
				}
			}
		}
		return false;
	}

	private createParticles(x: number, y: number, color: string, amount: number): void {
		for (let i = 0; i < amount; i++) {
			this.particles.push({ x, y, radius: randomFromTo(2, 5), vx: randomFromTo(-5, 5), vy: randomFromTo(-5, 5), color });
		}
	}

	private checFilledkRows(): void {
		let cleared = 0;
		for (let row = 0; row < this.field.length; row++) {
			let count = 0;
			for (let col = 0; col < this.field[row].length; col++) {
				if (this.field[row][col]) {
					count++;
				}
			}
			if (count === SIZES.COLS) {
				cleared++;
				for (let col = 0; col < SIZES.COLS; col++) {
					const color = this.colorField[row][col] as Color;
					this.createParticles((col * SIZES.TILE) + SIZES.HALF_TILE, (row * SIZES.TILE) + SIZES.HALF_TILE, color.light, cleared * 10);
				}
				this.field.splice(row, 1);
				this.field.unshift(createArray<number>(SIZES.COLS, 0));
				this.colorField.splice(row, 1);
				this.colorField.unshift(createArray<null>(SIZES.COLS, null));
			}
		}
	}

	private replaceCurrentWithNextBlock(): void {
		this.currentBlock = this.nextBlock;
		this.nextBlock = this.pickRandomBlock();
	}

	private checkLoose(): void {
		for (let i = 0; i < this.field[0].length; i++) {
			if (this.field[0][i]) {
				this.restart();
				break;
			}
		}
	}

	private placeBlock(): void {
		for (let row = 0; row < this.currentBlock.tiles; row++) {
			for (let col = 0; col < this.currentBlock.tiles; col++) {
				if (this.currentBlock.value[row][col]) {
					const rowToPlace = row + this.currentBlock.y;
					if (rowToPlace < 0) {
						break;
					}
					this.field[rowToPlace][col + this.currentBlock.x] = 1;
					this.colorField[rowToPlace][col + this.currentBlock.x] = this.currentBlock.color;
				}
			}
		}
		this.checFilledkRows();
		this.checkLoose();
		this.replaceCurrentWithNextBlock();
	}

	private processMove(): void {
		if (!this.isColiding(this.currentBlock, { x: this.currentBlock.x, y: this.currentBlock.y + 1 })) {
			this.currentBlock.setY(this.currentBlock.y + 1);
		} else {
			this.placeBlock();
		}
	}

	private drawNextBlock(x: number, y: number, drawSize: number): void {
		// TODO: Add to prerenderer
		if (this.nextBlock) {
			const padding = 15;
			const drawTileSize = (drawSize - (padding * 2)) / this.nextBlock.maxSize;
			const bonusPadding = (drawTileSize * (this.nextBlock.maxSize - this.nextBlock.minSize)) / 2;
			for (let row = 0; row < this.nextBlock.tiles; row++) {
				for (let col = 0; col < this.nextBlock.tiles; col++) {
					if (this.nextBlock.value[row][col]) {
						const xPos = (col * drawTileSize) + x + padding;
						const yPos = (row * drawTileSize) + y + padding + bonusPadding;
						this.tools.setColor(this.nextBlock.color.dark);
						this.tools.draw(xPos, yPos, drawTileSize, drawTileSize);
						this.tools.setColor(this.nextBlock.color.light);
						this.tools.draw(xPos + 2, yPos + 2, drawTileSize - 2, drawTileSize - 2);
					}
				}
			}
		}
	}

	private drawOverlay(): void {
		// TODO: Add to prerenderer
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
		for (let row = 0; row < this.field.length; row++) {
			for (let col = 0; col < this.field[row].length; col++) {
				if (this.field[row][col]) {
					const color = this.colorField[row][col] as Color;
					this.tools.setColor(color.dark);
					this.tools.draw(col * SIZES.TILE, row * SIZES.TILE, SIZES.TILE, SIZES.TILE);
					this.tools.setColor(color.light);
					this.tools.draw(col * SIZES.TILE + 2, row * SIZES.TILE + 2, SIZES.TILE - 2, SIZES.TILE - 2);
				}
			}
		}
		if (this.currentBlock) {
			for (let row = 0; row < this.currentBlock.tiles; row++) { // i = row
				for (let col = 0; col < this.currentBlock.tiles; col++) { // j = col
					const isSolid = this.currentBlock.value[row][col];
					if (isSolid) {
						this.tools.setColor(this.currentBlock.color.dark);
						this.tools.draw((this.currentBlock.x + col) * SIZES.TILE, (this.currentBlock.y + row) * SIZES.TILE, SIZES.TILE, SIZES.TILE);
						this.tools.setColor(this.currentBlock.color.light);
						this.tools.draw((this.currentBlock.x + col) * SIZES.TILE + 2, (this.currentBlock.y + row) * SIZES.TILE + 2, SIZES.TILE - 2, SIZES.TILE - 2);
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
				i--; // Don't forget to lower the index when removing record from array
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

	private registerEvents(): void {
		window.addEventListener('keyup', (e) => {
			switch (e.keyCode) {
				case KEYS.UP:
				case KEYS.DOWN:
					this.interval = this.originalInterval;
					break;
				default:
					break
			}
		});
		window.addEventListener('keydown', (e) => {
			switch (e.keyCode) {
				case KEYS.LEFT:
					if (!this.isColiding(this.currentBlock, { x: this.currentBlock.x - 1, y: this.currentBlock.y })) {
						this.currentBlock.setX(this.currentBlock.x - 1);
					}
					break
				case KEYS.RIGHT:
					if (!this.isColiding(this.currentBlock, { x: this.currentBlock.x + 1, y: this.currentBlock.y })) {
						this.currentBlock.setX(this.currentBlock.x + 1);
					}
					break;
				case KEYS.DOWN:
					if (this.interval === this.originalInterval) {
						this.interval = Math.floor(this.interval / 4);
					}
					break;
				case KEYS.UP:
					this.interval = Infinity;
					break;
				case KEYS.A: {
					const newBlock = this.currentBlock.duplicate();
					newBlock.rotateLeft();
					if (!this.isColiding(newBlock, newBlock.getPosition())) {
						this.currentBlock = newBlock;
					}
					break;
				}
				case KEYS.S: {
					const newBlock = this.currentBlock.duplicate();
					newBlock.rotateRight();
					if (!this.isColiding(newBlock, newBlock.getPosition())) {
						this.currentBlock = newBlock;
					}
					break;
				}
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
		this.field = create2DArray<number>(SIZES.ROWS, SIZES.COLS, 0);
		this.colorField = create2DArray<null>(SIZES.ROWS, SIZES.COLS, null);
		this.fillPicker();
		this.nextBlock = this.pickRandomBlock();
		this.currentBlock = this.pickRandomBlock();
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
