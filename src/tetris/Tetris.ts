import Tools from 'tetris/Tools';
import PreRenderer from 'tetris/PreRenderer';
import ParticleFactory from 'tetris/ParticleFactory';
import Block from 'tetris/Block';
import Utils from 'tetris/Utils';
import ScoreManager from 'tetris/ScoreManager';
import { BLOCKS, KEYS, SIZES, COLORS } from 'tetris/const';

class Tetris {
	// DOM
	private ctx: CanvasRenderingContext2D;
	// Subscribers
	private gameEndSubscriber: Function;
	// Render
	private animating: boolean = false;
	private inGame: boolean = false;
	// PreRenderers
	private gamePreRenderer: PreRenderer = new PreRenderer({ height: SIZES.GAME_HEIGHT, width: SIZES.GAME_WIDTH });
	private nextBlockPreRenderer: PreRenderer = new PreRenderer({ height: SIZES.NEXT_BLOCK_AREA, width: SIZES.NEXT_BLOCK_AREA });
	// Score
	private scoreManager: ScoreManager = new ScoreManager();
	// Game
	private field: Field = [];
	private colorField: Field<string | null> = [];
	private picker: Array<Block> = [];
	// Level
	private level: number = 0;
	private lastUpdateTime: number = 0;
	private interval: number = 200;
	private originalInterval: number = 200;
	// Block
	private nextBlock!: Block;
	private currentBlock!: Block;
	// Particles
	private particleFactory: ParticleFactory = new ParticleFactory();

	constructor(canvas: HTMLCanvasElement, gameEndSubscriber: Function) {
		this.ctx = canvas.getContext('2d', { alpha: false }) as CanvasRenderingContext2D;
		this.gameEndSubscriber = gameEndSubscriber;
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
		return this.picker.splice(Utils.randomFromTo(0, this.picker.length - 1, true), 1)[0];
	}

	private checFilledRows(): void {
		let cleared = 0;
		for (let row = 0; row < SIZES.ROW_COUNT; row++) {
			let count = 0;
			for (let col = 0; col < SIZES.COL_COUNT; col++) {
				if (this.field[row][col]) {
					count++;
				}
			}
			if (count === SIZES.COL_COUNT) {
				cleared++;
				for (let col = 0; col < SIZES.COL_COUNT; col++) {
					const color = this.colorField[row][col] as string;
					this.particleFactory.createParticles((col * SIZES.TILE) + SIZES.HALF_TILE, (row * SIZES.TILE) + SIZES.HALF_TILE, color, 5, (cleared * 2));
				}
				this.field.splice(row, 1);
				this.field.unshift(Utils.createArray<number>(SIZES.COL_COUNT, 0));
				this.colorField.splice(row, 1);
				this.colorField.unshift(Utils.createArray<null>(SIZES.COL_COUNT, null));
				this.scoreManager.add(this.level, cleared - 1);
			}
		}
	}

	private replaceCurrentWithNextBlock(): void {
		this.currentBlock = this.nextBlock;
		this.nextBlock = this.pickRandomBlock();
	}

	private loose(): void {
		this.scoreManager.updateHighScore();
		this.animating = false;
		this.gameEndSubscriber();
	}

