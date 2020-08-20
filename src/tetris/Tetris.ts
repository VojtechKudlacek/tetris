import Tools from 'tetris/classes/Tools';
import PreRenderer from 'tetris/classes/PreRenderer';
import DomManager from 'tetris/managers/DomManager';
import ScoreManager from 'tetris/managers/ScoreManager';
import FieldManager from 'tetris/managers/FieldManager';
import AudioManager from 'tetris/managers/AudioManager';
import ParticleFactory from 'tetris/factories/ParticleFactory';
import BlockFactory from 'tetris/factories/BlockFactory';
import * as CONST from 'tetris/const';
import * as utils from 'tetris/utils';

class Tetris {
	// DOM
	private ctx: CanvasRenderingContext2D;
	private domManager: DomManager;
	private audioManager: AudioManager = new AudioManager();
	// Render
	private animating: boolean = false;
	private inGame: boolean = false;
	// PreRenderers
	private gamePreRenderer: PreRenderer = new PreRenderer({ height: CONST.CANVAS_HEIGHT, width: CONST.CANVAS_WIDTH });
	private nextBlockPreRenderer: PreRenderer = new PreRenderer({ height: CONST.NEXT_BLOCK_AREA, width: CONST.NEXT_BLOCK_AREA });
	// Score
	private scoreManager: ScoreManager = new ScoreManager();
	// Game
	private fieldManager: FieldManager = new FieldManager();
	// Level
	private level: number = 0;
	private lastUpdateTime: number = 0;
	private interval: number = 200;
	private originalInterval: number = 200;
	// Block
	private blockFactory: BlockFactory = new BlockFactory();
	// Particles
	private particleFactory: ParticleFactory = new ParticleFactory();

	constructor(parent: HTMLElement) {
		this.domManager = new DomManager(parent);
		this.domManager.createCanvas();
		this.ctx = this.domManager.canvas.getContext('2d', { alpha: false }) as CanvasRenderingContext2D;
	}

	private loose(): void {
		this.scoreManager.updateHighScore();
		this.animating = false;
		this.domManager.showScreen('gameOver');
	}

	// Game processing

	private processMove(): void {
		const currentBlock = this.blockFactory.currentBlock;
		if (!this.fieldManager.isColiding(currentBlock, currentBlock.x, currentBlock.y + 1)) {
			currentBlock.setY(currentBlock.y + 1);
		} else {
			this.fieldManager.placeBlock(this.blockFactory.currentBlock);
			if (this.interval < this.originalInterval) {
				this.audioManager.play('FALL');
				this.blockFactory.currentBlock.iterate((row, col, value, block) => {
					if (value) {
						const x = ((col + block.x) * CONST.TILE_SIZE) + CONST.HALF_TILE_SIZE;
						const y = ((row + block.y) * CONST.TILE_SIZE) + CONST.HALF_TILE_SIZE;
						this.particleFactory.createParticles(x, y, block.color, 3, -1);
					}
				})
			}
			this.fieldManager.checkAndClearFilledRows((row, cleared) => {
				this.fieldManager.iterateCols(row, (col, _, color) => {
					const x = (col * CONST.TILE_SIZE) + CONST.HALF_TILE_SIZE;
					const y = (row * CONST.TILE_SIZE) + CONST.HALF_TILE_SIZE;
					this.particleFactory.createParticles(x, y, color, 5, (cleared * 3));
				});
				this.scoreManager.add(this.level, cleared - 1);
			});

			if (this.fieldManager.isBlockInFirstRow) {
				this.loose();
			} else {
				this.blockFactory.useNextBlock();
				this.preDrawGame();
				this.preDrawNextBlock();
			}
		}
	}

	// Drawing

	private drawCurrentBlock(): void {
		this.blockFactory.currentBlock.iterate((row, col, value, block) => {
			if (value) {
				const x = (block.x + col) * CONST.TILE_SIZE;
				const y = (block.y + row) * CONST.TILE_SIZE;
				Tools.drawBlock(this.ctx, x, y, block.color);
			}
		});
	}

	private preDrawGame(): void {
		this.gamePreRenderer.draw((ctx, w, h) => {
			// Fill are with black color
			Tools.fill(ctx, w, h, '#000000');
			// Draw filled blocks with its color
			this.fieldManager.iterate((row, col, value, color) => {
				if (value) {
					Tools.drawBlock(ctx, col * CONST.TILE_SIZE, row * CONST.TILE_SIZE, color);
				}
			});
			// Draw sidebar
			Tools.drawRect(ctx, CONST.GAME_WIDTH, 0, CONST.SIDEBAR_BORDER_WIDTH + CONST.SIDEBAR_WIDTH, CONST.CANVAS_HEIGHT, '#000000');
			Tools.drawLine(ctx, CONST.GAME_WIDTH + 1, 0, CONST.GAME_WIDTH + 1, CONST.CANVAS_HEIGHT, '#ffffff');
			Tools.write(ctx, CONST.GAME_WIDTH + 10, 20, 'NEXT BLOCK', '#ffffff');
			Tools.write(ctx, CONST.GAME_WIDTH + 10, 140, 'SCORE', '#ffffff');
			Tools.write(ctx, CONST.GAME_WIDTH + 10, 160, String(this.scoreManager.score), '#ffffff');
			Tools.write(ctx, CONST.GAME_WIDTH + 10, 180, 'HIGH SCORE', '#ffffff');
			Tools.write(ctx, CONST.GAME_WIDTH + 10, 200, String(this.scoreManager.highScore), '#ffffff');
		});
	}

