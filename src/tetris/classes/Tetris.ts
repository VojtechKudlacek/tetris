// ¯\_(ツ)_/¯
import RenderingTools from 'tetris/classes/RenderingTools';
import DomManager from 'tetris/managers/DomManager';
import ScoreManager from 'tetris/managers/ScoreManager';
import ControlManager from 'tetris/managers/ControlManager';
import FieldManager from 'tetris/managers/FieldManager';
import AudioManager from 'tetris/managers/AudioManager';
import ParticleFactory from 'tetris/factories/ParticleFactory';
import BlockFactory from 'tetris/factories/BlockFactory';
import * as constants from 'tetris/const';
import * as utils from 'tetris/utils';
import * as components from 'tetris/domComponents';

class Tetris {

	private ctx: CanvasRenderingContext2D;
	// Managers
	private domManager: DomManager;
	private audioManager: AudioManager;
	private controlManager: ControlManager;
	private scoreManager: ScoreManager;
	private fieldManager: FieldManager;
	// Factories
	private blockFactory: BlockFactory;
	private particleFactory: ParticleFactory;
	// Rendering
	private renderingTools: RenderingTools;
	// Controls
	private pressedLeft: boolean = false;
	private pressedRight: boolean = false;
	private movementDelay: number = 0;
	// Game
	private isInGame: boolean = false;
	private isGameOver: boolean = false;
	private isPaused: boolean = false;

	private initialLevel: number = 0;
	private level: number = 0;
	private lastUpdateTime: number = 0;
	private interval: number = 200;
	private originalInterval: number = 200;

	constructor(parent: HTMLElement) {
		this.domManager = new DomManager(parent);
		this.domManager.createCanvas();
		// Since when does `.getContext('2d')` can return undefined?
		this.ctx = this.domManager.canvas.getContext('2d', { alpha: false }) as CanvasRenderingContext2D;
		this.audioManager = new AudioManager();
		this.controlManager = new ControlManager();
		this.scoreManager = new ScoreManager();
		this.fieldManager = new FieldManager();
		this.renderingTools = new RenderingTools(this.ctx);
		this.particleFactory = new ParticleFactory();
		this.blockFactory = new BlockFactory();
	}

	private gameOver(): void {
		this.scoreManager.updateHighScore();
		this.renderGameOver();
		this.isGameOver = true;
	}

	// Game processing

	private processMove(): void {
		const currentBlock = this.blockFactory.currentBlock;
		if (!this.fieldManager.isColiding(currentBlock, currentBlock.x, currentBlock.y + 1)) {
			currentBlock.y++;
		} else {
			this.fieldManager.placeBlock(this.blockFactory.currentBlock);
			if (this.interval <= constants.SLAM_INTERVAL) {
				this.blockFactory.currentBlock.iterate((row, col, value, block) => {
					if (value) {
						this.particleFactory.createParticles(
							((col + block.x) * constants.TILE_SIZE) + constants.HALF_TILE_SIZE,
							((row + block.y) * constants.TILE_SIZE) + constants.HALF_TILE_SIZE,
							block.color, 3, -1
						);
					}
				})
			}
			const clearedRows = this.fieldManager.clearFilledRows((row, cleared) => {
				this.fieldManager.iterateCols(row, (col, _, color) => {
					this.particleFactory.createParticles(
						(col * constants.TILE_SIZE) + constants.HALF_TILE_SIZE,
						(row * constants.TILE_SIZE) + constants.HALF_TILE_SIZE,
						color, 5, (cleared * 3)
					);
				});
				this.scoreManager.add(this.level, cleared - 1);
			});

			if (this.fieldManager.isBlockInFirstRow) {
				this.gameOver();
			} else {
				if (this.shouldIncreaseLevel) {
					this.increaseLevel();
				}
				this.blockFactory.useNextBlock();
				this.renderingTools.preDrawGame(this.fieldManager);
				this.renderingTools.preDrawNextBlock(this.blockFactory.nextBlock);
				if (clearedRows) {
					this.renderGameInterface();
				}
			}
		}
	}

	private get shouldIncreaseLevel(): boolean {
		return (this.level < constants.LEVEL_COUNT) &&
			(Math.floor(this.scoreManager.clearedRows / constants.ROWS_TO_INCREASE_LEVEL) > (this.level - this.initialLevel));
	}

	/**
	 * Rendering
	 */
	private render(): void {
		this.renderingTools.clear();
		if (this.isInGame) {
			//* Draw game
			this.renderingTools.drawGame();
			//* Draw next block
			if (!this.isGameOver) {
				this.renderingTools.drawNextBlock();
			}
			//* Draw current block
			this.renderingTools.drawCurrentBlock(this.blockFactory.currentBlock);
		}
		//* Draw particles
		this.particleFactory.drawParticles(this.ctx);
	}

	private moveBlockLeft(): void {
		const currentBlock = this.blockFactory.currentBlock;
		if (!this.fieldManager.isColiding(currentBlock, currentBlock.x - 1, currentBlock.y)) {
			currentBlock.x--;
		}
	}

	private moveBlockRight(): void {
		const currentBlock = this.blockFactory.currentBlock;
		if (!this.fieldManager.isColiding(currentBlock, currentBlock.x + 1, currentBlock.y)) {
			currentBlock.x++;
		}
	}

