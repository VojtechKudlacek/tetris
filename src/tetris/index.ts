import Tools from './tools';
import PreRenderer from './preRenderer';
import Block from './block';
import { BLOCKS, KEYS, SIZES } from './const';
import { randomFromTo, createArray, create2DArray } from './utils';

class Tetris {
	// DOM
	private ctx: CanvasRenderingContext2D;
	// Subscribers
	private gameEndSubscriber: Function;
	// Render
	private animating: boolean = false;
	// PreRenderers
	// private menuPreRenderer: PreRenderer; // Menu screen
	private gamePreRenderer: PreRenderer; // Field with placed blocks + sidebar
	private nextBlockPreRenderer: PreRenderer; // Next block area
	// Game
	private score: number = 0;
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

	constructor(canvas: HTMLCanvasElement, gameEndSubscriber: Function) {
		this.ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
		this.gameEndSubscriber = gameEndSubscriber;
		// this.menuPreRenderer = new PreRenderer({ height: SIZES.GAME_HEIGHT, width: SIZES.GAME_WIDTH });
		this.gamePreRenderer = new PreRenderer({ height: SIZES.GAME_HEIGHT, width: SIZES.GAME_WIDTH });
		this.nextBlockPreRenderer = new PreRenderer({ height: SIZES.NEXT_BLOCK_AREA, width: SIZES.NEXT_BLOCK_AREA });
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
		return this.picker.splice(randomFromTo(0, this.picker.length - 1, true), 1)[0];
	}