	private preDrawNextBlock(): void {
		this.nextBlockPreRenderer.draw((ctx, w, h) => {
			// Fill are with black color
			Tools.fill(ctx, w, h, '#000000');
			// Draw the next block
			const drawTileSize = (CONST.NEXT_BLOCK_AREA - (CONST.NEXT_BLOCK_AREA_PADDING * 2)) / CONST.NEXT_BLOCK_ARE_TILE_COUNT;
			const nextBlock = this.blockFactory.nextBlock;
			// This is a bit of a hack, since all of the blocks are always vertically longer than horizontally
			const horizontalPadding = ((drawTileSize * (CONST.NEXT_BLOCK_ARE_TILE_COUNT - nextBlock.preview[0].length)) / 2) + CONST.NEXT_BLOCK_AREA_PADDING;
			const verticalPadding = ((drawTileSize * (CONST.NEXT_BLOCK_ARE_TILE_COUNT - nextBlock.preview.length)) / 2) + CONST.NEXT_BLOCK_AREA_PADDING;
			for (let row = 0; row < nextBlock.preview.length; row++) {
				for (let col = 0; col < nextBlock.preview[0].length; col++) {
					if (nextBlock.preview[row][col]) {
						const x = (col * drawTileSize) + horizontalPadding;
						const y = (row * drawTileSize) + verticalPadding;
						Tools.drawBlock(ctx, x, y, nextBlock.color, drawTileSize);
					}
				}
			}
		})
	}

	/**
	 * Rendering
	 */
	private render(): void {
		Tools.clear(this.ctx, CONST.CANVAS_WIDTH, CONST.CANVAS_HEIGHT);
		if (this.inGame) {
			// Draw game
			Tools.drawPreRender(this.ctx, this.gamePreRenderer.image, 0, 0);
			// Draw next block
			Tools.drawPreRender(this.ctx, this.nextBlockPreRenderer.image, CONST.GAME_WIDTH + 7, 30);
			// Draw particles
			this.particleFactory.drawParticles(this.ctx);
			// Draw current block
			this.drawCurrentBlock();
		} else {
			// Draw particles
			this.particleFactory.drawParticles(this.ctx);
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
		if (this.particleFactory.particles.length < CONST.MENU_PARTICLE_COUNT) {
			const colors = Object.values(CONST.COLORS);
			for (let i = this.particleFactory.particles.length; i < CONST.MENU_PARTICLE_COUNT; i++) {
				this.particleFactory.createParticle(
					Math.floor(CONST.CANVAS_WIDTH / 2),
					Math.floor(CONST.CANVAS_HEIGHT / 2),
					colors[utils.randomFromTo(0, colors.length - 1, true)],
					utils.randomFromTo(0, 10)
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
				case CONST.KEYS.UP:
				case CONST.KEYS.DOWN:
					this.interval = this.originalInterval;
					break;
				default:
					break
			}
		});

		window.addEventListener('keydown', (e) => {
			if (!this.animating && e.keyCode !== CONST.KEYS.P) {
				return;
			}
			const currentBlock = this.blockFactory.currentBlock;
			switch (e.keyCode) {
				case CONST.KEYS.LEFT:
					if (!this.fieldManager.isColiding(currentBlock, currentBlock.x - 1, currentBlock.y)) {
						currentBlock.setX(currentBlock.x - 1);
					}
					break
				case CONST.KEYS.RIGHT:
					if (!this.fieldManager.isColiding(currentBlock, currentBlock.x + 1, currentBlock.y)) {
						currentBlock.setX(currentBlock.x + 1);
					}
					break;
				case CONST.KEYS.DOWN:
					if (this.interval === this.originalInterval) {
						this.interval = 25;
					}
					break;
				case CONST.KEYS.UP:
					this.interval = Infinity;
					break;
				case CONST.KEYS.A: {
					const newBlock = currentBlock.duplicate();
					newBlock.rotateLeft();
					if (!this.fieldManager.isColiding(newBlock, newBlock.x, newBlock.y)) {
						this.blockFactory.currentBlock = newBlock;
					}
					break;
				}
				case CONST.KEYS.S: {
					const newBlock = currentBlock.duplicate();
					newBlock.rotateRight();
					if (!this.fieldManager.isColiding(newBlock, newBlock.x, newBlock.y)) {
						this.blockFactory.currentBlock = newBlock;
					}
					break;
				}
				case CONST.KEYS.P:
					if (this.inGame) {
						if (this.animating) {
							this.animating = false;
							this.domManager.showScreen('pause');
						} else {
							this.animating = true;
							this.domManager.showScreen('none');
						}
					}
					break;
				default:
					break
			}
		});
	}

	private gameSetup(): void {
		this.fieldManager.init();
		this.scoreManager.init();
		this.blockFactory.init();
		this.audioManager.init();
		this.preDrawGame();
		this.preDrawNextBlock();
	}

	private setLevel(level: number): void {
		this.level = level;
		const newInterval = 475 - (level * 25);
		this.originalInterval = newInterval;
		this.interval = newInterval;
	}

	private startGame(): void {
		this.animating = true;
		this.inGame = true;
		this.domManager.showScreen('none');
		this.gameSetup();
	}

	private endGame(): void {
		this.animating = true;
		this.inGame = false;
	}

	private onLevelSelect(level: number): void {
		this.setLevel(level);
		this.startGame();
	}

	private onMenu(): void {
		this.endGame();
		this.domManager.showScreen('menu');
	}

	// EXPOSED

	public init(): void {
		this.animating = true;
		this.gameSetup();
		this.domManager.init({
			onLevelSelect: this.onLevelSelect.bind(this),
			onRestart: this.startGame.bind(this),
			onMenu: this.onMenu.bind(this),
		});
		this.domManager.showScreen('menu');
		this.registerEvents();
		requestAnimationFrame(this.loop);
	}

}

export default Tetris;