	private processControls(): void {
		if (this.movementDelay === 0) {
			if (this.pressedLeft) {
				this.moveBlockLeft();
				this.movementDelay++;
			}
			if (this.pressedRight) {
				this.moveBlockRight();
				this.movementDelay++;
			}
		} else if (this.movementDelay > 0) {
			this.movementDelay--;
		}
	}

	private processGame(delta: number): void {
		if (delta - this.lastUpdateTime > this.interval) {
			this.processMove();
			this.lastUpdateTime = delta;
		}
	}

	private processMenu(): void {
		if (this.particleFactory.particles.length < constants.MENU_PARTICLE_COUNT) {
			const colors = Object.values(constants.COLORS);
			for (let i = this.particleFactory.particles.length; i < constants.MENU_PARTICLE_COUNT; i++) {
				this.particleFactory.createParticle(
					Math.floor(constants.CANVAS_WIDTH / 2),
					Math.floor(constants.CANVAS_HEIGHT / 2),
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
		if (!this.isPaused) {
			this.processControls();
			this.particleFactory.processParticles();
			if (this.isInGame && !this.isGameOver) {
				this.processGame(delta);
			} else if (!this.isInGame) {
				this.processMenu();
			}
			this.render();
		}
		requestAnimationFrame(this.loop)
	}

	private initControls(): void {
		this.controlManager.init();
		this.controlManager.setListener('keydown', (keyCode, controls) => {
			const currentBlock = this.blockFactory.currentBlock;

			switch (keyCode) {
				case controls.PAUSE:
					this.isPaused = !this.isPaused;
					this.isPaused ? this.renderPause() : this.renderGameInterface();
					break;
				case controls.DOWN:
					this.interval = constants.SLAM_INTERVAL;
					break;
				case controls.UP:
					this.interval = Infinity; // TODO: Remove this
					break;
				case controls.LEFT:
					if (!this.pressedLeft) {
						this.pressedLeft = true;
						this.movementDelay = constants.MOVEMENT_DELAY;
						this.moveBlockLeft();
					}
					break;
				case controls.RIGHT:
					if (!this.pressedRight) {
						this.pressedRight = true;
						this.movementDelay = constants.MOVEMENT_DELAY;
						this.moveBlockRight();
					}
					break;
				case controls.ROTATE_LEFT: {
					const newBlock = currentBlock.duplicate();
					newBlock.rotateLeft();
					if (!this.fieldManager.isColiding(newBlock, newBlock.x, newBlock.y)) {
						this.blockFactory.currentBlock = newBlock;
					}
					break;
				}
				case controls.ROTATE_RIGHT: {
					const newBlock = currentBlock.duplicate();
					newBlock.rotateRight();
					if (!this.fieldManager.isColiding(newBlock, newBlock.x, newBlock.y)) {
						this.blockFactory.currentBlock = newBlock;
					}
					break;
				}
			}
		});

		this.controlManager.setListener('keyup', (keyCode, controls) => {
			switch (keyCode) {
				case controls.DOWN:
				case controls.UP:
					this.interval = this.originalInterval;
					break;
				case controls.LEFT:
					this.pressedLeft = false;
					break;
				case controls.RIGHT:
					this.pressedRight = false;
					break;
			}
		});
	}

	private recalculateInterval(): void {
		this.originalInterval = 475 - (this.level * 25);
		this.interval = this.originalInterval;
	}

	private gameSetup(): void {
		this.isGameOver = false;
		this.level = this.initialLevel;
		this.recalculateInterval();
		this.fieldManager.init();
		this.blockFactory.init();
		this.audioManager.init();
		this.scoreManager.init();
		this.controlManager.init();
		this.renderingTools.preDrawGame(this.fieldManager);
		this.renderingTools.preDrawNextBlock(this.blockFactory.nextBlock);
	}

	private increaseLevel(): void {
		this.level++;
		this.recalculateInterval();
	}

	private setLevel(level: number): void {
		this.initialLevel = level;
		this.level = level;
	}

	private startGame(): void {
		this.isInGame = true;
		this.gameSetup();
		this.renderGameInterface();
	}

	private endGame(): void {
		this.isInGame = false;
	}

	private onLevelSelect(level: number): void {
		this.setLevel(level);
		this.startGame();
	}

	private onMenu(): void {
		this.endGame();
		this.renderMenu();
	}

	// Render

	private renderGameInterface(): void {
		this.domManager.renderComponent(components.GameInterface, {
			score: String(this.scoreManager.score),
			highScore: String(this.scoreManager.highScore),
			keys: this.controlManager.controls,
			clearedRows: String(this.scoreManager.clearedRows),
			level: String(this.level),
		});
	}

	private renderMenu(): void {
		this.domManager.renderComponent(components.Menu, { onLevelSelect: this.onLevelSelect.bind(this) })
	}

	private renderPause(): void {
		this.domManager.renderComponent(components.Pause, null);
	}

	private renderGameOver(): void {
		this.domManager.renderComponent(components.GameOver, {
			score: String(this.scoreManager.score),
			highScore: String(this.scoreManager.highScore),
			onMenu: this.onMenu.bind(this),
			onRestart: this.startGame.bind(this),
		});
	}

	// Exposed

	public init(): void {
		this.initControls();
		this.gameSetup();
		this.domManager.init();
		this.renderMenu();
		requestAnimationFrame(this.loop);
	}

}

export default Tetris;