	private checkLoose(): void {
		for (let i = 0; i < this.field[0].length; i++) {
			if (this.field[0][i]) {
				this.loose();
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
		if (!Utils.isColiding(this.currentBlock, this.field, { x: this.currentBlock.x, y: this.currentBlock.y + 1 })) {
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

	// Drawing

	private drawCurrentBlock(): void {
		for (let row = 0; row < this.currentBlock.tiles; row++) {
			for (let col = 0; col < this.currentBlock.tiles; col++) {
				if (this.currentBlock.value[row][col]) {
					Tools.drawBlock(this.ctx, (this.currentBlock.x + col) * SIZES.TILE, (this.currentBlock.y + row) * SIZES.TILE, this.currentBlock.color);
				}
			}
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
						const color = this.colorField[row][col] as string;
						Tools.drawBlock(ctx, col * SIZES.TILE, row * SIZES.TILE, color);
					}
				}
			}
			// Draw sidebar
			Tools.drawRect(ctx, SIZES.FIELD_WIDTH, 0, SIZES.SIDEBAR, SIZES.GAME_HEIGHT, '#000000');
			Tools.drawLine(ctx, SIZES.FIELD_WIDTH + 1, 0, SIZES.FIELD_WIDTH + 1, SIZES.GAME_HEIGHT, '#ffffff');
			Tools.write(ctx, SIZES.FIELD_WIDTH + 10, 20, 'NEXT BLOCK', '#ffffff');
			Tools.write(ctx, SIZES.FIELD_WIDTH + 10, 140, 'SCORE', '#ffffff');
			Tools.write(ctx, SIZES.FIELD_WIDTH + 10, 160, String(this.scoreManager.Score), '#ffffff');
			Tools.write(ctx, SIZES.FIELD_WIDTH + 10, 180, 'HIGH SCORE', '#ffffff');
			Tools.write(ctx, SIZES.FIELD_WIDTH + 10, 200, String(this.scoreManager.HighScore), '#ffffff');
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

	private drawMenuBox(): void {
		const centerX = Math.floor(SIZES.GAME_WIDTH / 2);
		const centerY = Math.floor(SIZES.GAME_HEIGHT / 2);
		const boxWidth = 250;
		const boxHeight = 140;
		Tools.drawRect(this.ctx, centerX - (boxWidth / 2), centerY - (boxHeight / 2), boxWidth, boxHeight, '#000000');
		Tools.strokeRect(this.ctx, centerX - (boxWidth / 2), centerY - (boxHeight / 2), boxWidth, boxHeight, '#ffffff', 2);
	}

	/**
	 * Rendering
	 */
	private render(): void {
		Tools.clear(this.ctx, SIZES.GAME_WIDTH, SIZES.GAME_HEIGHT);
		if (this.inGame) {
			// Draw game
			Tools.drawPreRender(this.ctx, this.gamePreRenderer.get(), 0, 0);
			// Draw next block
			Tools.drawPreRender(this.ctx, this.nextBlockPreRenderer.get(), SIZES.FIELD_WIDTH + 7, 30);
			// Draw particles
			this.particleFactory.drawParticles(this.ctx);
			// Draw current block
			this.drawCurrentBlock();
		} else {
			// Draw particles
			this.particleFactory.drawParticles(this.ctx);
			// Draw menu
			this.drawMenuBox();
		}
	}

	/**
	 * Game processing
	 */
	private processGame(delta: number): void {
		this.particleFactory.processParticles();
		if (delta - this.lastUpdateTime > this.interval) {
			this.processMove();
			this.lastUpdateTime = delta;
		}
	}

	private processMenu(): void {
		this.particleFactory.processParticles();
		if (this.particleFactory.particles.length < 50) {
			const colors = Object.values(COLORS);
			for (let i = this.particleFactory.particles.length; i < 50; i++) {
				this.particleFactory.createParticle(
					Math.floor(SIZES.GAME_WIDTH / 2),
					Math.floor(SIZES.GAME_HEIGHT / 2),
					colors[Utils.randomFromTo(0, colors.length - 1, true)],
					Utils.randomFromTo(0, 10)
				);
			}
		}
	}

	/**
	 * Game loop
	 * @param delta Time spent in game
	 */
	private loop = (delta: number): void => {
		if (this.animating) {
			this.render();
			if (this.inGame) {
				this.processGame(delta);
			} else {
				this.processMenu();
			}
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
					if (!Utils.isColiding(this.currentBlock, this.field, { x: this.currentBlock.x - 1, y: this.currentBlock.y })) {
						this.currentBlock.setX(this.currentBlock.x - 1);
					}
					break
				case KEYS.RIGHT:
					if (!Utils.isColiding(this.currentBlock, this.field, { x: this.currentBlock.x + 1, y: this.currentBlock.y })) {
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
					if (!Utils.isColiding(newBlock, this.field, newBlock.getPosition())) {
						this.currentBlock = newBlock;
					}
					break;
				}
				case KEYS.S: {
					const newBlock = this.currentBlock.duplicate();
					newBlock.rotateRight();
					if (!Utils.isColiding(newBlock, this.field, newBlock.getPosition())) {
						this.currentBlock = newBlock;
					}
					break;
				}
				case KEYS.P:
					if (this.animating) {
						this.animating = false;
					} else {
						this.animating = true;
					}
					break;
				default:
					break
			}
		});
	}

	private gameSetup(): void {
		this.scoreManager.restart();
		this.field = Utils.create2DArray<number>(SIZES.ROW_COUNT, SIZES.COL_COUNT, 0);
		this.colorField = Utils.create2DArray<null>(SIZES.ROW_COUNT, SIZES.COL_COUNT, null);
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
		this.animating = true;
		requestAnimationFrame(this.loop);
	}

	public setLevel(level: number): void {
		this.level = level;
		const newInterval = 500 - (level * 25);
		this.originalInterval = newInterval;
		this.interval = newInterval;
	}

	public startGame(): void {
		this.animating = true;
		this.inGame = true;
		this.gameSetup();
	}

	public endGame(): void {
		this.animating = true;
		this.inGame = false;
	}

}

export default Tetris;