	private isColiding(block: Block, { x, y }: Vector): boolean {
		for (let row = 0; row < block.tiles; row++) {
			for (let col = 0; col < block.tiles; col++) {
				if (block.value[row][col]) { // If block has value at current iterated position
					if (x + col < 0) { // If block is offscreen (left)
						return true;
					} else if ((x + col) >= SIZES.COL_COUNT) { // If block is offscreen (right)
						return true;
					} else if ((y + row) >= SIZES.ROW_COUNT) { // If block is offscreen (bottom)
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

	private checFilledRows(): void {
		let cleared = 0;
		let score = 0;
		for (let row = 0; row < SIZES.ROW_COUNT; row++) {
			let count = 0;
			for (let col = 0; col < SIZES.COL_COUNT; col++) {
				if (this.field[row][col]) {
					count++;
				}
			}
			if (count === SIZES.COL_COUNT) {
				cleared++;
				score += (cleared * 10);
				for (let col = 0; col < SIZES.COL_COUNT; col++) {
					const color = this.colorField[row][col] as Color;
					this.createParticles((col * SIZES.TILE) + SIZES.HALF_TILE, (row * SIZES.TILE) + SIZES.HALF_TILE, color.light, cleared * 10);
				}
				this.field.splice(row, 1);
				this.field.unshift(createArray<number>(SIZES.COL_COUNT, 0));
				this.colorField.splice(row, 1);
				this.colorField.unshift(createArray<null>(SIZES.COL_COUNT, null));
			}
		}
		this.score += score;
	}

	private replaceCurrentWithNextBlock(): void {
		this.currentBlock = this.nextBlock;
		this.nextBlock = this.pickRandomBlock();
	}

	private checkLoose(): void {
		for (let i = 0; i < this.field[0].length; i++) {
			if (this.field[0][i]) {
				this.animating = false;
				this.gameEndSubscriber();
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
	}

	// Game processing

	private processMove(): void {
		if (!this.isColiding(this.currentBlock, { x: this.currentBlock.x, y: this.currentBlock.y + 1 })) {
			this.currentBlock.setY(this.currentBlock.y + 1);
		} else {
			this.placeBlock();
			this.checFilledRows();
			this.checkLoose();
			this.replaceCurrentWithNextBlock();
			this.preDrawGame();
			this.preDrawNextBlock();
		}
	}

	private processParticles(): void {
		for(let i = 0; i < this.particles.length; i++){
			const particle = this.particles[i];
			particle.x += particle.vx;
			particle.y += particle.vy;
			particle.radius -= .02;
			if(particle.radius < 0) {
				this.particles.splice(i, 1);
				i--; // Don't forget to lower the index when removing record from array
			}
		}
	}

	// Drawing

	private drawCurrentBlock(): void {
		for (let row = 0; row < this.currentBlock.tiles; row++) {
			for (let col = 0; col < this.currentBlock.tiles; col++) {
				const isSolid = this.currentBlock.value[row][col];
				if (isSolid) {
					Tools.drawBlock(this.ctx, (this.currentBlock.x + col) * SIZES.TILE, (this.currentBlock.y + row) * SIZES.TILE, this.currentBlock.color);
				}
			}
		}
	}

	private drawParticles(): void {
		for(let i = 0; i < this.particles.length; i++){
			const particle = this.particles[i];
			this.ctx.beginPath();
			this.ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI*2, false);
			this.ctx.fillStyle = particle.color;
			this.ctx.fill();
		}
	}

	private preDrawGame(): void {
		this.gamePreRenderer.draw((ctx, w, h) => {
			// Fill are with black color
			Tools.fill(ctx, w, h, '#000000');
			// Draw filled blocks with its color
			for (let row = 0; row < SIZES.ROW_COUNT; row++) {
				for (let col = 0; col < SIZES.COL_COUNT; col++) {
					if (this.field[row][col]) {
						const color = this.colorField[row][col] as Color;
						Tools.drawBlock(ctx, col * SIZES.TILE, row * SIZES.TILE, color);
					}
				}
			}
			// Draw sidebar
			Tools.drawRect(ctx, SIZES.FIELD_WIDTH, 0, SIZES.SIDEBAR, SIZES.GAME_HEIGHT, '#111111');
			Tools.write(ctx, SIZES.FIELD_WIDTH + 8, 20, 'NEXT BLOCK', '#ffffff');
			Tools.write(ctx, SIZES.FIELD_WIDTH + 8, 140, 'SCORE', '#ffffff');
			Tools.write(ctx, SIZES.FIELD_WIDTH + 8, 160, String(this.score), '#ffffff');
		});
	}

	private preDrawNextBlock(): void {
		this.nextBlockPreRenderer.draw((ctx, w, h) => {
			// Fill are with black color
			Tools.fill(ctx, w, h, '#000000');
			// Draw the next block
			const drawTileSize = (SIZES.NEXT_BLOCK_AREA - (SIZES.NEXT_BLOCK_AREA_PADDING * 2)) / SIZES.NEXT_BLOCK_ARE_TILE_COUNT;
			// This is a bit of a hack, since all of the blocks are always vertically longer than horizontally
			const horizontalPadding = ((drawTileSize * (SIZES.NEXT_BLOCK_ARE_TILE_COUNT - this.nextBlock.preview[0].length)) / 2) + SIZES.NEXT_BLOCK_AREA_PADDING;
			const verticalPadding = ((drawTileSize * (SIZES.NEXT_BLOCK_ARE_TILE_COUNT - this.nextBlock.preview.length)) / 2) + SIZES.NEXT_BLOCK_AREA_PADDING;
			for (let row = 0; row < this.nextBlock.preview.length; row++) {
				for (let col = 0; col < this.nextBlock.preview[0].length; col++) {
					if (this.nextBlock.preview[row][col]) {
						const x = (col * drawTileSize) + horizontalPadding;
						const y = (row * drawTileSize) + verticalPadding;
						Tools.drawBlock(ctx, x, y, this.nextBlock.color, drawTileSize);
					}
				}
			}
		})
	}

	/**
	 * Rendering
	 */
	private render(): void {
		// Draw game
		Tools.drawPreRender(this.ctx, this.gamePreRenderer.get(), 0, 0);
		// Draw next block
		Tools.drawPreRender(this.ctx, this.nextBlockPreRenderer.get(), SIZES.FIELD_WIDTH + 5, 30);
		// Draw current block
		this.drawCurrentBlock();
		// Draw particles
		this.drawParticles();
	}

	/**
	 * Game processing
	 */
	private process(delta: number): void {
		this.processParticles();
		if (delta - this.lastUpdateTime > this.interval) {
			this.processMove();
			this.lastUpdateTime = delta;
		}
	}

	/**
	 * Game loop
	 * @param delta Time spent in game
	 */
	private loop = (delta: number): void => {
		if (this.animating) {
			this.render();
			this.process(delta);
		}
		requestAnimationFrame(this.loop)
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
			if (!this.animating && e.keyCode !== KEYS.P) {
				return;
			}
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
						this.pause();
					} else {
						this.start();
					}
					break;
				default:
					break
			}
		});
	}

	private gameSetup(): void {
		this.score = 0;
		this.field = create2DArray<number>(SIZES.ROW_COUNT, SIZES.COL_COUNT, 0);
		this.colorField = create2DArray<null>(SIZES.ROW_COUNT, SIZES.COL_COUNT, null);
		this.fillPicker();
		this.nextBlock = this.pickRandomBlock();
		this.currentBlock = this.pickRandomBlock();
		this.preDrawGame();
		this.preDrawNextBlock();
	}

	// EXPOSED

	public init(): void {
		this.gameSetup();
		this.registerEvents();
		requestAnimationFrame(this.loop);
	}

	public start(): void {
		this.animating = true;
	}

	public pause(): void {
		this.animating = false;
	}

	public restart(): void {
		this.gameSetup();
		this.start();
	}

}

export default Tetris;
